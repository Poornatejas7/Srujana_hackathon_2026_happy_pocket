# FinLens (F-05): Financial Visibility & Hidden Expense Discovery

> **Problem Statement F-05 (Consumer Finance & Spending Analysis):**  
> Transform fragmented financial statements into a clear, unified view of living spending behavior, hidden recurring commitments, and overall financial health. The engine eliminates false inflation caused by **self-transfers**, **refunds**, and **P2P shared bills**, while accurately dissecting **UPI, IMPS, NEFT, and card transactions**.

---

## 🚀 Key Features

1. **Universal Indian Bank Statement Parser (`scripts/parse_pdf.py` & `/api/parse-pdf`)**:
   - Parses multi-page statements from **SBI, HDFC, ICICI, Axis, Canara, Bank of Baroda, PNB**, etc.
   - Dissects complex details columns into structured fields:
     - **Transaction Mode** (`WDL TFR`, `DEP TFR`, `IMPS`, `NEFT`, `POS`, `ACH`)
     - **NPCI RRN** (12-digit Retrieval Reference Number)
     - **Payee / Merchant Name** (reconstructs line breaks across columns)
     - **Acquiring Bank Code** (`UTIB`, `HDFC`, `SBIN`, `ICIC`, `CNRB`)
     - **VPA Handle** (`@MEESHOONLI`, `@netflix.bd`, `@ibmseo0031`)
     - **User Remark / Mandate Flag** (`Execu`, `Mand`, `Sent`, `Paym`)
     - **CBS Terminal Reference & Branch Location**

2. **Anti-Distortion & Noise Elimination Engine (`src/lib/engine.ts`)**:
   - **Self-Transfer Deduping**: Detects inter-account movements (e.g. transfers between SBI and Canara Bank) and zeros them out so living expenses are not falsely inflated.
   - **Refund & Reversal Pairing**: Matches credits against debits (e.g., Meesho returns) to reflect true net spending.
   - **Shared Bill & Family Offsets**: Differentiates peer-to-peer transfers from retail merchant spending.

3. **Recurring Commitment & Hidden Drain Discovery**:
   - Automatically tracks recurring UPI AutoPay mandates (Netflix India, Google Play, GoDaddy, Spotify).
   - Computes monthly burn rate and annual financial impact in Indian Rupees (`₹`).

4. **Interactive Web Dashboard (`bank-sim`)**:
   - Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.
   - Clean drag & drop zone for instant PDF parsing.
   - Normalized ledger with full metadata view, category tagging, and net spend calculations.

---

## 📂 Repository Structure

```
HackthonHaked/
├── docs/                                   # Detailed Architecture & Technical Specs
│   ├── FINANCIAL_VISIBILITY_SOLUTION.md    # Complete F-05 solution architecture
│   ├── INDIAN_TRANSACTION_DATA_SPEC.md     # In-depth guide on Indian UPI/banking data formats
│   └── REAL_DATA_INGESTION_GUIDE.md        # Guide on Account Aggregator (AA) & GPay exports
│
├── bank-sim/                               # Next.js Web Application
│   ├── scripts/
│   │   └── parse_pdf.py                    # Universal multi-format Python PDF extractor
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/parse-pdf/route.ts      # Multi-part file upload API endpoint
│   │   │   ├── globals.css                 # Global styles
│   │   │   ├── layout.tsx                  # Root Next.js layout
│   │   │   └── page.tsx                    # Interactive Financial Visibility Dashboard
│   │   ├── data/
│   │   │   └── mockData.ts                 # Sample fallback multi-account statements
│   │   ├── lib/
│   │   │   ├── engine.ts                   # Financial visibility & anti-distortion algorithms
│   │   │   └── pdfParser.ts                # Client-side parser utilities
│   │   └── types/
│   │       └── finance.ts                  # Canonical TypeScript schemas
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
└── AccountStatement_24102026_185027.pdf    # Sample 13-page bank statement for testing
```

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18+ (v22 recommended)
- **Python**: 3.9+ with `pypdf` installed (`python3 -m pip install pypdf`)

### 1. Run the Web Application
```bash
cd bank-sim
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Test PDF Statement Parsing
- Drag & drop your PDF statement (e.g. `AccountStatement_24102026_185027.pdf`) directly onto the dropzone.
- The app will extract all records, categorize them, deduct internal noise, and generate the financial visibility breakdown in Indian Rupees (`₹`).

### 3. Run Parser from Command Line (CLI)
You can also run the Python extractor directly on any PDF statement:
```bash
python3 bank-sim/scripts/parse_pdf.py AccountStatement_24102026_185027.pdf
```

---

## 📚 Technical Documentation & Specs

For deeper technical deep-dives, see the `docs/` folder:
- **[F-05 Solution Architecture](docs/FINANCIAL_VISIBILITY_SOLUTION.md)**: Problem deconstruction, algorithms, and system design.
- **[Indian Transaction Data Specification](docs/INDIAN_TRANSACTION_DATA_SPEC.md)**: Complete breakdown of NPCI UPI strings, RRNs, IFSC bank codes, and regex parsing.
- **[Real Data Ingestion Guide](docs/REAL_DATA_INGESTION_GUIDE.md)**: Open Banking, RBI Account Aggregators (Setu/OneMoney), and GPay Takeout exports.
