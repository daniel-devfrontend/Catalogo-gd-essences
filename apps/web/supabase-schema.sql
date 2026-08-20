create table if not exists public.collections (
  id text primary key,
  title text not null,
  description text,
  image text
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric not null,
  original_price numeric,
  description text,
  collection text,
  image text,
  images jsonb default '[]'::jsonb,
  video_url text,
  status text default 'published',
  deleted_at text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid()::text);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists collections_read_all on public.collections;
drop policy if exists collections_write_all on public.collections;
drop policy if exists products_read_all on public.products;
drop policy if exists products_write_all on public.products;

create policy collections_public_read on public.collections for select using (true);
create policy collections_admin_write on public.collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy products_public_read on public.products for select using (true);
create policy products_admin_write on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
