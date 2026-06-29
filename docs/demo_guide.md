# AnchorBridge - Manual Verification & Demo Script

This walkthrough describes the steps needed to manually verify AnchorBridge's smart contracts and frontend integration on Stellar Testnet.

## Prerequisites

1. **Freighter Wallet**: Installed in your browser.
2. **Testnet Account**: A funded account. The frontend will automatically fund any fresh address using Friendbot.

---

## Step-by-Step Demo Script

### 1. Wallet Connection
- Launch the application locally (`npm run dev`).
- Click **Connect Wallet** in the top right.
- Approve the Freighter access pop-up.
- Verify your address and testnet balance are displayed in the telemetry dashboard.

### 2. Project Creation (Escrow Deposit)
- Navigate to **Create Project** in the sidebar.
- Enter Project Title, Description, and select a Freelancer Address.
- Add milestones with designated token amounts (in XLM).
- Click **Create Project & Lock Escrow**.
- Approve the transaction series on Freighter.
- Verify that the smart contract creates the project, stores the milestones, and locks the escrow deposit.

### 3. Milestone Submission
- Switch your Freighter account to the Freelancer address, or log in as a freelancer.
- Navigate to the project page.
- Select the active milestone and click **Submit Work**.
- Enter submission description text, attach files, and approve the signature prompt.

### 4. Milestone Approval & Payment Release
- Switch back to the Client Freighter account.
- Click **Approve Milestone** on the submitted milestone card.
- Approve the transaction on Freighter.
- Verify that the escrow contract releases the specific milestone funds directly to the freelancer's wallet.

### 5. Disputes & Administrative Controls
- If a dispute is raised, click **Dispute Milestone**.
- Admin accounts can invoke **Refund Client** or **Cancel Project Escrow** on-chain to handle disputes and return remaining funds.
