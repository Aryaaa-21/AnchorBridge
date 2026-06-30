# AnchorBridge

### Decentralized Milestone Escrow Platform on Stellar

Trustless freelance collaboration powered by Stellar and Soroban smart contracts.

Clients lock funds into on-chain escrow. Freelancers complete milestones. Payments are released automatically through smart contract execution after approval.

---

## Live Demo

 [Hosted Link](https://anchorbridge-taupe.vercel.app)

 [Demo Video](https://drive.google.com/file/d/1hG7aL7-fVA0JEII6mdCtELtUWKwsujXE/view?usp=drivesdk)

---

## Problem

Freelancers and clients often rely on centralized platforms that charge high fees and require trust in intermediaries.

Common issues:

- Payment disputes
- Delayed releases
- Platform fees
- Lack of transparency
- No verifiable escrow process

---

## Solution

AnchorBridge provides a decentralized milestone escrow system built entirely on Stellar.

The platform enables:

- On-chain escrow locking
- Milestone-based releases
- Automated fund distribution
- Transparent transaction history
- Verifiable smart contract execution

No middleman.

No platform custody.

No hidden fees.

---

## Key Features

### Smart Contract Escrow

Funds are locked inside a Soroban smart contract until milestone approval.

### Milestone Payments

Release funds step-by-step instead of paying the full amount upfront.

### Freighter Wallet Integration

Connect, sign, and confirm transactions directly from the browser.

### Real-Time Updates

Dashboard automatically updates through Soroban event monitoring.

### Dispute Resolution

Projects can be disputed, refunded, or cancelled according to contract rules.

### Mobile Responsive

Optimized for desktop, tablet, and mobile devices.

---

## Smart Contract

| Field | Value |
|---------|---------|
| Network | Stellar Testnet |
| Contract ID | `CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27` |
| Token Contract | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

### Explorer

Contract:
https://stellar.expert/explorer/testnet/contract/CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27

---

## Architecture

```text
User
  │
  ▼
Freighter Wallet
  │
  ▼
React Frontend
  │
  ▼
Soroban RPC
  │
  ▼
Escrow Smart Contract
  │
  ▼
Stellar Testnet
```

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Zustand

### Blockchain

- Stellar SDK
- Soroban Smart Contracts
- Horizon API
- Soroban RPC
- Freighter Wallet

### Smart Contract

- Rust
- Soroban SDK

---

# Screenshots

## Landing Page

<img width="1909" height="932" alt="image" src="https://github.com/user-attachments/assets/f2acfb56-7e84-4042-9d36-90bba2742820" />

---

## Dashboard

<img width="1912" height="935" alt="image" src="https://github.com/user-attachments/assets/ec681627-3ba0-4770-89f7-955d65780e77" />

---

## Wallet Integration

<img width="1911" height="937" alt="image" src="https://github.com/user-attachments/assets/43aaf822-0620-4443-b228-1eb1efd83d51" />

---

## Create Project

<img width="1914" height="933" alt="image" src="https://github.com/user-attachments/assets/208692fd-11f3-481f-b5ec-bacf477e320a" />

---

## Smart Contract

<img width="1911" height="934" alt="image" src="https://github.com/user-attachments/assets/7f6520da-99db-4c82-bcba-df1774190e8c" />

---

## Event Feed

<img width="1903" height="935" alt="image" src="https://github.com/user-attachments/assets/2cf2726e-9a3e-4b92-aea6-57f122206652" />

---

## Mobile Responsive UI

<img width="376" height="812" alt="image" src="https://github.com/user-attachments/assets/2bc5f137-92f9-4da2-9050-dd2fb56a9764" />

---


# Demo Flow

1. Connect Freighter Wallet
2. Create Project
3. Lock Escrow Funds
4. Submit Milestone
5. Approve Milestone
6. Release Payment
7. Verify Transaction on Stellar Expert

---

# Testing

### Smart Contract Tests

```bash
cargo test
```

Result:

```text
16 Passed
0 Failed
```

### Frontend Tests

```bash
npm run test
```

Result:

```text
12 Passed
0 Failed
```

---

# CI/CD

GitHub Actions automatically run:

- Frontend Build
- Frontend Tests
- Rust Contract Tests
- Type Checking

Add Screenshot Here:

<img width="1902" height="938" alt="image" src="https://github.com/user-attachments/assets/7a9ba21b-b6f9-4884-9681-845fc25b0246" />

---

# Local Setup

## Clone Repository

```bash
git clone https://github.com/Aryaaa-21/AnchorBridge.git

cd AnchorBridge
```

## Install Dependencies

```bash
npm install
```

## Run Frontend

```bash
npm run dev
```

## Run Tests

```bash
npm run test

cargo test
```

---

# Repository Structure

```text
contracts/
docs/
src/
.github/
scripts/
```

---

# Stellar Level Compliance

## Level 1

- Wallet Integration
- Testnet Transactions
- Balance Display
- Transaction Feedback

## Level 2

- Soroban Smart Contract
- Contract Deployment
- Contract Invocation
- Explorer Verification

## Level 3

- Advanced Smart Contract
- Event Streaming
- CI/CD
- Frontend Tests
- Contract Tests
- Mobile Responsive UI
- Production Documentation

---

# Future Scope

- Multi-signature approvals
- DAO-based dispute resolution
- Mainnet deployment
- Cross-contract reputation system
- Multi-token escrow support

---

# License

MIT License
