-- Run once in the Supabase SQL editor to add customer reviews to an existing Levish database.
create table if not exists levish.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text,
  product_name text not null default '',
  name text not null,
  email text not null default '',
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  photos text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists reviews_status_created_idx on levish.reviews (status, created_at desc);
alter table levish.reviews enable row level security;
grant all on levish.reviews to service_role;
