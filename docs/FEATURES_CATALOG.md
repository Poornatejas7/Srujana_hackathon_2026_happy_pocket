# Happy Pocket (FinLens) — Complete Feature Catalog & Specification

This document provides a **comprehensive inventory of all existing and newly implemented features** in **Happy Pocket**, mapped directly to **Problem Statement F-05: Financial Visibility and Hidden Expense Discovery**.

---

## 1. Feature Matrix Overview

| Module | Feature Name | Status | Real Implementation State |
| :--- | :--- | :---: | :--- |
| **Ingestion** | **Universal Indian PDF Parser** | ✅ **Live** | Fully functional in `scripts/parse_pdf.py` & `/api/parse-pdf` across SBI, HDFC, ICICI, etc. |
| **Ingestion** | **Password-Protected Statement Decryption** | ✅ **Live** | In-memory modal decryption with Indian bank password hints (DOB/PAN). |
| **Ingestion** | **Multi-Channel Transaction Dissector** | ✅ **Live** | Extracts UPI, RRN, Acquiring Bank, VPA handle, Payee, and CBS Terminal references. |
| **Ingestion** | **Google Pay Takeout & Bank CSV Importer** | ⚠️ **In Progress** | File parser written; UI import button not yet hooked into the new PDF-centric screen. |
| **Anti-Distortion** | **Self-Transfer Deduping Engine** | ✅ **Live** | Automatically detects own-account transfers (e.g. Kotresh/Canara) and sets spend to ₹0.00. |
| **Anti-Distortion** | **Refund & Reversal Pairing** | ✅ **Live** | Pairs return credits (e.g. Meesho) against original debits rather than counting as income. |
| **Anti-Distortion** | **P2P Shared Bill Offset** | ✅ **Live** | Reconciles incoming friend/family UPI transfers as expense offsets. |
| **Categorization** | **Needs vs Wants Tiering** | ✅ **Live** | Classifies into Essential (Groceries, Utilities, Rent) vs Discretionary. |
| **Subscription** | **AutoPay Mandate & Drain Tracker** | ✅ **Live** | Flags `Mand`/`Execu` tokens and recurring 30-day subscriptions (Netflix, Google Play, etc.). |
| **Actionability** | **Normalized Interactive Ledger** | ✅ **Live** | Searchable table displaying RRN, Mode, Beneficiary, Acquiring Bank, and VPA. |
| **Actionability** | **What-If Scenario Sandbox** | ✅ **Live** | Interactive sliders simulating 1-year & 5-year wealth growth from discretionary reductions. |
| **Human-in-Loop** | **User Recategorization Override Loop** | ✅ **Live** | 1-click dispute & re-classify trigger with immediate state recalculation. |
| **Security** | **Zero-Knowledge Ephemeral Pipeline** | ✅ **Live** | No raw statement PDFs permanently saved; files are unlinked (`unlink`) immediately after parsing. |
| **Security** | **Automated PII Redaction** | ✅ **Live** | Masks account numbers (`•••• 40665`), CIF, and addresses during layout cleaning. |

---

## 2. Ingestion & Extraction Features

### 2.1. Universal Multi-Page Bank Statement PDF Parser
- **File:** `scripts/parse_pdf.py` & `src/app/api/parse-pdf/route.ts`
- **What it does:** Extracts multi-page tabular bank statement PDFs with complex column wrapping (tested up to 144+ transactions across 13 pages on State Bank of India).
- **Format Agnostic:** Handles multi-column dates (`DD/MM/YYYY`, `DD-MM-YYYY`, `DD MMM YYYY`), dual-dash debit/credit columns (`- 315.00 - 9,700.14`), and trailing DR/CR markers.

### 2.2. Password-Protected PDF Unlocking (New)
- **What it does:** Automatic detection of encrypted Indian bank statements (`is_encrypted: true`).
- **User Experience:**
  - Pops up an interactive **"Statement is Encrypted"** modal.
  - Provides bank-specific password hints (e.g., SBI: 11-digit A/C or DOB + mobile digits; HDFC: Customer ID; ICICI/Axis: DOB `DDMMYYYY` or lowercase PAN).
  - Handles incorrect password retries seamlessly in memory without re-uploading the file.

