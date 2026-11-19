-- Run once in the Supabase SQL editor to give the WhatsApp sales agent its memory.
-- whatsapp_chats: recent conversation and the order summary waiting for the customer's "yes", per WhatsApp number.
-- whatsapp_seen: message ids already answered, so a webhook Meta sends twice is answered once.
create table if not exists levish.whatsapp_chats (
  phone text primary key,
  history jsonb not null default '[]'::jsonb,
  draft jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists levish.whatsapp_seen (
  message_id text primary key,
  created_at timestamptz not null default now()
);
create index if not exists whatsapp_seen_created_idx on levish.whatsapp_seen (created_at);
alter table levish.whatsapp_chats enable row level security;
alter table levish.whatsapp_seen enable row level security;
grant all on levish.whatsapp_chats to service_role;
grant all on levish.whatsapp_seen to service_role;
