-- Full database for a new Supabase project. Run once in the SQL editor, then run
-- `npm run seed` to add the women's catalog (see README).

create extension if not exists pgcrypto;

-- Products
create table if not exists public.products (
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

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (active);
create index if not exists products_brand_idx on public.products (brand);

alter table public.products enable row level security;

-- Brands
create table if not exists public.brands (
  slug text primary key,
  name text not null unique,
  types text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.brands enable row level security;

-- Home page banners (add them from admin)
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  mobile_image text,
  alt text not null default '',
  href text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists banners_active_sort_idx on public.banners (active, sort_order);

alter table public.banners enable row level security;

-- Customer profiles, filled from auth sign-ups
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
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

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Carts
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  guest_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_owner check (user_id is not null or guest_token is not null)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity > 0 and quantity <= 20),
  size text not null default '',
  color text not null default '',
  created_at timestamptz not null default now(),
  constraint cart_items_variant_key unique (cart_id, product_id, size, color)
);

create index if not exists cart_items_cart_idx on public.cart_items (cart_id);

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- Orders
create table if not exists public.orders (
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
  user_id uuid references auth.users (id) on delete set null,
  order_items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  shipping text not null default 'Free',
  total numeric not null,
  payment_method text not null default 'cod',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_notes_order_id_idx on public.order_notes (order_id);

alter table public.orders enable row level security;
alter table public.order_notes enable row level security;

-- Used by the admin product routes to decide which removed photos can be deleted from storage.
create or replace function public.product_images_in_use(paths text[])
returns setof text
language sql
stable
as $$
  select p from unnest(paths) as p
  where exists (
      select 1 from public.products x
      where strpos(x.image, p) > 0 or strpos(x.images::text, p) > 0 or strpos(x.color_images::text, p) > 0
    )
    or exists (select 1 from public.banners b where strpos(to_jsonb(b)::text, p) > 0)
    or exists (select 1 from public.orders o where strpos(o.order_items::text, p) > 0);
$$;

revoke execute on function public.product_images_in_use(text[]) from public, anon, authenticated;
grant execute on function public.product_images_in_use(text[]) to service_role;

-- Product and banner photos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
