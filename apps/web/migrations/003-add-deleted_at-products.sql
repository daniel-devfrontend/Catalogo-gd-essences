-- 003-add-deleted_at-products.sql
-- Añade la columna deleted_at para soft deletes en la tabla products

ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products (deleted_at);
