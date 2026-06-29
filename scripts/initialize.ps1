# initialize.ps1 - Initialize an already deployed AnchorBridge escrow contract
param (
    [Parameter(Mandatory=$true)]
    [string]$ContractId
)

$ErrorActionPreference = "Stop"
$env:PATH = "C:\Users\Arya Bhagat\.cargo\bin;" + $env:PATH

$network = "testnet"
$source = "developer"
$tokenAddress = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" # Native XLM on Testnet
$adminAddress = "GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP"

Write-Host "Initializing contract $ContractId..." -ForegroundColor Yellow
$initOutput = stellar contract invoke --id $ContractId --source $source --network $network -- initialize --admin $adminAddress --token $tokenAddress 2>&1
$initOutputStr = $initOutput | Out-String
Write-Host $initOutputStr

if ($initOutputStr -match "error" -and -not ($initOutputStr -match "AlreadyInitialized")) {
    Write-Error "Contract initialization failed: $initOutputStr"
} else {
    Write-Host "Contract $ContractId successfully initialized!" -ForegroundColor Green
}
