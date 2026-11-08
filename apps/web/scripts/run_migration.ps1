$ErrorActionPreference = 'Stop'

function Read-SecretValue {
  param([string]$Prompt)

  return (Read-Host $Prompt).Trim()
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  $installedNode = Join-Path $env:ProgramFiles 'nodejs\node.exe'
  if (Test-Path $installedNode) {
    $env:Path = "$(Split-Path $installedNode);$env:Path"
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
  }
}
if (-not $nodeCommand) {
  throw 'No se encontró Node.js. Instala la versión LTS desde https://nodejs.org/ y vuelve a ejecutar este script.'
}

$supabaseAnonKey = Read-SecretValue 'Clave anon/public de Supabase (no uses service_role ni secret)'
$appwriteApiKey = Read-SecretValue 'Clave temporal de Appwrite'
if (-not $supabaseAnonKey -or -not $appwriteApiKey) {
  throw 'Las claves no pueden estar vacías. Vuelve a ejecutar el asistente y pégalas de nuevo.'
}
$environmentNames = @(
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'APPWRITE_API_KEY',
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_ADMIN_TEAM_ID'
)
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
  $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

try {
  $env:SUPABASE_URL = 'https://tooshovqyqcffstqjlaw.supabase.co'
  $env:SUPABASE_ANON_KEY = $supabaseAnonKey
  $env:APPWRITE_API_KEY = $appwriteApiKey
  $env:APPWRITE_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1'
  $env:APPWRITE_PROJECT_ID = '6adec311002f8886f961'
  $env:APPWRITE_DATABASE_ID = '6adec5b400255cc20770'
  $env:APPWRITE_ADMIN_TEAM_ID = 'admins'

  & node (Join-Path $PSScriptRoot 'migrate_supabase_to_appwrite.mjs')
  if ($LASTEXITCODE -ne 0) {
    throw "El importador terminó con código $LASTEXITCODE."
  }
} finally {
  foreach ($name in $environmentNames) {
    [Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], 'Process')
  }
  $supabaseAnonKey = $null
  $appwriteApiKey = $null
}
