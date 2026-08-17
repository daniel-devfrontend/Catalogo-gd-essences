#!/usr/bin/env bash
set -euo pipefail

# test_insert_product.sh
# Requiere DATABASE_URL en el entorno.
# Verifica que la columna deleted_at exista, inserta un producto de prueba y lo consulta.

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Por favor exporta DATABASE_URL antes de ejecutar. Ej:"
  echo "  export DATABASE_URL='postgresql://postgres:...@host:5432/postgres'"
  exit 1
fi

echo "Comprobando columna deleted_at..."
psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='deleted_at';"

TEST_ID="test-product-$(date +%s)"

echo "Insertando producto de prueba: $TEST_ID"
psql "$DATABASE_URL" -c "INSERT INTO products (id, name, price, status) VALUES ('$TEST_ID','Prueba desde script',9.99,'published') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name RETURNING id, name, price, status, deleted_at;"

echo "Consultando producto inserted..."
psql "$DATABASE_URL" -c "SELECT id, name, price, status, deleted_at FROM products WHERE id='$TEST_ID';"

echo "Script completado." 
