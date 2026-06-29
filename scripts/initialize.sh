#!/bin/bash
# initialize.sh - Initialize an already deployed AnchorBridge escrow contract
set -e

if [ -z "$1" ]; then
    echo "Usage: ./initialize.sh <CONTRACT_ID>"
    exit 1
fi

CONTRACT_ID=$1
export PATH="$HOME/.cargo/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

NETWORK="testnet"
SOURCE="developer"
TOKEN_ADDRESS="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
ADMIN_ADDRESS="GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP"

echo "Initializing contract $CONTRACT_ID..."
INIT_OUTPUT=$(stellar contract invoke --id "$CONTRACT_ID" --source "$SOURCE" --network "$NETWORK" -- initialize --admin "$ADMIN_ADDRESS" --token "$TOKEN_ADDRESS" 2>&1)
echo "$INIT_OUTPUT"

if echo "$INIT_OUTPUT" | grep -q "error" && ! echo "$INIT_OUTPUT" | grep -q "AlreadyInitialized"; then
    echo "Contract initialization failed."
    exit 1
else
    echo "Contract $CONTRACT_ID successfully initialized!"
fi
