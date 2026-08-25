-- 3DShiba Store — esquema recomendado
-- Correr en Supabase → SQL Editor.
-- Es idempotente: se puede re-ejecutar.

-- =============================================================================
-- products
-- =============================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  category text not null default 'figuras',
  image_url text,
  featured boolean not null default false,
  stock integer not null default 0, -- legado; la tienda es a pedido, no se usa en la UI
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists name text;
alter table public.products add column if not exists title text;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists price numeric(10, 2);
alter table public.products add column if not exists category text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists image_urls jsonb default '[]'::jsonb;
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists stock integer default 0;
alter table public.products add column if not exists created_at timestamptz default now();

update public.products set title = name where (title is null or title = '') and name is not null;
update public.products set name = title where (name is null or name = '') and title is not null;

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- =============================================================================
-- profiles (roles)
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;

insert into public.profiles (id, email, role)
select id, email, 'user'
from auth.users
on conflict (id) do nothing;

-- Promové tu usuario (descomentar y poner tu email):
-- update public.profiles set role = 'admin' where email = 'TU_EMAIL';

-- Fuera del API de PostgREST (no aparece en /rest/v1/rpc).
create schema if not exists internal;
revoke all on schema internal from public, anon;
grant usage on schema internal to authenticated;

-- ponytail: SECURITY DEFINER evita que RLS de profiles tape el chequeo de admin.
create or replace function internal.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function internal.is_admin() from public, anon;
grant execute on function internal.is_admin() to authenticated;

-- =============================================================================
-- RLS products
-- =============================================================================

alter table public.products enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products for select
  using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (internal.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (internal.is_admin())
  with check (internal.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (internal.is_admin());

-- =============================================================================
-- RLS profiles
-- =============================================================================

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- El rol se cambia solo desde el SQL Editor (evitar recursión RLS y auto-promoción).
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Con sesión de usuario (anon/authenticated) nadie puede ponerse admin.
  -- El SQL Editor no tiene JWT (auth.uid() es null) y sí puede promover.
  if tg_op = 'INSERT' and new.role is distinct from 'user' and auth.uid() is not null then
    new.role := 'user';
  end if;

  if tg_op = 'UPDATE' and new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'No se puede cambiar el rol';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_role() from public, anon, authenticated;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before insert or update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- =============================================================================
-- Storage: product-images
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- El bucket es público: la URL alcanza para ver el archivo. Sin SELECT en
-- storage.objects, el cliente no puede listar todo el bucket.
drop policy if exists "Public read product images" on storage.objects;

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and internal.is_admin()
  );

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and internal.is_admin()
  );

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and internal.is_admin()
  );

-- =============================================================================
-- orders (historial de pedidos por usuario)
-- =============================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists items jsonb default '[]'::jsonb;
alter table public.orders add column if not exists total numeric(10, 2) default 0;
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists seen_at timestamptz;
alter table public.orders add column if not exists fulfillment_status text default 'pending';
alter table public.orders add column if not exists created_at timestamptz default now();

update public.orders
set fulfillment_status = 'pending'
where fulfillment_status is null or fulfillment_status = '';

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own orders" on public.orders;
drop policy if exists "Users can delete own orders" on public.orders;

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders"
  on public.orders for select
  to authenticated
  using (internal.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (internal.is_admin())
  with check (internal.is_admin());

-- RPCs viejos: ya no hacen falta (RLS + internal.is_admin). Fuera del REST.
drop function if exists public.admin_list_orders();
drop function if exists public.admin_set_order_status(uuid, text);
drop function if exists public.is_admin();
