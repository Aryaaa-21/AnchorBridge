# deploy.ps1 - Automated Soroban Contract Deployment Workflow for AnchorBridge
$ErrorActionPreference = "Stop"

# Ensure Cargo/rustc paths are prioritized
$env:PATH = "C:\Users\Arya Bhagat\.cargo\bin;" + $env:PATH

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$network = "testnet"
$source = "developer"
$tokenAddress = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" # Native XLM on Testnet

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   ANCHORBRIDGE DEPLOYMENT WORKFLOW STARTED" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp"
Write-Host "Network:   $network"
Write-Host "Source:    $source"
Write-Host ""

# 1. Build optimized WASM
Write-Host "[1/5] Building WASM contract..." -ForegroundColor Yellow
$buildPath = "contracts/escrow/Cargo.toml"
cargo build --target wasm32v1-none --release --manifest-path $buildPath

# 2. Optimize WASM binary
Write-Host "[2/5] Optimizing WASM binary..." -ForegroundColor Yellow
$wasmPath = "contracts/escrow/target/wasm32v1-none/release/anchorbridge_escrow.wasm"
$optimizedPath = "contracts/escrow/target/wasm32v1-none/release/anchorbridge_escrow.optimized.wasm"
stellar contract optimize --wasm $wasmPath

# 3. Deploy escrow contract to Stellar Testnet
Write-Host "[3/5] Installing WASM bytecode on Testnet..." -ForegroundColor Yellow
# Clean local cache to prevent skipping install if previous run was dirty
$specDir = "C:\Users\Arya Bhagat\AppData\Local\stellar\stellar-cli\data\spec"
if (Test-Path $specDir) {
    Get-ChildItem $specDir | Remove-Item -Force
}

$installOutput = stellar contract install --wasm $optimizedPath --source $source --network $network
$installOutputStr = $installOutput | Out-String
Write-Host $installOutputStr

# Extract Wasm hash
$wasmHash = ""
foreach ($line in ($installOutputStr -split "`n")) {
    $trimmed = $line.Trim()
    if ($trimmed -match "^[a-fA-F0-9]{64}$") {
        $wasmHash = $trimmed
    }
}
if (-not $wasmHash) {
    if ($installOutputStr -match "([a-fA-F0-9]{64})") {
        $wasmHash = $Matches[1]
    }
}
if (-not $wasmHash) {
    Write-Error "WASM installation failed or hash could not be parsed."
}
Write-Host "WASM Hash: $wasmHash" -ForegroundColor Green

Write-Host "Deploying contract instance to Testnet..." -ForegroundColor Yellow
$deployOutput = stellar contract deploy --wasm-hash $wasmHash --source $source --network $network
$deployOutputStr = $deployOutput | Out-String
Write-Host $deployOutputStr

# Extract contract ID (which is the last line of deployment output, or matches G/C address pattern)
$contractId = ""
foreach ($line in ($deployOutputStr -split "`n")) {
    $trimmed = $line.Trim()
    if ($trimmed -match "^C[A-Z0-9]{55}$") {
        $contractId = $trimmed
    }
}

if (-not $contractId) {
    if ($deployOutputStr -match "([oO]utput|[dD]eployed!)\s+(C[A-Z0-9]{55})") {
        $contractId = $Matches[2]
    } elseif ($deployOutputStr -match "(C[A-Z0-9]{55})") {
        $contractId = $Matches[1]
    }
}

if (-not $contractId) {
    Write-Error "Deployment failed or Contract ID could not be parsed."
}

Write-Host "Deployed Contract ID: $contractId" -ForegroundColor Green

# 4. Initialize contract
Write-Host "[4/5] Initializing contract..." -ForegroundColor Yellow
$adminAddress = "GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP"
$initOutput = stellar contract invoke --id $contractId --source $source --network $network -- initialize --admin $adminAddress --token $tokenAddress
$initOutputStr = $initOutput | Out-String
Write-Host $initOutputStr

if ($initOutputStr -match "error" -and -not ($initOutputStr -match "AlreadyInitialized")) {
    Write-Error "Contract initialization failed: $initOutputStr"
}

# 5. Save generated Contract ID into .env and .env.example
Write-Host "[5/5] Saving contract configuration..." -ForegroundColor Yellow

$envContent = @"
VITE_STELLAR_NETWORK=$network
VITE_ESCROW_CONTRACT_ID=$contractId
VITE_TOKEN_CONTRACT_ID=$tokenAddress
"@

$envExampleContent = @"
VITE_STELLAR_NETWORK=testnet
VITE_ESCROW_CONTRACT_ID=
VITE_TOKEN_CONTRACT_ID=$tokenAddress
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -Force
$envExampleContent | Out-File -FilePath ".env.example" -Encoding utf8 -Force

# 6. Generate deployment logs
$logPath = "scripts/deployment.log"
$explorerLink = "https://stellar.expert/explorer/testnet/contract/$contractId"

$logContent = @"
==================================================
ANCHORBRIDGE CONTRACT DEPLOYMENT LOG
==================================================
Timestamp:    $timestamp
Network:      $network
Contract ID:  $contractId
Token ID:     $tokenAddress
Admin ID:     $adminAddress
Explorer URL: $explorerLink
==================================================
"@

$logContent | Out-File -FilePath $logPath -Encoding utf8 -Force

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT AND INITIALIZATION SUCCESSFUL!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Contract Address: $contractId"
Write-Host "Explorer Link:    $explorerLink"
Write-Host "Network:          $network"
Write-Host "Timestamp:        $timestamp"
Write-Host "==================================================" -ForegroundColor Green
