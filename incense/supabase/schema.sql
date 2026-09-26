-- Run once in a NEW Supabase project's SQL Editor.
-- No sample personal data is inserted. Existing Sites D1 data is not migrated.
begin;
create table if not exists public.hoa_members (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 60),
 phone text not null check (char_length(phone) between 1 and 30),
 address text not null check (char_length(address) between 1 and 400)
);
create table if not exists public.hoa_orders (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 items text not null,
 total bigint not null check (total >= 0),
 name text not null check (char_length(name) between 1 and 60),
 phone text not null check (char_length(phone) between 1 and 30),
 address text not null check (char_length(address) between 1 and 400),
 payment text not null check (payment in ('MoMo','ZaloPay','VNPAY','銀行轉帳','貨到付款')),
 carrier text not null check (carrier in ('GHN','GHTK','Viettel Post')),
 status text not null default '測試訂單 · 未付款 · 未叫件',
 created timestamptz not null default now()
);
create index if not exists hoa_orders_user_created_idx on public.hoa_orders(user_id,created desc);
create table if not exists public.hoa_reviews (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 40),
 product text not null check (product in ('all','sandal','agar','temple')),
 rating integer not null check (rating between 1 and 5),
 content text not null check (char_length(content) between 1 and 1000),
 created timestamptz not null default now()
);
create index if not exists hoa_reviews_created_idx on public.hoa_reviews(created desc);
-- All database access goes through verified server routes. Public API keys cannot read/write these tables directly.
alter table public.hoa_members enable row level security;
alter table public.hoa_orders enable row level security;
alter table public.hoa_reviews enable row level security;
revoke all on public.hoa_members,public.hoa_orders,public.hoa_reviews from anon,authenticated;
grant all on public.hoa_members,public.hoa_orders,public.hoa_reviews to service_role;
commit;
