# AnchorBridge — Submission Checklist

> **Submission Level:** Stellar Level 3 — Orange Belt  
> **Repository:** https://github.com/Aryaaa-21/AnchorBridge  
> **Live Demo:** https://anchorbridge-taupe.vercel.app  
> **Contract:** `CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27`

---

## ✅ Level 1 — White Belt Checklist

### Wallet Setup
- [x] Freighter wallet integration implemented (`@stellar/freighter-api`)
- [x] Stellar Testnet configured (`horizon-testnet.stellar.org`, `soroban-testnet.stellar.org`)

### Wallet Connection
- [x] Connect wallet (`requestAccess()` → Freighter prompt)
- [x] Disconnect wallet (`logout()` clears state)

### Balance Handling
- [x] XLM balance fetched from Horizon (`horizonServer.loadAccount()`)
- [x] Balance displayed in Navbar and Wallet page
- [x] Auto-funding via Friendbot for new testnet accounts

### Transaction Flow
- [x] XLM transaction construction and submission (`TransactionBuilder`)
- [x] Transaction signed by Freighter (`signTransaction()`)
- [x] Success state shown (toast + txHash + confirmedTime)
- [x] Failure state shown (error toast + status overlay)
- [x] Transaction hash displayed and linkable

### Development Standards
- [x] UI fully implemented (React + TypeScript + TailwindCSS)
- [x] Wallet integration complete
- [x] Balance fetch implemented
- [x] Transaction logic implemented
- [x] Error handling throughout

### Submission Requirements
- [x] Public GitHub repository
- [x] README.md with project description
- [x] README.md with setup instructions
- [ ] Screenshot: Wallet connected state *(add to docs/assets/)*
- [ ] Screenshot: Balance displayed *(add to docs/assets/)*
- [ ] Screenshot: Successful testnet transaction *(add to docs/assets/)*
- [ ] Screenshot: Transaction result shown to user *(add to docs/assets/)*

---

## ✅ Level 2 — Yellow Belt Checklist

### Error Handling (3+ types)
- [x] `NotInitialized` — Contract not set up
- [x] `Unauthorized` — Wrong caller
- [x] `InvalidStatus` — Action not valid for current state
- [x] `InsufficientBalance` — Amount ≤ 0
- [x] `InvalidMilestoneCount` — Count 0 or > 100
- [x] `ProjectNotFound` — ID doesn't exist
- [x] `MilestoneNotFound` — Index out of bounds
- [x] `AlreadyInitialized` — Double-init guard
- [x] `ReputationOverflow` — Arithmetic overflow protection
> **9 error types** — exceeds minimum requirement of 3

### Smart Contract
- [x] Contract deployed on Stellar Testnet
- [x] Contract ID: `CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27`
- [x] Contract called from frontend (`invokeSorobanContract()` in `stellar.ts`)
- [x] Contract reads via simulation (`queryContract()`)

### Transaction Visibility
- [x] Transaction status overlay with step-by-step progress
- [x] Steps: Preparing → Simulating → Waiting for Signature → Submitting → Confirming → Confirmed
- [x] Transaction hash shown after success
- [x] Error message shown on failure

### Commits
- [x] 20+ meaningful commits with conventional commit format
- [x] `feat`, `fix`, `test`, `ci`, `docs`, `chore` prefixes used

### Submission Requirements
- [x] Public GitHub repository
- [x] README with setup instructions
- [x] 20+ meaningful commits (exceeds 2+ minimum)
- [x] Live demo link in README: https://anchorbridge-taupe.vercel.app
- [x] Deployed contract address in README
- [x] Transaction hash in README (initialization TX)
- [ ] Screenshot: Wallet options available *(add to docs/assets/)*

---

## ✅ Level 3 — Orange Belt Checklist

### Advanced Smart Contract Development
- [x] Multi-module Rust/Soroban architecture (9 modules)
- [x] Project state machine (Created → Funded → Completed/Cancelled/Refunded)
- [x] Milestone lifecycle (Active → Submitted → Approved/Rejected/Disputed)
- [x] Authorization guards on every state-changing function
- [x] Safe arithmetic (`checked_add`) throughout
- [x] Contract upgrade mechanism (`upgrade()` with admin auth)
- [x] Storage migration support (`migration.rs`)
- [x] Reputation scoring system (`reputation.rs`)

### Inter-Contract Communication
- [x] `payment.rs` calls Stellar Asset Contract (SAC) for `token::Client::transfer()`
- [x] Token address stored in contract storage after initialization
- [x] Fund locking: `token.transfer(client → contract)` on `fund_project`
- [x] Fund release: `token.transfer(contract → freelancer)` on `approve_milestone`
- [x] Refund: `token.transfer(contract → client)` on `refund_client`

### Event Streaming & Real-Time Updates
- [x] `eventListener.ts` polls Soroban RPC `getEvents` every 5 seconds
- [x] 7 event types handled: `project_created`, `escrow_funded`, `milestone_submitted`, `milestone_approved`, `milestone_rejected`, `funds_released`, `project_cancelled`
- [x] Exponential backoff on failure (5s → 7.5s → 11.25s → max 60s)
- [x] Zustand store updated on each event
- [x] Toast notifications fired for each event

