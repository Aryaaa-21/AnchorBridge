# AnchorBridge - Decentralized Milestone Escrow Platform

AnchorBridge is a decentralized milestone-based escrow platform built on Stellar and powered by Soroban smart contracts. It enables clients and freelancers to establish ironclad, cryptographic trust. By locking project funds in a smart contract and releasing them tranche-by-tranche upon milestone approval, it protects both parties with zero intermediary fees.

---

## Key Features

1. **Stellar Soroban Smart Contracts**: All escrow deposits are held inside a secure, transparent on-chain vault.
2. **Milestone-Based Releases**: Budgets are divided into milestones. The freelancer submits work and the client approves to disburse funds.
3. **Arbitration Protocol**: Includes a built-in dispute resolution flow. If a milestone is disputed, funds are locked in arbitration for manual or multi-signature settlement.
4. **Real-time Event Streaming**: A client-side polling system hooks into the Soroban RPC `getEvents` stream to update user dashboards instantly when ledger actions occur.
5. **Freighter Wallet Native**: Seamless browser extension integration for signing deposits, approvals, rejections, and refunds.

---

## Repository Structure

```
├── contracts/escrow      # Rust Soroban Smart Contracts
│   ├── src/
│   │   ├── lib.rs        # Contract Entry Point & Methods
│   │   ├── project.rs    # Escrow and Project States
│   │   ├── milestone.rs  # Milestone Creation, Submission, Approval & Rejection
│   │   ├── escrow.rs     # Dispute Locking, Disputes & Settlements
│   │   ├── storage.rs    # Instance and Persistent Storage Operations
│   │   ├── test.rs       # Contract Unit and Workflow Tests
│   │   └── types.rs      # Structs, Enums, and Constants
│   └── Cargo.toml
├── src/                  # React + TypeScript Frontend
│   ├── components/       # UI Components & Layouts
│   ├── config/           # Contract configurations (ID, network settings)
│   ├── pages/            # View pages (Dashboard, Projects, Wallet, Telemetry)
│   ├── services/         # Stellar Service ( Freighter) & Event Listener
│   ├── store/            # Zustand Central State Management
│   └── tests/            # Vitest + React Testing Library suites
└── vite.config.ts        # Vite Bundler configuration
```

---

## Deployment & Setup

### Smart Contract Deployment

1. **Build and Compile the WASM Contract**:
   ```bash
   cd contracts/escrow
   cargo build --target wasm32-unknown-unknown --release
   ```

2. **Optimize WASM**:
   Use the Soroban optimizer to minimize bytecode footprints:
   ```bash
   soroban contract optimize --wasm target/wasm32-unknown-unknown/release/anchorbridge_escrow.wasm
   ```

3. **Deploy to Stellar Testnet**:
   ```bash
   soroban contract deploy \
     --wasm target/wasm32-unknown-unknown/release/anchorbridge_escrow.optimized.wasm \
     --source <DEPLOYER_KEY> \
     --network testnet
   ```

4. **Initialize Contract**:
   Invoke `initialize` with the admin address and target payment asset (e.g. native SAC token address):
   ```bash
   soroban contract invoke \
     --id <CONTRACT_ID> \
     --source <DEPLOYER_KEY> \
     --network testnet \
     -- \
     initialize \
     --admin <ADMIN_ADDRESS> \
     --token <TOKEN_ADDRESS>
   ```

### Frontend Configuration

Ensure the contract ID is bound in `src/config/contracts.ts`:
```typescript
export const ESCROW_CONTRACT_ID = 'CDZZHOW2LRYY7T6WYWAPJZN5BJR2EW6TAUQRJRMCR6JYQJGPKL5C3X7T';
```

---

## Testing

### Rust Smart Contracts Test Suite
Verify state isolation, error bounds, and workflows:
```bash
cd contracts/escrow
cargo test
```

### TypeScript Frontend Test Suite
Verify state management, event logic, and page renderings:
```bash
npm run test
```

---

## Production Architecture & Event Streaming

- **Event Listener**: Polling is implemented inside `src/services/eventListener.ts` using a recursive `setTimeout` loop.
- **Error Backoff**: Features exponential backoff (starting at 5s, multiplying by 1.5 per consecutive failure, capped at 60s) to guarantee server rate limits and network reconnection safety.
- **State Synchronization**: Automatically dispatches events to the Zustand store, resetting balances, updating milestone progression, and sending toast alerts in real-time.
