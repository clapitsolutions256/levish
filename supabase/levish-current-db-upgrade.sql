-- Upgrade for Levish's current Supabase project (until Levish moves to its "levish" schema).
-- Adds what the new code needs: Levish's own customer passwords and reset links, and promo codes.
-- Run once in that project: SQL editor > paste > Run. Safe to run again.

-- Customer accounts are Levish's own now, not Supabase Auth users.
alter table public.profiles
  add column if not exists password_hash text not null default '',
  add column if not exists reset_token_hash text,
  add column if not exists reset_expires_at timestamptz;
alter table public.profiles alter column id set default gen_random_uuid();

-- Profiles, carts and orders used to point at auth.users; point them at profiles instead.
do $$
declare r record;
begin
  for r in
    select c.conname, c.conrelid::regclass as tbl
    from pg_constraint c
    where c.contype = 'f'
      and c.confrelid = 'auth.users'::regclass
      and c.conrelid in ('public.profiles'::regclass, 'public.carts'::regclass, 'public.orders'::regclass)
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;
alter table public.carts
  add constraint carts_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade not valid;
alter table public.orders
  add constraint orders_user_id_fkey foreign key (user_id) references public.profiles (id) on delete set null not valid;
drop trigger if exists on_auth_user_created on auth.users;

-- Promo codes
create table if not exists public.promo_codes (
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
alter table public.promo_codes enable row level security;
alter table public.orders
  add column if not exists promo_code text,
  add column if not exists discount numeric not null default 0;
create index if not exists orders_promo_code_idx on public.orders (promo_code);
