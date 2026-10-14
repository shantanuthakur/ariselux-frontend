# Ariselux Frontend

Standalone multi-page Vite frontend for the Ariselux mobile lighting tower website.

## Requirements

- Node.js 20.19 or newer
- npm 9 or newer

## Local development

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The site is available at `http://localhost:3000`. During development, `/api` requests are proxied to `http://127.0.0.1:5000`.

To preview the production build locally:

```bash
npm run build
npm run preview
```

## Environment configuration

Copy `.env.example` to `.env` and set the backend API URL:

```text
VITE_API_URL=https://api.example.com/api
```

If the API is served from the same domain, `VITE_API_URL=/api` can be used. The frontend does not include the backend service; quotation and enquiry forms require a reachable API.

## Production deployment

Configure the hosting service with:

- Project directory: repository root
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=<public backend URL>/api`

The build produces six pages: `index.html`, `about.html`, `products.html`, `mobile-light-tower.html`, `product-detail.html`, and `contact.html`.

## Cloudflare deployment

For Cloudflare Workers with Static Assets:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- The included `wrangler.jsonc` publishes the generated `dist/` directory.

For Cloudflare Pages, create a Pages project instead and use:

- Build command: `npm run build`
- Build output directory: `dist`
- No deploy command; Pages deploys the build output automatically.
