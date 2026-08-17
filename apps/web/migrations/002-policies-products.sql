-- Migration: 002-policies-products.sql
-- Habilita RLS y crea políticas para lectura pública y escrituras solo por administradores listados en public.admins

alter table public.products enable row level security;

-- Política pública de SELECT (lectura pública)
drop policy if exists public_select on public.products;
create policy public_select on public.products
  for select using (true);

-- Permitir INSERT solo si el uid del JWT está en public.admins
drop policy if exists admins_insert on public.products;
create policy admins_insert on public.products
  for insert to authenticated
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()::text));

-- Permitir UPDATE solo a admins
drop policy if exists admins_update on public.products;
create policy admins_update on public.products
  for update to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()::text))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()::text));

-- Permitir DELETE solo a admins
drop policy if exists admins_delete on public.products;
create policy admins_delete on public.products
  for delete to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()::text));
