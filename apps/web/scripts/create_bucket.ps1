# PowerShell script para crear bucket público `product-images` usando supabase CLI
Param()

Write-Host "Creando bucket: product-images (público)"
supabase storage create-bucket product-images --public | Out-Null
Write-Host "Bucket creado o ya existía: product-images"
supabase storage list-buckets

Write-Host "OK"
