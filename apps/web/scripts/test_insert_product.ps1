# test_insert_product.ps1
# Requiere la variable de entorno DATABASE_URL definida en PowerShell.
param()

if (-not $env:DATABASE_URL) {
  Write-Error "Por favor define `DATABASE_URL` primero, por ejemplo:`n$env:DATABASE_URL = 'postgresql://postgres:TU_PASS@host:5432/postgres'"
  exit 1
}

Write-Output "Comprobando columna deleted_at..."
psql $env:DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='deleted_at';"

$ts = [int][double]::Parse((Get-Date -UFormat %s))
$testId = "test-product-$ts"
Write-Output "Insertando producto de prueba: $testId"
psql $env:DATABASE_URL -c "INSERT INTO products (id, name, price, status) VALUES ('$testId','Prueba desde PowerShell',9.99,'published') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name RETURNING id, name, price, status, deleted_at;"

Write-Output "Consultando producto inserted..."
psql $env:DATABASE_URL -c "SELECT id, name, price, status, deleted_at FROM products WHERE id='$testId';"

Write-Output "Script completado."
