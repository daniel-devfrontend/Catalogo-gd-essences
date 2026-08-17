#!/usr/bin/env bash
set -euo pipefail

# deploy_supabase.sh
# Uso: ./deploy_supabase.sh <PROJECT_REF>
# Requisitos: supabase CLI instalado y haber hecho `supabase login`

PROJECT_REF="${1:-}" 
if [ -z "$PROJECT_REF" ]; then
  echo "Uso: $0 <PROJECT_REF>"
  echo "Obten el PROJECT_REF desde el panel de Supabase (Settings → General → Project ref)"
  exit 1
fi

echo "Enlazando proyecto Supabase: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

BUCKET_NAME="product-images"
echo "Creando bucket público: $BUCKET_NAME"
supabase storage create-bucket "$BUCKET_NAME" --public || true

echo "Bucket creado (o ya existía)."

# Intentar aplicar migraciones si existe DATABASE_URL en el entorno
if [ -n "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL detectada. Aplicando migraciones locales con psql..."
  for f in ../migrations/*.sql; do
    echo "Ejecutando: $f"
    psql "$DATABASE_URL" -f "$f"
  done
  echo "Migraciones aplicadas."
else
  echo "No se detectó DATABASE_URL. Para aplicar las migraciones tienes dos opciones:" 
  echo "  1) Abrir el SQL Editor en el panel de Supabase y pegar los contenidos de 'apps/web/migrations/*.sql'"
  echo "  2) Exportar DATABASE_URL desde Settings → Database → Connection string, y exportarla como env var, luego volver a ejecutar este script. Ejemplo:" 
  echo "     export DATABASE_URL='postgresql://postgres:...@db.<region>.supabase.co:5432/postgres'"
  echo "     ./deploy_supabase.sh $PROJECT_REF"
fi

echo "Hecho. A continuación añade tu user_id a public.admins (SQL Editor):"
echo "  insert into public.admins (user_id) values ('<TU_USER_ID>');"

echo "No olvides añadir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en apps/web/.env o en tu host de deploy."
