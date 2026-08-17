#!/usr/bin/env bash
# Script para crear bucket público `product-images` usando supabase CLI
# Requisitos: supabase CLI instalado y haber hecho `supabase login`

set -euo pipefail

BUCKET_NAME="product-images"

echo "Creando bucket: $BUCKET_NAME (público)"
supabase storage create-bucket "$BUCKET_NAME" --public || true

echo "Configurando políticas de acceso (público para lectura)..."
# Actualmente supabase storage public solo necesita --public en creación
echo "Bucket creado o ya existía: $BUCKET_NAME"

echo "Lista de buckets:" 
supabase storage list-buckets

echo "OK"
