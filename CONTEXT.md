# Contexto — 3DShiba Store

Fuente de verdad del producto. Actualizar este archivo cuando cambie una decisión, el stack o el próximo paso. No duplicar acá detalles que ya están en el código.

## Contexto general

- **Nombre:** 3DShiba Store
- **Tipo:** E-commerce de un emprendimiento de impresiones 3D (figuras, accesorios, mates, vasos, juegos). Ubicación de marca: Mar de Cobo.
- **Objetivo:** Tienda web moderna, rápida y segura: landing, catálogo con filtrado, autenticación de usuarios y panel administrativo.

## Alcance del taller

- **Solo impresión FDM, solo PLA.** No hay resina, PETG ni otros materiales. No vender ni filtrar “resina” en copy, categorías o admin.
- **Pedidos a medida:** el cliente manda el archivo (STL/3MF/etc.). Canal WhatsApp (`CustomQuoteButton` + `formatCustomPrintQuote`). Sin formulario de cotización ni uploader.
- No decir que no modelamos. No mencionar resina.
- Marca: celeste `#4db8c2` / `#2f8f99` con letras blancas. Logo en `public/logo-3dshiba.jpg`. Instagram: `https://www.instagram.com/3dshiba.store/`
- Sobre nosotros: `app/nosotros/page.tsx`. Footer: logo + Instagram + nosotros (sin catálogo/carrito).
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

## SEO (marca: “3dshiba”)

Objetivo: que Google muestre la tienda primero al buscar **3dshiba**. Es búsqueda de marca (nombre casi único); no hace falta rellenar keywords. Un `meta` no rankea solo: Google tiene que descubrir, leer y asociar el nombre con este sitio.

**Hoy:** título/descripción globales y Open Graph en `app/layout.tsx` (`3DShiba Store`, FDM, Mar de Cobo). `lang="es"`. El H1 de la home no dice 3DShiba. No hay `sitemap.xml` ni `robots.txt`. Las fichas no tienen `generateMetadata` (todas heredan el título del layout). Dominio actual: `3dshiba-store.vercel.app` (Instagram usa `3dshiba.store`).

**Qué mueve el ranking de marca (orden):** Search Console (indexar `/`, `/productos`, `/nosotros`) → mismo nombre + link a la web en Instagram/WhatsApp → H1 con “3DShiba Store” → sitemap → dominio propio cuando se pueda. No plugins de SEO ni copy genérico tipo “impresión 3D barata”.

Búsquedas genéricas (“mates impresos 3D”, etc.) son otro juego (tiempo y competencia); no es el foco ahora.

## Estado actual (2026-08-24)

La tienda está **en el aire** en Vercel con productos reales. El circuito viejo (login, catálogo, carrito → WhatsApp, crear producto en admin) ya se usó. Lo de abajo es lo que hay hoy, no un wishlist.

### En producción / ya usado

- Hay admin (rol en `profiles`) y productos en el catálogo (destacados en la home). No hay stock: se imprime a pedido.
- Login email + Google. Errores de Auth en español (`lib/utils/authErrors.ts`). `next` sanitizado. Logout recarga `/`.
- Agregar al carrito y checkout exigen sesión.
- Checkout = WhatsApp. Tras abrir el chat, un modal: solo **Sí, ya lo envié** crea el pedido y vacía el carrito. Precios desde la DB.
- La tabla live de `orders` es **legado** (no salió solo de `schema.sql`): exige `customer_name`, `customer_email`, `shipping_address` y puede pedir más NOT NULL. `createOrder` las rellena y, si aparece otra, completa esa columna en el mismo intento (`lib/utils/legacyOrderColumns.ts`).
- El carrito vive en `localStorage` por usuario (`3dshiba-carts`): al salir se vacía en pantalla y al volver a entrar con la misma cuenta se restaura. Solo este navegador; no cruza dispositivos.
- Confirm email está apagado en Supabase (el SMTP gratis es flojo). Promover admin: solo SQL Editor. RLS de `profiles`: REVOKE + trigger `protect_profile_role` (hay que haber corrido ese bloque).

### En código, todavía sin testear / a verificar

