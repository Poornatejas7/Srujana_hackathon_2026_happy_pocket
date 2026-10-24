# Happy Pocket — MongoDB Atlas Real-Time Database Architecture

This document details the live **MongoDB Atlas Database Integration** for **Happy Pocket**, including the database schema, real-time CRUD operations, zero mock data policy, and indexing strategy.

---

## 1. Live Connection Specification

* **Database Engine:** MongoDB Atlas (Cloud Cluster 0)
* **Cluster Host:** `cluster0.0bnasia.mongodb.net`
* **Database Name:** `happypocket`
* **Collection Name:** `transactions`
* **Driver:** Mongoose v8.x / Native MongoDB Driver
* **Connection Pooling:** Cached global connection promise with lazy reconnect (`src/lib/mongodb.ts`).
* **Environment Variable:** `MONGODB_URI` stored in `.env.local`.

---

## 2. Canonical Transaction Schema (`src/models/Transaction.ts`)

Every financial event ingested via **Bank Statement PDF**, **UPI QR Scan & Pay**, **P2P Transfer**, or **RBI Account Aggregator stream** is normalized and stored with the following schema:

| Field Name | Type | Description | Index / Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | MongoDB primary key | Primary Unique Index |
| `accountId` | `String` | Linked account identifier (e.g. `acc_primary_sbi`) | Indexed |
| `timestamp` | `Date` | Exact transaction occurrence ISO timestamp | Indexed (Descending) |
| `amount` | `Number` | Signed monetary value in INR (`+` inflow, `-` debit) | Required |
| `currency` | `String` | Currency standard (`INR`) | Default: `INR` |
| `txMode` | `String` | Channel (`UPI`, `IMPS`, `NEFT`, `RTGS`, `NACH_MANDATE`, `CARD_POS`) | Indexed |
| `upiRrn` | `String` | NPCI 12-digit RRN / UTR Reference Number | Indexed |
| `payeeName` | `String` | Counterparty / Merchant clean entity | Extracted |
| `bankCode` | `String` | Acquiring bank IFSC prefix (`UTIB`, `ICIC`, `HDFC`, `SBIN`, `CNRB`) | Extracted |
| `vpaHandle` | `String` | Virtual Payment Address (`@okaxis`, `@paytm`, `@ybl`) | Extracted |
| `remark` | `String` | User note or mandate flag (`Mand`, `Execu`, `AutoPay`) | Extracted |
| `cleanMerchant` | `String` | Normalized merchant title | Enriched |
| `category` | `String` | Spending category (e.g. `Groceries`, `Subscriptions & Digital`) | User Overridable |
| `tier` | `String` | Budget classification (`Essential`, `Discretionary`, `Transfer_or_Offset`) | Enriched |
| `isRecurring` | `Boolean` | Cadence flag for recurring subscriptions and mandates | Filtered |
| `isInternalTransfer` | `Boolean` | Flag indicating money moved between user's own accounts | Anti-Distortion Filter |
| `isRefundOrReversal` | `Boolean` | Flag indicating purchase offset credit | Anti-Distortion Filter |
| `netOutflowAmount` | `Number` | Clean living cost after deducting paired refunds/splits | Computed |
| `userOverridden` | `Boolean` | True if a human-in-the-loop category adjustment was made | Audited |
| `createdAt` / `updatedAt` | `Date` | Automated timestamps | Managed by Mongoose |

---

## 3. End-to-End Real-Time CRUD Operations

Happy Pocket enforces a **zero-mock policy**. All user interactions directly synchronize with MongoDB Atlas:

### A. Reading Transactions (Displaying Ledger & Analytics)
* **Route:** `GET /api/transactions`
* **Action:** Queries MongoDB Atlas collection ordered by `{ timestamp: -1 }`.
* **Impact:** 
  - Recent transactions list on mobile home screen.
  - Full Normalized Ledger table in the Desktop Intelligence Center.
  - Feeds the **Anti-Distortion Engine** to compute True Living Outflow, Self-Transfer deductions, and Refund offsets.
  - Powers the **AI Financial Advisor** knowledge base.

### B. Adding Transactions (Live Payments & Statement Parsing)
* **Route:** `POST /api/transactions`
* **Action:** Accepts individual transaction object or bulk array of normalized transactions.
* **Triggers:**
  - **Scan & Pay modal:** Persists the QR code debit.
  - **Send Money modal:** Persists the P2P transfer.
  - **Live UPI Phone Simulator:** Fires real-time webhook payload into MongoDB.
  - **PDF Statement Upload:** Bulk inserts parsed bank statement records directly into Atlas.
  - **Account Aggregator Authorization:** Streams encrypted bank packets directly into the database.

### C. Editing Transactions (Human-in-the-Loop Override)
* **Route:** `PUT /api/transactions`
* **Payload:** `{ id: string, category: string, tier: string, userOverridden: true }`
* **Action:** Updates the document in MongoDB Atlas by `_id`, re-evaluates spending baselines, and flags `userOverridden: true`.

### D. Deleting Transactions & AutoPay Mandates
* **Route:** `DELETE /api/transactions?id=<id>` or `DELETE /api/transactions?merchant=<merchant>`
* **Action:** Deletes document or cancels recurring AutoPay mandates across the collection.
* **Impact:** The cancelled subscription is removed from database records and annual drain is subtracted from live metrics.

---

## 4. Verification & Testing

To test and verify live database interactions:
1. **Direct Node Seed / Test:**
   ```bash
   node scripts/seed_db.js
   ```
2. **REST API Endpoint Validation:**
   ```bash
   curl -X GET http://localhost:3000/api/transactions
   ```
3. **Inserting a live payment:**
   ```bash
   curl -X POST http://localhost:3000/api/transactions \
     -H "Content-Type: application/json" \
     -d '{"amount": -350, "rawDescription": "UPI/DR/883719284710/SWIGGY/ICIC/swiggy@icici/UPI", "payeeName": "Swiggy", "cleanMerchant": "Swiggy Food Delivery", "category": "Dining & Nightlife"}'
   ```
