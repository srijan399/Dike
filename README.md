# 🏆 DIKE Protocol  
### ETHGlobal New Delhi 2025 — Winner & Finalist Presentation on Stage  
> A capital-efficient, chainable prediction market primitive built upon a novel concept.

---

## 🚀 Overview

**DIKE Protocol** is a decentralized financial primitive that introduces **Prediction Chaining** — a mechanism where collateral from one prediction finances participation in another. Instead of locking capital into siloed, independent bets, a single initial deposit can recursively back an entire chain of conditional predictions.

Inspired by Paradigm's *Multiverse Finance* concept, DIKE transforms the theory into a working protocol and product.

✅ Built at **ETHGlobal New Delhi 2025**  
✅ Chosen as a **Winner + Stage Finalist** from **1600+ participants** and **610+ projects**

---

## ✨ Core Innovation: Prediction Chaining

Traditional prediction markets require separate collateral for each bet:

```

Prediction A (locked capital)
Prediction B (locked capital)
Prediction C (locked capital)

```

DIKE changes that:

```

Prediction A → collateral → borrow → Prediction B → collateral → borrow → Prediction C → ...

```

Each prediction creates borrowing power that can fund the next.  
→ Increasing *capital efficiency* and *potential ROI*.

> With DIKE, users can achieve up to **2.91× ROI** vs. traditional markets — using the same initial capital.

---

## 🧠 How It Works (Mechanism)

1. User opens a position on **Prediction A** by posting collateral.
2. Based on the value of Position A, the user receives an **undercollateralized loan**.
3. Loan funds **Prediction B**, which can fund **Prediction C**, and so on.
4. The system manages:
   - Collateralization ratios
   - Chain health
   - Liquidation triggers
   - Final settlement

Each prediction exists in a **conditional universe**, dependent on the parent outcome.

---

## 🧮 Risk & Economic Framework

| Component                   | Description |
|----------------------------|-------------|
| **Collateralization ratio (CR)** | Ensures solvency across chained predictions |
| **Prediction Chain Health Score (H)** | Measures whether the chain can sustain leveraged positions |
| **Liquidation Rules** | If a parent prediction loses, *all dependent child positions auto-liquidate* |
| **Settlement Engine** | Propagates PnL from leaf to root |

Our whitepaper defines the mathematical model supporting chain health, recursive payoff propagation, and capital constraints.

---

## 🛠️ Tech Stack

| Layer            | Tools |
|------------------|-------|
| Smart Contracts  | Solidity (Foundry + Hardhat) |
| Frontend         | Next.js, Wagmi, viem |
| Indexing / Subgraph | The Graph |
| Chain Deployment | (update based on your deployment) |

---

## 💡 Example Flow

```text
User deposits 1 ETH
↓
Creates Prediction A (Yes/No Market)
↓ (gains borrowing power)
Takes loan to enter Prediction B
↓
If A and B resolve in user’s favor → amplified ROI
If A fails → entire subtree liquidates
````

---

## 🖥️ Running Locally

### Install

```bash
git clone https://github.com/srijan399/Dike.git
cd Dike
yarn install
```

### Deploy Contracts

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network <network-name>
```

### Run Frontend

```bash
cd frontend
yarn dev
```

---

## ⭐ If you like this project…

Please ⭐ the repo — it helps more people discover DIKE.

---

> *"We didn't just build an app. We created a new financial primitive."*
