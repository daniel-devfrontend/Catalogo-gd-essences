#!/usr/bin/env bash
set -euo pipefail

# apply_migrations.sh
# Aplica las migraciones SQL en apps/web/migrations usando psql.
# Requiere que la env var DATABASE_URL esté definida (cadena de conexión Postgres).

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Por favor exporta DATABASE_URL antes de ejecutar. Ej:"
  echo "  export DATABASE_URL='postgresql://postgres:...@db.xx.supabase.co:5432/postgres'"
  exit 1
fi

for f in ../migrations/*.sql; do
  echo "Ejecutando: $f"
  psql "$DATABASE_URL" -f "$f"
done

echo "Migraciones aplicadas correctamente."
