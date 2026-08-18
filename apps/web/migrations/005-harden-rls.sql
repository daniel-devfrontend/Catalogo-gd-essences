-- 005-harden-rls.sql
-- Mantiene la lectura publica y limita cualquier escritura a public.admins.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()::text
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.products enable row level security;
alter table public.collections enable row level security;
alter table public.admins enable row level security;

drop policy if exists products_write_all on public.products;
drop policy if exists products_read_all on public.products;
drop policy if exists collections_write_all on public.collections;
drop policy if exists collections_read_all on public.collections;
drop policy if exists public_select on public.products;
drop policy if exists admins_insert on public.products;
drop policy if exists admins_update on public.products;
drop policy if exists admins_delete on public.products;

create policy products_public_read on public.products
  for select using (true);

create policy products_admin_insert on public.products
  for insert to authenticated
  with check (public.is_admin());

create policy products_admin_update on public.products
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy products_admin_delete on public.products
  for delete to authenticated
  using (public.is_admin());

create policy collections_public_read on public.collections
  for select using (true);

create policy collections_admin_insert on public.collections
  for insert to authenticated
  with check (public.is_admin());

create policy collections_admin_update on public.collections
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy collections_admin_delete on public.collections
  for delete to authenticated
  using (public.is_admin());