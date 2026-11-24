# fuldani-frontend-repo

Storefront + admin panel for **স্বপ্ন ফুলদানি (Shopno Fuldani)** — Next.js 16 (App Router, TSX) · raw CSS Modules · TanStack Query.

Backend API: [fuldani-backend](https://github.com/mdhakimshorkar123-cmyk/fuldani-backend)

## Setup
```bash
cp .env.example .env.local   # API_URL=http://localhost:4000
npm install
npm run dev                  # http://localhost:3000
```

| Env | Purpose |
|---|---|
| `API_URL` | Backend base URL (server-side; `/api/*` is proxied to it) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for SEO metadata / sitemap |
| `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_WHATSAPP` | Contact info in the footer |

## Routes
- Storefront: `/`, `/products/[slug]`, `/cart`, `/track`
- Admin: `/admin` (dashboard, orders, products, categories, showcases, delivery zones)
