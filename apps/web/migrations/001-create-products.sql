-- Migration: 001-create-products.sql
-- Crea la tabla `products` y la tabla `admins` para permitir escrituras solo a administradores

create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  description text,
  collection text,
  image text,
  images text[],
  video_url text,
  status text default 'published' check (status in ('published','draft')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.collections (
  id text primary key,
  title text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger para actualizar updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_products_updated_at on public.products;
create trigger trg_update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_collections_updated_at on public.collections;
create trigger trg_update_collections_updated_at
  before update on public.collections
  for each row execute function public.update_updated_at_column();

-- Tabla de administradores (lista de user_id de supabase.auth)
create table if not exists public.admins (
  user_id text primary key,
  created_at timestamptz default now()
);
