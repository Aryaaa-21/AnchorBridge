#!/bin/bash
# deploy.sh - Automated Soroban Contract Deployment Workflow for AnchorBridge
set -e

# Prepend cargo bin to path
export PATH="$HOME/.cargo/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
NETWORK="testnet"
SOURCE="developer"
TOKEN_ADDRESS="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

echo "=================================================="
echo "   ANCHORBRIDGE DEPLOYMENT WORKFLOW STARTED"
echo "=================================================="
echo "Timestamp: $TIMESTAMP"
echo "Network:   $NETWORK"
echo "Source:    $SOURCE"
echo ""

# 1. Build WASM
echo "[1/5] Building WASM contract..."
cargo build --target wasm32v1-none --release --manifest-path contracts/escrow/Cargo.toml

# 2. Optimize WASM
echo "[2/5] Optimizing WASM binary..."
stellar contract optimize --wasm contracts/escrow/target/wasm32v1-none/release/anchorbridge_escrow.wasm

# 3. Deploy contract
echo "[3/5] Deploying contract to Testnet..."
# Clean local cache to prevent skipping install if previous run was dirty
rm -rf "$HOME/.config/stellar/contract-cache" || true
rm -rf "$HOME/Library/Caches/stellar" || true
rm -rf "$HOME/.cache/stellar" || true

DEPLOY_OUTPUT=$(stellar contract deploy --wasm contracts/escrow/target/wasm32v1-none/release/anchorbridge_escrow.optimized.wasm --source "$SOURCE" --network "$NETWORK")
echo "$DEPLOY_OUTPUT"

# Extract Contract ID
CONTRACT_ID=$(echo "$DEPLOY_OUTPUT" | grep -E "^C[A-Z0-9]{55}$" || true)
if [ -z "$CONTRACT_ID" ]; then
    CONTRACT_ID=$(echo "$DEPLOY_OUTPUT" | grep -oE "C[A-Z0-9]{55}" | tail -n 1 || true)
fi

if [ -z "$CONTRACT_ID" ]; then
    echo "Error: Deployment failed or Contract ID could not be parsed."
    exit 1
fi

echo "Deployed Contract ID: $CONTRACT_ID"

# 4. Initialize contract
echo "[4/5] Initializing contract..."
ADMIN_ADDRESS="GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP"
INIT_OUTPUT=$(stellar contract invoke --id "$CONTRACT_ID" --source "$SOURCE" --network "$NETWORK" -- initialize --admin "$ADMIN_ADDRESS" --token "$TOKEN_ADDRESS" 2>&1)
echo "$INIT_OUTPUT"

# 5. Save generated Contract ID into .env and .env.example
echo "[5/5] Saving contract configuration..."

cat <<EOF > .env
VITE_STELLAR_NETWORK=$NETWORK
VITE_ESCROW_CONTRACT_ID=$CONTRACT_ID
VITE_TOKEN_CONTRACT_ID=$TOKEN_ADDRESS
EOF

cat <<EOF > .env.example
VITE_STELLAR_NETWORK=testnet
VITE_ESCROW_CONTRACT_ID=
VITE_TOKEN_CONTRACT_ID=$TOKEN_ADDRESS
EOF

# 6. Generate deployment logs
mkdir -p scripts
LOG_PATH="scripts/deployment.log"
EXPLORER_LINK="https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"

cat <<EOF > "$LOG_PATH"
==================================================
ANCHORBRIDGE CONTRACT DEPLOYMENT LOG
==================================================
Timestamp:    $TIMESTAMP
Network:      $NETWORK
Contract ID:  $CONTRACT_ID
Token ID:     $TOKEN_ADDRESS
Admin ID:     $ADMIN_ADDRESS
Explorer URL: $EXPLORER_LINK
==================================================
EOF

echo ""
echo "=================================================="
echo "   DEPLOYMENT AND INITIALIZATION SUCCESSFUL!"
echo "=================================================="
echo "Contract Address: $CONTRACT_ID"
echo "Explorer Link:    $EXPLORER_LINK"
echo "Network:          $NETWORK"
echo "Timestamp:        $TIMESTAMP"
echo "=================================================="
