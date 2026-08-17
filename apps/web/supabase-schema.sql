create table if not exists public.collections (
  id text primary key,
  title text not null,
  description text
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

create policy if not exists collections_read_all on public.collections for select using (true);
create policy if not exists collections_write_all on public.collections for all using (true) with check (true);

create policy if not exists products_read_all on public.products for select using (true);
create policy if not exists products_write_all on public.products for all using (true) with check (true);
