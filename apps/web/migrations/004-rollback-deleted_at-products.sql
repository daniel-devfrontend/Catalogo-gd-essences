-- 004-rollback-deleted_at-products.sql
-- Revierte la migración que añadió deleted_at en la tabla products

DROP INDEX IF EXISTS idx_products_deleted_at;

ALTER TABLE IF EXISTS products
DROP COLUMN IF EXISTS deleted_at;
