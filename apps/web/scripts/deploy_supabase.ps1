param(
    [Parameter(Mandatory=$true)][string]$ProjectRef
)

Write-Host "Enlazando proyecto Supabase: $ProjectRef"
supabase link --project-ref $ProjectRef

$bucketName = "product-images"
Write-Host "Creando bucket público: $bucketName"
try {
    supabase storage create-bucket $bucketName --public | Out-Null
    Write-Host "Bucket creado (o ya existía)."
} catch {
    Write-Host "No se pudo crear el bucket automáticamente con el CLI."
    Write-Host "Crea el bucket manualmente en Supabase Storage: nombre $bucketName, acceso Public."    
}

if ($env:DATABASE_URL) {
    Write-Host "DATABASE_URL detectada. Aplicando migraciones con psql si está disponible, sino con supabase db query..."
    $psqlExists = Get-Command psql -ErrorAction SilentlyContinue
    Get-ChildItem -Path ..\migrations -Filter *.sql | ForEach-Object {
        Write-Host "Ejecutando: $($_.FullName)"
        if ($psqlExists) {
            psql $env:DATABASE_URL -f $_.FullName
        } else {
            supabase db query --linked --file $_.FullName
        }
    }
    Write-Host "Migraciones aplicadas."
} else {
    Write-Host "No se detectó DATABASE_URL. Puedes pegar los SQL en SQL Editor de Supabase o exportar DATABASE_URL y volver a ejecutar este script."
}

Write-Host "Añade tu user_id a public.admins desde SQL Editor:" 
Write-Host "  insert into public.admins (user_id) values ('<TU_USER_ID>');"
Write-Host "Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en apps/web/.env o en variables de deploy."
