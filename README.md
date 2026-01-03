# Motivational Books — Nepal's Premier Motivational Book Platform

Ultra-premium e-commerce web app for motivational and self-help books, serving readers across Nepal. Server-side rendered with EJS, Tailwind CSS, and a clean MEN stack architecture.

## Quick Start

1) Install dependencies

```
npm i
```

2) Setup environment

Copy `.env.example` to `.env` and update values as needed.

3) Dev server

```
npm run dev
```

App runs at `http://localhost:3000`.

4) Seed sample data

```
npm run seed
```

Admin credentials are from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Scripts

- `npm run build:css` — Build Tailwind to `src/public/css/app.css`
- `npm run build` — Prepare assets then build CSS
- `npm run start` — Production start
- `npm run seed` — Seed admin + sample categories/authors/books/banners
- `npm run sitemap` — Generate sitemap.xml
- `npm run test` — Jest + Supertest

## Features

- MEN stack with EJS SSR and Tailwind CSS 3 (typography, forms, line-clamp, aspect-ratio)
- Session-based cart and wishlist (no customer login)
- Checkout with COD; order confirmation page + emails to customer and admin
- Admin dashboard with login (bcrypt), CSRF protection, and rate limiting
- CRUD: Books, Categories, Authors, Banners, Discounts
- Bulk upload books via CSV/XLSX
- Image uploads with Multer + Sharp (WebP responsive sizes)
- SEO: meta tags, OpenGraph, Twitter, JSON-LD; sitemap and robots
- Security: helmet, rate limiting, secure sessions; compression; logging with morgan + pino
- Tests for core flows

## Architecture

```
src/
  config/       // env, db, session, security
  models/       // Mongoose models
  utils/        // helpers: slugify, price, email, pagination, csv, image, seo
  middlewares/  // notFound, errorHandler, csrf attach, admin auth, rate limits
  services/     // business logic: books, orders, catalog, admin, uploads
  controllers/  // route handlers (site + admin)
  routes/       // router modules
  views/        // EJS layouts, partials, pages (site/admin)
  public/       // CSS/JS/assets
scripts/        // seed, build-assets, gen-sitemap, export-orders-csv
```

## Bulk Import (Admin)

Go to Admin → Books → Bulk upload. CSV/XLSX columns:

`title, subtitle, authors(|), category, isbn13, priceMRP, priceSale, stock, language, binding, pages, publisher, publicationDate, tags(|), imageUrl`

## Emails

Configure SMTP in `.env` for real delivery. Without SMTP, emails are printed to the console (JSON transport).

## Docker

```
docker-compose up --build
```

## Testing

```
npm test
```

## Notes

- Tailwind builds from `src/public/css/tailwind.css` → `src/public/css/app.css`
- Admin routes are protected by session + CSRF; POST forms include `csrfToken` injected by middleware.
- Many UI components are intentionally minimalist but styled to feel premium; extend as desired with Alpine.js/Swiper.
