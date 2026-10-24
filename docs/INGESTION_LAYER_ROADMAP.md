# Ingestion Layer: Gap Analysis, Enhancements & Roadmap

The **Ingestion Layer** is the gateway to the entire financial intelligence pipeline. If data enters incompletely, inaccurately, or with friction, downstream classification and anti-distortion will suffer.

Here is a comprehensive breakdown of **what we have**, **what gaps exist**, and **what we need to add and improve** to make this production-ready.

---

## 1. Current State vs. Target State

```
Current State (Hackathon MVP):
├── Bank Statement PDF Parser (SBI, HDFC, ICICI, etc.)
└── Mock Dataset Fallbacks

Target State (Production / Comprehensive Ingestion):
├── 1. Password-Protected PDF Unlocking (Standard across all Indian banks)
├── 2. Bank-Specific Excel / CSV Importer (.xlsx / .csv)
├── 3. Google Pay & PhonePe Takeout Parser (JSON / CSV)
├── 4. Account Aggregator (AA) Sandbox Client (Live OTP Bank Feeds)
├── 5. Statement OCR Fallback (for scanned/photo statements)
└── 6. Multi-Account Batch Ingestion (Ingest 3 accounts at once)
```

---

## 2. Key Improvements Needed in the Ingestion Layer

### Improvement 1: Password-Protected PDF Handling (Critical for India)
> **The Problem:** 95% of bank statements in India (SBI, HDFC, ICICI, Axis) are password-protected by default (e.g., DOB + last 4 digits of phone, or PAN in lowercase). Currently, if a user uploads a locked PDF, `pypdf` will throw `FileEncryptedError`.

* **What to Add:**
  - Detect `reader.is_encrypted`.
  - Prompt user with a clean UI modal: *"This statement is password protected. Enter password (usually DOB DDMMYYYY or PAN)"*.
  - Pass the password securely in memory: `reader.decrypt(password)`.

---

### Improvement 2: Multi-Bank Statement CSV & Excel (`.xlsx`) Parsers
> **The Problem:** Many users download Excel/CSV statements rather than PDFs. Net banking portals (ICICI, HDFC, Axis, Kotak) offer tabular exports with slightly different column headers (`Txn Date` vs `Transaction Date`, `Dr Amount` vs `Debit`, etc.).

* **What to Add:**
  - Header autodetection:
    ```python
    HEADER_SYNONYMS = {
        'date': ['date', 'txn date', 'transaction date', 'value date'],
        'description': ['narration', 'particulars', 'description', 'remarks', 'transaction details'],
        'debit': ['withdrawal', 'dr', 'debit', 'debit amount', 'withdrawal amt'],
        'credit': ['deposit', 'cr', 'credit', 'credit amount', 'deposit amt'],
        'balance': ['balance', 'closing balance', 'running balance']
    }
    ```

---

### Improvement 3: Multi-Account Batch Ingestion
> **The Problem:** Financial fragmentation (Problem Statement F-05) happens because spending is distributed across **multiple** accounts (e.g. User has an SBI Salary account, an HDFC Credit Card, and an Axis Savings account). Ingesting only one PDF at a time prevents full cross-account self-transfer matching.

* **What to Add:**
  - Dropzone supporting multi-file uploads: `files: FileList`.
  - Assign each file to an account entity:
    - `File 1: SBI_Savings.pdf` $\to$ Account: `acc_sbi`
    - `File 2: HDFC_CreditCard.pdf` $\to$ Account: `acc_hdfc_cc`
  - Cross-reconcile transactions across all ingested accounts simultaneously.

---

### Improvement 4: GPay, PhonePe & Paytm Ingestion
> **The Problem:** Bank statements often abbreviate UPI VPAs (`UPI/DR/.../swiggy@icici`). GPay and PhonePe transaction exports provide richer metadata (merchant logos, exact merchant categories, order IDs).

* **What to Add:**
  - A dedicated tab in the UI: **"Import from UPI Apps"**.
  - Direct schema parser for:
    - **Google Takeout GPay JSON**: `takeout-*.json`
    - **PhonePe Statement PDF / CSV**: Monthly transaction statements downloaded directly from the PhonePe app profile.

---

### Improvement 5: Account Aggregator (AA) Gateway Mock / Integration
> **The Problem:** Manually downloading and uploading PDFs has high friction. The future of consumer finance in India is the **RBI Account Aggregator (AA)** framework.

* **What to Add (for demo/hackathon impact):**
  - An interactive **"Connect via Account Aggregator"** button.
  - Simulates the real AA consent flow:
    1. Enter Mobile Number: `+91 98765 43210`.
    2. Enter OTP: `123456`.
    3. Fetches live digitally signed JSON statements directly via **Setu AA / Finvu Sandbox**.

---

## 3. Prioritized Implementation Roadmap

| Priority | Feature / Addition | Effort | Value to Judges & Users |
| :---: | :--- | :---: | :---: |
| **P0** | **Password-Protected PDF Support** (prompts for DOB/PAN password) | 1 hour | **Vital**: Stops 90% of real-world statement upload crashes. |
| **P1** | **Multi-Account Batch Ingestion** (drop 2 or 3 statements together) | 1.5 hours | **High**: Directly proves F-05 problem statement (multi-account fragmentation). |
| **P2** | **CSV / Excel Auto-Detection** (flexible column header mapper) | 1 hour | **Medium**: Users who don't have PDFs can upload CSVs. |
| **P3** | **Interactive AA Consent Demo Flow** (OTP-based live simulation) | 1.5 hours | **High Wow Factor**: Shows judges a venture-backed fintech roadmap. |
