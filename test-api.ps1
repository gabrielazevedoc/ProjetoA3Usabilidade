
# Test script for IRecycle API
$BaseUrl = "http://localhost:5000"  # Use HTTP to avoid certificate issues on PS 5.1

try {
    Write-Host "=== Test 1: GET /api/pessoas ===" -ForegroundColor Green
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/pessoas" -Method GET
    Write-Host "Status: 200 OK"
    Write-Host "Response: $($resp | ConvertTo-Json)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

try {
    Write-Host "`n=== Test 2: POST /api/empresas ===" -ForegroundColor Green
    $body = @{
        razaoSocial = "ACME LTDA"
        nomeContato = "Fulano Silva"
        telefone = "(11)99999-9999"
        email = "contato@acme.com"
        senha = "Senha123"
        cnpj = "00.000.000/0001-00"
    }
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/empresas" -Method POST -Body ($body | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Status: 201 Created"
    Write-Host "Response: $($resp | ConvertTo-Json)"
    $empresaId = $resp.id
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

try {
    Write-Host "`n=== Test 3: POST /api/auth/login-empresa ===" -ForegroundColor Green
    $body = @{
        email = "contato@acme.com"
        senha = "Senha123"
    }
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login-empresa" -Method POST -Body ($body | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Status: 200 OK"
    Write-Host "Token received: $($resp.token.Substring(0, 20))..."
    $token = $resp.token
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

try {
    Write-Host "`n=== Test 4: POST /api/pessoas ===" -ForegroundColor Green
    $body = @{
        nome = "João Silva"
        telefone = "(11)98765-4321"
        email = "joao@example.com"
        senha = "Senha456"
        tipoResiduo = "papel"
        quantidadeKg = 5.5
        observacoes = "residuo de teste"
        latitude = -23.5505
        longitude = -46.6333
    }
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/pessoas" -Method POST -Body ($body | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Status: 201 Created"
    Write-Host "Response: $($resp | ConvertTo-Json)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n[SUCCESS] All tests complete!" -ForegroundColor Cyan
