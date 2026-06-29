// src/config/contracts.ts
import { Networks } from 'stellar-sdk';

// Load environment variables with safety fallbacks
export const NETWORK_PASSPHRASE = import.meta.env.VITE_STELLAR_PASS || Networks.TESTNET;
export const RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';

// Deployed contract addresses
export const ESCROW_CONTRACT_ID = import.meta.env.VITE_ESCROW_CONTRACT_ID || 'CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27';
export const TOKEN_CONTRACT_ID = import.meta.env.VITE_TOKEN_CONTRACT_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

// Validate contract IDs are present and formatted correctly
const checkValidContractId = (id: string, name: string) => {
  if (!id) {
    console.error(`Warning: ${name} is not set in environment.`);
    return false;
  }
  if (!/^C[A-Z0-9]{55}$/.test(id)) {
    console.error(`Warning: ${name} (${id}) is not a valid Stellar contract ID.`);
    return false;
  }
  return true;
};

checkValidContractId(ESCROW_CONTRACT_ID, 'ESCROW_CONTRACT_ID');
checkValidContractId(TOKEN_CONTRACT_ID, 'TOKEN_CONTRACT_ID');
