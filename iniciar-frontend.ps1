$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
  Write-Host 'KARELY - iniciando Angular (usa npm.cmd para evitar el bloqueo de npm.ps1)' -ForegroundColor Cyan
  & node --version
  & npm.cmd install
  if ($LASTEXITCODE -ne 0) { throw 'npm install fallo. Revise los mensajes de instalacion.' }
  & npm.cmd start
  if ($LASTEXITCODE -ne 0) { throw 'npm start fallo. Revise los mensajes de Angular.' }
}
finally { Pop-Location }