### 2.3. Granular UPI & Banking Details Dissection
Cluttered raw narrations like:
```text
WDL TFR UPI/DR/203821706198/MEESHO T/UTIB/MEESHOONLI/UPI 0097695162091 AT 40184
```
are dissected into clean, distinct database columns:
- **Transaction Mode:** `WDL TFR` (Withdrawal Transfer) vs `DEP TFR` (Deposit Transfer).
- **NPCI RRN:** 12-digit standard reference (`203821706198`).
- **Clean Beneficiary:** Normalized entity name (`MEESHO`, `NETFLIX`, `KARNATAKA`).
- **Acquiring Bank Code:** 4-letter IFSC prefix (`UTIB` Axis, `HDFC`, `SBIN`, `ICIC`, `CNRB`).
- **VPA Handle:** `@MEESHOONLI`, `@netflix.bd`, `@ibmseo0031`.
- **User Remarks / Mandate Tokens:** `Execu`, `Mand`, `Sent`, `Paym`.
- **Core Banking Terminal Reference:** `0097695162091 AT 40184` & Branch Location.

---

## 3. Financial Visibility & Anti-Distortion Pipeline

### 3.1. Self-Transfer & Own-Account Elimination
- **Problem Solved:** Moving ₹15,000 from SBI checking to Canara Bank or a savings account is not an expense, but naive banking apps add it to monthly spending.
- **Engine Logic:** Matches transactions referencing user names (`KOTRESH C`, `MYKOTRESH`), internal account identifiers, or equal and opposite flows within a 72-hour window.
- **Outcome:** Tagged as `Internal Transfer`; Net Spend set to **₹0.00**.

### 3.2. Refund & Reversal Pairing
- **Problem Solved:** When a user receives a ₹532 return refund from Meesho, naive apps count it as "Income".
- **Engine Logic:** Pairs credit transactions with historical merchant debits.
- **Outcome:** Directly reduces the original debit's net spend and tags it as `Refund Paired`.

### 3.3. P2P Shared Bill Offset
- **Problem Solved:** A user pays ₹5,400 for a group dinner and receives ₹2,700 back from friends via UPI.
- **Engine Logic:** Detects incoming peer-to-peer transfers with dining/split remarks and reconciles them against discretionary dining outflow.
- **Outcome:** Reflects genuine personal out-of-pocket cost (₹2,700) rather than inflated gross expenditure.

---

## 4. Recurring Drain & Subscription Discovery

### 4.1. AutoPay Mandate & Periodic Detection
- **Detection Algorithm:**
  - Fast periodicity cadence detection ($T \approx 30\text{ days} \pm 3\text{ days}$).
  - Regex identification of UPI AutoPay mandate tokens (`Mand`, `Execu`, `MANDATE`).
- **Commitments Tracked:** Netflix India, Google Play Subscriptions, GoDaddy Domains, Spotify, gym memberships, and utility bills.

### 4.2. Creeping Cost & Zombie Trial Flags
- **Creeping Price Increases:** Flags when regular monthly payments quietly increase (e.g. ₹649 $\to$ ₹799).
- **Zombie Subscriptions:** Highlights recurring digital services where zero recent engagement or trial rollover is detected.

---

## 5. Actionable Dashboard & Simulation Sandbox

### 5.1. True Living Outflow vs Naive Spend Cards
- Displays true monthly expenditure side-by-side with raw naive outflows.
- Clearly itemizes the exact amount of noise removed:
  - *Self-transfers excluded*
  - *Refunds paired*
  - *P2P split bill receipts netted*

### 5.2. "What-If" Scenario Sandbox
- **Interactive Controls:**
  - Toggle 1-click cancellation of zombie subscriptions.
  - Dial discretionary dining & nightlife expenses down by 10% to 50%.
- **Compounding Projections:** Calculates instantaneous monthly savings, 1-year direct cash reserve boost, and 5-year compounding wealth impact (assuming standard 7% returns).

### 5.3. Searchable Normalized Ledger
- Filter by: *All Transactions*, *Recurring Subscriptions*, *Self-Transfers*, *Refunds*, or *Shared Bill Splits*.
- Displays full metadata including Mode, NPCI RRN, Beneficiary, Acquiring Bank, VPA handle, statement amount, and net spend in Indian Rupees (`₹`).

### 5.4. Human-in-the-Loop Re-categorization Memory
- Every transaction includes a **Recategorize** action allowing users to dispute and change its category or tier.
- Custom user rules take precedence over algorithmic defaults for future statements.

---

## 6. Privacy & Security Architecture

### 6.1. Zero-Knowledge Ephemeral Ingestion
- Uploaded statement PDFs are stored temporarily in isolated memory buffers and **unlinked immediately** (`unlink`) after parsing.
- Raw bank statement documents are **never permanently stored** on servers or cloud databases.

### 6.2. On-Premise Deterministic Parsing
- Entity dissection and financial math execute locally using Python `pypdf` and deterministic regex patterns.
- User account balances and statement texts are never sent to third-party commercial AI model training sets.

### 6.3. Automated PII Sanitization
- Bank account numbers are automatically masked to the last 4 digits (`•••• 40665`).
- Customer IDs (CIF), CKYCR numbers, branch contact numbers, and home addresses are stripped during layout cleaning.
