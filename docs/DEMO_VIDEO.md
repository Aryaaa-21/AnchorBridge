# AnchorBridge — Demo Video Script

> **Target Length:** 90–120 seconds  
> **Recording Tool:** OBS Studio, Loom, or Screen Studio  
> **Resolution:** 1920×1080 (or 1280×720 minimum)  
> **Format:** MP4  
> **Upload:** YouTube (unlisted or public) or Loom

---

## 🎬 Scene-by-Scene Script

---

### Scene 1 — Introduction (0:00 – 0:10)

**Screen:** Show the AnchorBridge landing page at https://anchorbridge-taupe.vercel.app  
**Narration / Title Card:**
> "AnchorBridge — Trustless milestone escrow powered by Soroban smart contracts on Stellar."

**What to show:**
- Landing page hero section
- The tagline "Trustless Milestone Escrow on Stellar"
- Scroll down briefly to show stats (XLM escrowed, milestones completed)

---

### Scene 2 — Connect Wallet (0:10 – 0:25)

**Screen:** Click "Connect Wallet" or "Launch Dashboard" button  
**Narration:**
> "Connecting the Freighter wallet. AnchorBridge uses Freighter's native signing for all on-chain operations."

**What to show:**
1. Click the wallet connect button in the Navbar
2. Freighter extension popup appears → click "Approve"
3. Wallet address appears in the Navbar (truncated `G...`)
4. XLM balance displayed (e.g., "9,998.XX XLM")
5. Brief pause to let the balance load

---

### Scene 3 — Create Project / Lock Escrow (0:25 – 0:55)

**Screen:** Navigate to "Create Project" page  
**Narration:**
> "Creating a new escrow project. Funds are locked in the Soroban smart contract until milestones are approved."

**What to show:**
1. Click "Create Project" in sidebar
2. Fill in the form:
   - Title: `"Frontend Dashboard"`
   - Description: `"Build a responsive React dashboard"`
   - Total Escrow: `100`
   - Milestone Count: `2`
   - Freelancer Address: (paste a valid Stellar testnet address)
3. Click "Create Project" → Freighter popup appears
4. Sign the transaction
5. Transaction status overlay: `Preparing → Simulating → Signing → Submitting → Confirmed`
6. Toast: "Project created successfully! Project #X"

---

### Scene 4 — Submit & Approve Milestone (0:55 – 1:20)

**Screen:** Navigate to the newly created project's detail page  
**Narration:**
> "The freelancer submits a milestone. The client reviews and approves, triggering automatic fund release."

**What to show:**
1. Open the project detail page
2. Show the milestone list (status: Active)
3. Click "Submit Milestone" → enter submission text → sign with Freighter
4. Milestone status updates to "Submitted"
5. Click "Approve Milestone" → sign with Freighter
6. Transaction confirmed
7. Milestone status updates to "Approved"
8. Balance decreases as funds release to freelancer

---

### Scene 5 — View on Stellar Explorer (1:20 – 1:35)

**Screen:** Open Stellar Expert  
**Narration:**
> "Every transaction is fully verifiable on-chain through Stellar Expert."

**What to show:**
1. Open: `https://stellar.expert/explorer/testnet/contract/CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27`
2. Show contract invocations list
3. Click on the `approve_milestone` transaction
4. Show the operation details and success status

---

### Scene 6 — Real-Time Event Updates (1:35 – 1:50)

**Screen:** Return to Dashboard  
**Narration:**
> "The event listener streams Soroban contract events in real-time, updating the dashboard without page refresh."

**What to show:**
1. Open browser DevTools console (F12)
2. Show the event polling logs: `Starting Soroban event listener at ledger XXXXXXX`
3. Show notification bell badge in Navbar (unread count)
4. Click bell → show notification feed with event messages
5. Show the dashboard stats updating

---

### Scene 7 — Closing (1:50 – 2:00)

**Screen:** Return to landing page  
**Narration / Title Card:**
> "AnchorBridge — Decentralized escrow for the future of work. Built on Stellar. Secured by Soroban."

**What to show:**
- Landing page
- GitHub link: https://github.com/Aryaaa-21/AnchorBridge
- Live app: https://anchorbridge-taupe.vercel.app

---

## 🎙️ Narration Notes

- Keep pace steady — 1 action per 3–5 seconds
- Zoom into UI elements using `Ctrl + Scroll` or screen recording zoom
- Pause 1–2 seconds after Freighter popups to let them render
- Show the transaction hash or Explorer link after each confirmation
- Do NOT show private keys or secret seeds on screen

---

## 📋 Recording Checklist

- [ ] Freighter installed and funded with testnet XLM
- [ ] Screen resolution set to 1920×1080
- [ ] Browser zoom at 100%
- [ ] DevTools console open (optional, for event log scene)
- [ ] Microphone muted if using text-only captions
- [ ] OBS/Loom recording region covers full browser window
- [ ] Freighter set to Stellar Testnet network

---

## 📤 Upload Instructions

1. Export recording as MP4
2. Upload to YouTube as **Unlisted** or **Public**
3. Add title: `"AnchorBridge — Stellar Level 3 Demo"`
4. Copy the YouTube URL
5. Add it to `README.md` under a `## Demo Video` section
6. Add it to `docs/SUBMISSION_CHECKLIST.md`
