# Contexto — 3DShiba Store

Fuente de verdad del producto. Actualizar este archivo cuando cambie una decisión, el stack o el próximo paso. No duplicar acá detalles que ya están en el código.

## Contexto general

- **Nombre:** 3DShiba Store
- **Tipo:** E-commerce de un emprendimiento de impresiones 3D (figuras, accesorios, mates, vasos, juegos). Ubicación de marca: Mar del Plata.
- **Objetivo:** Tienda web moderna, rápida y segura: landing, catálogo con filtrado, autenticación de usuarios y panel administrativo.

## Alcance del taller

- **Solo impresión FDM.** No hay resina ni otras tecnologías. No vender ni filtrar “resina” en copy, categorías o admin.
- **Pedidos a medida:** el cliente manda el archivo (STL/3MF/etc.). Canal WhatsApp (`CustomQuoteButton` + `formatCustomPrintQuote`). Sin formulario de cotización ni uploader.
- **No modelamos.** Solo imprimimos a pedido. No decir que hacemos modelos 3D ni resina.
- Tras el checkout WhatsApp, un modal pregunta si el mensaje salió. Solo si confirman que sí se vacía el carrito.

## Flujo de compra (crítico)

La tienda **no** usa pasarelas de pago (ni Stripe, ni Mercado Pago).

El carrito, al hacer checkout, junta productos, cantidades y total, y abre un enlace `https://wa.me/<numero>?text=<mensaje>` con el pedido formateado para el vendedor.

- Número: `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Formato del mensaje: `lib/utils/formatWhatsAppOrder.ts`
- Botón: `components/WhatsAppCheckoutButton.tsx`

No agregar pasarela de pago salvo pedido explícito.

## Tech stack

| Capa | Elección |
| --- | --- |
| Web | Next.js App Router (Server y Client Components) + TypeScript |
| Estilos | Tailwind CSS (la app hoy está en un tema claro con tokens `ink` / `shiba`; Dark/Light mode está en el plan, no implementado) |
| DB / backend | Supabase (PostgreSQL, RLS) |
| Auth | Supabase Auth: email/password con confirmación por correo + Google OAuth |
| Archivos | Supabase Storage, bucket público `product-images` |
| Estado global | Zustand (`lib/store/useCart.ts`), persistido en `localStorage` |

Repo: `shibastore`. Next 16, React 19. En este Next la sesión se refresca en `proxy.ts` (no hay `middleware.ts`).

## Estado actual

### Base de datos y storage

- Tabla `products` en schema `public`, lectura pública por RLS.
- Bucket `product-images` con políticas de inserción y lectura.
- Schema de referencia: `supabase/schema.sql`.
- Categorías de producto: `figuras`, `accesorios`, `mates`, `vasos`, `juegos`. Campo `featured` para la home.

### Autenticación

- Email y Google OAuth configurados en el panel de Supabase.
- Callback: `app/auth/callback/route.ts`.
- Login / registro: `app/login/page.tsx`. Errores de Auth se traducen en `lib/utils/authErrors.ts`. El param `next` se sanitiza (`safeNextPath`) para evitar open redirect.
- El rol admin vive solo en `profiles.role`. Un usuario logueado no puede UPDATE/INSERT su rol (RLS + REVOKE + trigger `protect_profile_role`). Promoción: SQL Editor. Hay que **correr el schema.sql actualizado en Supabase**.
- Si al registrarse no llega mail y la sesión queda abierta, en Supabase → Authentication → Providers → Email está apagado **Confirm email**. La app no puede mandar el correo: lo manda Auth. El SMTP gratis de Supabase es limitado; en producción conviene SMTP propio (Resend, etc.).
- Admin: `app/admin/layout.tsx` + `lib/utils/admin.ts` (rol `admin` en `profiles`). Sin sesión → `/login`. Sin rol admin → `/`.

### Carrito

- Store: `lib/store/useCart.ts` — agregar, quitar, cantidades, vaciar, total, persistencia.

### UI global

- `components/Navbar.tsx` en `app/layout.tsx`: sesión (Supabase) + contador del carrito (Zustand).
- `components/Footer.tsx` también está en el layout.

### Superficies ya construidas

Estas pantallas **ya existen** (no empezarlas de cero):

| Ruta | Qué hace hoy |
| --- | --- |
| `app/page.tsx` | Hero, destacados y bloque FDM / archivo propio. |
| `app/productos/page.tsx` | Catálogo con búsqueda, filtro por categoría y orden (nuevos / precio). |
| `app/productos/[id]/page.tsx` | Ficha de producto. |
| `app/carrito/page.tsx` | Resumen, cantidades, notas, preview del mensaje y checkout WhatsApp. |
| `app/admin/dashboard/page.tsx` | Alta / edición / baja de productos e imágenes a Storage. |

## Objetivos del producto (spec, no backlog verde)

Así se definió cada superficie. Servir de guía al tocarlas, no como lista de “falta crear el archivo”.

1. **Landing** — Hero, grilla de destacados desde Supabase, bloque informativo de impresión 3D.
2. **Catálogo** — Grilla, buscador por texto, ordenamiento por precio.
3. **Carrito / checkout WhatsApp** — Resumen, cantidades, “Finalizar compra” → mensaje tipo *Hola! Quiero encargar…* → `wa.me`.
4. **Admin** — CRUD de productos protegido, upload a `product-images`.

## Próximo paso

Chequeo local (2026-08-22): build de producción, lint y rutas OK. Supabase responde. La tabla `products` está vacía (home sin destacados, catálogo vacío). `profiles` no se puede listar con la anon key (RLS correcto).

Antes de Vercel:

1. Crear un usuario, promoverlo a admin (`update profiles set role = 'admin' where email = '...'`) y cargar al menos un producto.
2. En Vercel, setear las 3 vars de `.env.example`.
3. En Supabase Auth, Site URL + Redirect URLs con el dominio público (abajo). Google OAuth sigue apuntando a `https://<proyecto>.supabase.co/auth/v1/callback`.

Vercel (cuenta `marce9`, proyecto `3dshiba-store`):

- Panel: `https://vercel.com/marce9/3dshiba-store`
- URL pública (cuando haya deploy): `https://3dshiba-store.vercel.app`
- Callback de la app: `https://3dshiba-store.vercel.app/auth/callback`

## No tocar salvo pedido explícito

- Pasarelas de pago.
- Reescribir el flujo WhatsApp por otro canal de checkout.
- Nuevas dependencias si el stack actual ya resuelve el problema.