1. **Admin de pedidos** — `/admin/pedidos`. Si no aparecen pedidos de otros usuarios es RLS: hay que correr `is_admin()`, `admin_list_orders()` y `fulfillment_status` en `schema.sql`. Estados: pendiente / en proceso / completado / enviado.
2. **Color y entrega en el carrito** — chips de color (solo PLA) + retiro/envío. Van al WhatsApp y al pedido. Sin plazos en la web: se coordinan por chat.
3. **Varias fotos por producto** — `image_url` principal + `image_urls` extras (opcional, hasta 5 en total). Galería en la ficha.

Para que el admin vea **todos** los pedidos: SQL Editor → bloque `admin_list_orders` + `fulfillment_status` al final de `supabase/schema.sql`. Sin eso, RLS solo muestra los propios. Para fotos extra: `image_urls` en `products`.

### Base de datos y storage

- `products`: lectura pública. Categorías `figuras`, `accesorios`, `mates`, `vasos`, `juegos`. `featured` en la home. La tabla live también tiene `title` y `slug` NOT NULL (el alta manda ambos).
- `orders`: historial por usuario + listado admin. Schema de referencia: `supabase/schema.sql` (idempotente; la tabla vieja se altera, no se recrea).
- Bucket `product-images` público.

### Auth y admin

- Callback: `app/auth/callback/route.ts`. Login: `app/login/page.tsx`.
- Admin: `app/admin/layout.tsx` + `lib/utils/admin.ts`. Sin sesión → `/login?next=/admin/pedidos`. Sin rol admin → `/`.
- Google OAuth: callback de Google Console = `https://<ref>.supabase.co/auth/v1/callback`, no la URL de Vercel.

### Superficies (no empezarlas de cero)

| Ruta | Qué hace hoy |
| --- | --- |
| `app/page.tsx` | Hero, destacados, bloque FDM / archivo propio. |
| `app/productos/page.tsx` | Catálogo: búsqueda, categoría, orden. |
| `app/productos/[id]/page.tsx` | Ficha. Cantidad en `AddToCartButton`. |
| `app/carrito/page.tsx` | Items, color, entrega, WhatsApp (material fijo: PLA). |
| `app/cuenta/page.tsx` | Email + historial del usuario. |
| `app/nosotros/page.tsx` | Taller, Mar de Cobo, retiro/envío. |
| `app/admin/pedidos/page.tsx` | Pedidos de todos + estado. |
| `app/admin/dashboard/page.tsx` | CRUD productos (foto principal + extras). |
| `app/login/page.tsx` | Email y Google. |

Navbar: sesión, carrito, Mi cuenta / Salir, Admin si corresponde. Footer: logo + nosotros + Instagram.

## Objetivos del producto (spec, no backlog)

Guía al tocar superficies existentes:

1. **Landing** — Hero, destacados, FDM / archivo propio.
2. **Catálogo** — Grilla, búsqueda, orden.
3. **Carrito / WhatsApp** — Color, entrega, cantidades → `wa.me`. Material siempre PLA.
4. **Admin** — Pedidos del día + CRUD de productos.

## Próximo paso

1. Pushear a `main` el fix de checkout (PLA fijo, sin plazos, sin `LEAD_TIME_COPY`) para que Vercel deje de fallar. El dueño commitea/pushea.
2. SEO de marca (cuando se retome): Search Console → sitemap/`robots.txt` → H1 con 3DShiba → `generateMetadata` en fichas. Link a la web desde Instagram.
3. Correr en Supabase el SQL de `is_admin` / `admin_list_orders` / `fulfillment_status` / `image_urls` (final de `schema.sql`) y probar pedidos de otra cuenta en `/admin/pedidos`.

Vercel (cuenta `marce9`, proyecto `3dshiba-store`):

- Panel: `https://vercel.com/marce9/3dshiba-store`
- URL: `https://3dshiba-store.vercel.app`
- Callback de la app: `https://3dshiba-store.vercel.app/auth/callback`

## No tocar salvo pedido explícito

- Pasarelas de pago.
- Reescribir el flujo WhatsApp por otro canal de checkout.
- Nuevas dependencias si el stack actual ya resuelve el problema.