### CI/CD Pipeline
- [x] `frontend.yml`: Node 22 → `npm ci` → `oxlint` → `vitest run` → `vite build`
- [x] `contract.yml`: Rust stable → `cargo check` → `cargo test`
- [x] Both trigger on push and pull_request to `main`
- [ ] Screenshot: CI/CD pipeline passing *(add to docs/assets/)*

### Smart Contract Deployment Workflow
- [x] Automated `scripts/deploy.ps1` PowerShell script
- [x] Steps: build → optimize → upload → deploy → initialize → save config
- [x] Deployment saves contract ID back to `src/config/contracts.ts`

### Mobile Responsive Frontend
- [x] TailwindCSS responsive classes (`sm:`, `md:`, `lg:`) throughout
- [x] Navbar collapses to hamburger on mobile
- [x] All pages tested on 375px (mobile) viewport
- [ ] Screenshot: Mobile responsive UI *(add to docs/assets/)*

### Error Handling & Loading States
- [x] Transaction status overlay with animated step indicators
- [x] `txStatus.step` transitions: idle → preparing → simulating → signing → submitting → confirming → confirmed/failed
- [x] Toast alerts for success, failure, and warnings (via `sonner`)
- [x] Freighter not installed error with install link
- [x] Wrong network detection and user guidance

### Contract Tests (16 passing)
- [x] `test_initialize`
- [x] `test_create_project_and_fund`
- [x] `test_milestone_workflow`
- [x] `test_refund_client`
- [x] `test_dispute_milestone`
- [x] `test_cancel_project`
- [x] `test_create_milestone_unauthorized`
- [x] `test_submit_milestone_unauthorized`
- [x] `test_approve_milestone_unauthorized`
- [x] `test_milestone_invalid_index`
- [x] `test_invalid_milestone_count`
- [x] `test_invalid_escrow_amount`
- [x] `test_missing_initialization`
- [x] `test_create_project_auth_failure`
- [x] `test_duplicate_project_creation`
- [x] `integration_test_multiple_projects`
- [ ] Screenshot: Test output with 16 passing *(add to docs/assets/)*

### Frontend Tests (12 passing)
- [x] Default state initialization
- [x] Theme toggle + localStorage persistence
- [x] Login state management
- [x] Logout credential clearing
- [x] Notification management
- [x] TxStatus reset
- [x] Landing page render
- [x] Navigation elements
- [ ] Screenshot: Frontend test output *(add to docs/assets/)*

### Production-Ready Architecture
- [x] Zustand central state management
- [x] Horizon + Soroban RPC abstraction in `stellar.ts`
- [x] Type-safe ScVal serializer with function layout map
- [x] Vercel production deployment
- [x] Environment variable support (`VITE_ESCROW_CONTRACT_ID`, etc.)

### Documentation
- [x] README with architecture overview
- [x] README with deployment instructions
- [x] README with test commands
- [x] README with CI/CD badges
- [x] README with Explorer links
- [x] `docs/SCREENSHOTS.md` — Screenshot guide
- [x] `docs/DEMO_VIDEO.md` — Demo video script
- [x] `docs/SUBMISSION_CHECKLIST.md` — This file

### Submission Requirements
- [x] Public GitHub repository
- [x] README with complete documentation
- [x] 20+ meaningful commits (exceeds 10+ minimum)
- [x] Live demo link: https://anchorbridge-taupe.vercel.app
- [x] Contract deployment address: `CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27`
- [x] Transaction hash: `b520a4cfde3e7cf992e95e73327ad05457df53a0a576454eed62c2e0f50e5ed2`
- [ ] Screenshot: Mobile responsive UI
- [ ] Screenshot: CI/CD pipeline running
- [ ] Screenshot: Test output with 3+ passing
- [ ] Demo video (1–2 minutes)

---

## 📸 Remaining Evidence Items

These items require manual screenshots or video recording. All technical implementations are complete.

| Item | Action Required | Priority |
|------|----------------|----------|
| Mobile responsive UI | Screenshot at 375px width | HIGH |
| CI/CD pipeline passing | GitHub Actions screenshot | HIGH |
| Contract test output | `cargo test` terminal screenshot | HIGH |
| Frontend test output | `npm test` terminal screenshot | HIGH |
| Wallet connected state | App screenshot with Freighter connected | MEDIUM |
| Balance displayed | Wallet page screenshot | MEDIUM |
| Transaction success | Toast/hash screenshot after tx | MEDIUM |
| Demo video | 90–120s screen recording | HIGH |

See `docs/DEMO_VIDEO.md` for the full recording script.

---

## 🔗 Quick Reference

| Resource | Link |
|----------|------|
| Live App | https://anchorbridge-taupe.vercel.app |
| GitHub | https://github.com/Aryaaa-21/AnchorBridge |
| Contract | https://stellar.expert/explorer/testnet/contract/CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27 |
| Init TX | https://stellar.expert/explorer/testnet/tx/b520a4cfde3e7cf992e95e73327ad05457df53a0a576454eed62c2e0f50e5ed2 |
