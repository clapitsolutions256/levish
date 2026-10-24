# Levish Store

Women's clothing store with an admin panel, built with Next.js 16, TypeScript, Tailwind CSS and Supabase. Cloned from the Empulse store and limited to women's products.

## Database setup (new Supabase project)

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste all of `supabase/setup.sql`, and run it. This creates the tables, the sign-up trigger and the `product-images` storage bucket.
3. In **Project Settings > API**, copy the project URL, the anon key and the service role key into `.env` (see `.env.example`).
4. Add the women's catalog (products, brands and their photos from `supabase/seed/`):

   ```bash
   npm run seed
   ```

## Run locally

```bash
npm install
npm run dev
```

- Store: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login), using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## Build

```bash
npm run build
npm start
```

## Still to change

The logo, colours and the Empulse name and copy (`src/lib/site.ts`, `src/data/assets.ts`, `src/data/contact.ts`, the About page) still come from Empulse.
# levish
