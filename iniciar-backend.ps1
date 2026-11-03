param(
  [string]$Servicio = 'FREEPDB1',
  [ValidateRange(1,65535)][int]$Puerto = 1522,
  [string]$HostOracle = 'localhost',
  [switch]$InicializarAdmin
)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
  Write-Host 'KARELY - compilacion del backend antes de pedir credenciales...' -ForegroundColor Cyan
  & .\mvnw.cmd -DskipTests compile
  if ($LASTEXITCODE -ne 0) { throw 'Fallo la compilacion de Maven. No se solicito ninguna contrasena.' }

  $env:DB_URL = "jdbc:oracle:thin:@//$HostOracle`:$Puerto/$Servicio"
  $env:DB_USERNAME = 'KARELY_BD2'
  $dbSecure = Read-Host 'Contrasena Oracle de KARELY_BD2' -AsSecureString
  $env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $dbSecure).Password
  $dbSecure = $null
  $bytes = New-Object byte[] 48
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  $env:APP_JWT_SECRET = [Convert]::ToBase64String($bytes)
  [Array]::Clear($bytes, 0, $bytes.Length)
  $env:APP_FRONTEND_ORIGIN = 'http://localhost:4200'

  if ($InicializarAdmin) {
    $env:APP_BOOTSTRAP_USERNAME = Read-Host 'Usuario inicial (ej. administradora)'
    $env:APP_BOOTSTRAP_EMAIL = Read-Host 'Correo del usuario inicial'
    $adminSecure = Read-Host 'Nueva contrasena de la pagina (12+ caracteres)' -AsSecureString
    $env:APP_BOOTSTRAP_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecure).Password
    $adminSecure = $null
  }

  Write-Host 'Iniciando Spring Boot... Mantenga abierta esta terminal.' -ForegroundColor Cyan
  & .\mvnw.cmd spring-boot:run
  if ($LASTEXITCODE -ne 0) { throw 'Spring Boot no inicio. Consulte el error Maven/Oracle anterior.' }
}
finally {
  Pop-Location
  foreach ($variable in @('DB_PASSWORD','APP_JWT_SECRET','APP_BOOTSTRAP_PASSWORD',
                          'APP_BOOTSTRAP_EMAIL','APP_BOOTSTRAP_USERNAME')) {
    Remove-Item "Env:$variable" -ErrorAction SilentlyContinue
  }
}
