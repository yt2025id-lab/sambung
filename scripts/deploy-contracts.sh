#!/bin/bash
set -euo pipefail

NETWORK="${1:-testnet}"

if [ "$NETWORK" = "testnet" ]; then
  RPC_URL="https://soroban-testnet.stellar.org"
  PASSPHRASE="Test SDF Network ; September 2015"
elif [ "$NETWORK" = "mainnet" ]; then
  RPC_URL="https://soroban.stellar.org"
  PASSPHRASE="Public Global Stellar Network ; September 2015"
else
  echo "Usage: $0 [testnet|mainnet]"
  exit 1
fi

echo "Building contracts..."
stellar contract build --manifest-path contracts/payment-gateway/Cargo.toml

echo "Deploying payment-gateway to $NETWORK..."
stellar contract deploy \
  --wasm contracts/target/wasm32v1-none/release/payment_gateway.wasm \
  --source sambung-treasury \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$PASSPHRASE"

echo "Done! Save the contract ID to your .env as PAYMENT_GATEWAY_CONTRACT_ID"
