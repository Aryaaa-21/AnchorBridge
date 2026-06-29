# AnchorBridge — Screenshots Guide

> Add all screenshots to `docs/assets/` and link them here.

---

## 📸 Required Screenshots for Level 3 Submission

---

### 1. Wallet Connected State

**File:** `docs/assets/wallet-connected.png`  
**How to capture:**
1. Open https://anchorbridge-taupe.vercel.app (or localhost:5174)
2. Click Connect Wallet → Approve in Freighter
3. Confirm the wallet address appears in the Navbar
4. Take a full-page screenshot

**What must be visible:**
- Wallet address (truncated: `G...XXXX`)
- XLM balance shown
- "Connected" indicator or green status

---

### 2. Balance Display

**File:** `docs/assets/balance-display.png`  
**How to capture:**
1. Connect wallet
2. Navigate to the Wallet page (`/wallet`)
3. Let the balance load from Horizon
4. Screenshot the full page

**What must be visible:**
- XLM balance number prominently shown
- "Stellar Testnet" network label
- Wallet address shown

---

### 3. Successful Testnet Transaction

**File:** `docs/assets/transaction-success.png`  
**How to capture:**
1. Connect wallet
2. Create a project
3. After confirmation, screenshot the success toast or status overlay
4. Alternatively screenshot the Project page showing the new project

**What must be visible:**
- "Transaction Confirmed" or success toast
- Transaction hash (partially visible)
- OR: New project created successfully message

---

### 4. Mobile Responsive UI

**File:** `docs/assets/mobile-responsive.png`  
**How to capture:**
1. Open Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Select "iPhone 12" (390×844) or custom 375px width
4. Screenshot the landing page or dashboard

**What must be visible:**
- Mobile hamburger menu
- Properly stacked layout (no overflow)
- Readable text and buttons at mobile size

---

### 5. CI/CD Pipeline Running

**File:** `docs/assets/cicd-pipeline.png`  
**How to capture:**
1. Go to: https://github.com/Aryaaa-21/AnchorBridge/actions
2. Click on the most recent workflow run
3. Show both "TS React Frontend CI" and "Rust Smart Contracts CI" passing
4. Screenshot the jobs view with green checkmarks

**What must be visible:**
- Green ✅ checkmarks on both workflows
- Job names visible
- "Success" status badges

---

### 6. Contract Tests Passing

**File:** `docs/assets/contract-tests.png`  
**How to capture:**
```bash
cd contracts/escrow
cargo test -- --nocapture
```
Screenshot the terminal showing all 16 tests passing.

**What must be visible:**
- `test result: ok. 16 passed; 0 failed`
- Individual test names listed
- Execution time shown

---

### 7. Frontend Tests Passing

**File:** `docs/assets/frontend-tests.png`  
**How to capture:**
```bash
npm run test
```
Screenshot the terminal showing all 12 tests passing.

**What must be visible:**
- `Test Files 2 passed (2)`
- `Tests 12 passed (12)`
- No failures

---

### 8. Transaction on Stellar Explorer

**File:** `docs/assets/explorer-tx.png`  
**How to capture:**
1. Open: https://stellar.expert/explorer/testnet/tx/b520a4cfde3e7cf992e95e73327ad05457df53a0a576454eed62c2e0f50e5ed2
2. Screenshot the transaction detail page

**What must be visible:**
- Transaction hash
- Operation type (`invoke_host_function`)
- Contract ID
- SUCCESS status

---

## 📁 Folder Structure

```
docs/
├── assets/
│   ├── wallet-connected.png      ← Add this
│   ├── balance-display.png       ← Add this
│   ├── transaction-success.png   ← Add this
│   ├── mobile-responsive.png     ← Add this
│   ├── cicd-pipeline.png         ← Add this
│   ├── contract-tests.png        ← Add this
│   └── frontend-tests.png        ← Add this
├── SCREENSHOTS.md                ← This file
├── DEMO_VIDEO.md                 ← Demo script
├── SUBMISSION_CHECKLIST.md       ← Full checklist
└── README_ASSETS.md              ← Asset index
```

---

## ✅ Screenshot Progress

| Screenshot | Status |
|-----------|--------|
| Wallet connected | ⬜ Pending |
| Balance display | ⬜ Pending |
| Transaction success | ⬜ Pending |
| Mobile responsive | ⬜ Pending |
| CI/CD pipeline | ⬜ Pending |
| Contract tests | ⬜ Pending |
| Frontend tests | ⬜ Pending |
| Explorer TX | ⬜ Pending |
