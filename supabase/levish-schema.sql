-- Levish's own section inside the shared Supabase project (the one Empulse uses).
-- Everything lives in the "levish" schema, so Levish data never mixes with Empulse's "public" tables.
-- Customer accounts are Levish's own (password hashes here), not Supabase Auth users, which the
-- two stores would otherwise share.
--
-- Run once in Supabase: SQL editor > paste this file > Run.
-- Then: Project Settings > Data API > Exposed schemas > add "levish" > Save.

create schema if not exists levish;

-- Products
create table if not exists levish.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  price numeric not null,
  compare_at_price numeric,
  sale_percent integer not null default 0,
  category_id text not null,
  subcategory text not null default '',
  brand text not null default '',
  color text not null default '',
  image text not null,
  images jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  color_images jsonb not null default '[]'::jsonb,
  description text not null default '',
  featured boolean not null default false,
  is_new boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  constraint products_sale_percent_range check (sale_percent between 0 and 90)
);
create index if not exists products_category_idx on levish.products (category_id);
create index if not exists products_active_idx on levish.products (active);
create index if not exists products_brand_idx on levish.products (brand);

-- Brands
create table if not exists levish.brands (
  slug text primary key,
  name text not null unique,
  types text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Home page banners
create table if not exists levish.banners (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  mobile_image text,
  alt text not null default '',
  href text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists banners_active_sort_idx on levish.banners (active, sort_order);

-- Customer accounts (Levish's own sign-in, separate from Empulse)
create table if not exists levish.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null default '',
  reset_token_hash text,
  reset_expires_at timestamptz,
  first_name text not null default '',
  last_name text not null default '',
  address text not null default '',
  apartment text not null default '',
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

-- Carts
create table if not exists levish.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references levish.profiles (id) on delete cascade,
  guest_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_owner check (user_id is not null or guest_token is not null)
);
create table if not exists levish.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references levish.carts (id) on delete cascade,
  product_id text not null references levish.products (id) on delete cascade,
  quantity integer not null check (quantity > 0 and quantity <= 20),
  size text not null default '',
  color text not null default '',
  created_at timestamptz not null default now(),
  constraint cart_items_variant_key unique (cart_id, product_id, size, color)
);
create index if not exists cart_items_cart_idx on levish.cart_items (cart_id);

-- Orders
create table if not exists levish.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text not null,
  last_name text not null,
  address text not null,
  apartment text not null default '',
  city text not null,
  state text not null default '',
  postal_code text not null default '',
  phone text not null,
  user_id uuid references levish.profiles (id) on delete set null,
  order_items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  shipping text not null default 'Free',
  total numeric not null,
  payment_method text not null default 'cod',
  status text not null default 'pending',
  promo_code text,
  discount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create table if not exists levish.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references levish.orders (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists orders_email_idx on levish.orders (email);
create index if not exists orders_user_id_idx on levish.orders (user_id);
create index if not exists orders_status_idx on levish.orders (status);
create index if not exists orders_created_at_idx on levish.orders (created_at desc);
create index if not exists orders_promo_code_idx on levish.orders (promo_code);
create index if not exists order_notes_order_id_idx on levish.order_notes (order_id);

-- Promo codes
create table if not exists levish.promo_codes (
  code text primary key,
  owner text not null default '',
  type text not null check (type in ('percent', 'fixed')),
  value numeric not null check (value > 0),
  min_order numeric not null default 0,
  max_uses integer,
  once_per_customer boolean not null default false,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Used by the admin product routes to decide which removed photos can be deleted from storage.
create or replace function levish.product_images_in_use(paths text[])
returns setof text
language sql
stable
as $$
  select p from unnest(paths) as p
  where exists (
      select 1 from levish.products x
      where strpos(x.image, p) > 0 or strpos(x.images::text, p) > 0 or strpos(x.color_images::text, p) > 0
    )
    or exists (select 1 from levish.banners b where strpos(to_jsonb(b)::text, p) > 0)
    or exists (select 1 from levish.orders o where strpos(o.order_items::text, p) > 0);
$$;

-- Only the server (service role) reads and writes Levish data; browsers never talk to these tables.
do $$
declare t text;
begin
  foreach t in array array['products','brands','banners','profiles','carts','cart_items','orders','order_notes','promo_codes'] loop
    execute format('alter table levish.%I enable row level security', t);
  end loop;
end $$;
grant usage on schema levish to service_role;
grant all on all tables in schema levish to service_role;
grant all on all sequences in schema levish to service_role;
grant execute on all functions in schema levish to service_role;
revoke execute on function levish.product_images_in_use(text[]) from public, anon, authenticated;
alter default privileges in schema levish grant all on tables to service_role;

-- Levish photos get their own bucket, next to Empulse's "product-images".
insert into storage.buckets (id, name, public)
values ('levish-images', 'levish-images', true)
on conflict (id) do update set public = true;
