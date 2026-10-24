# Security, Privacy & Compliance Architecture (Fintech & Consumer Finance)

In consumer financial applications dealing with bank statements, UPI transactions, and spending analysis, **Security & Privacy are critical requirements**. Failure to address them can result in regulatory penalties (RBI / DPDP Act in India, GDPR, PCI-DSS) and user churn due to distrust.

---

## 1. What Are the Major Security & Privacy Risks?

| Risk | Description | Impact |
| :--- | :--- | :--- |
| **1. PII & Financial Exposure** | Bank statements contain full Name, Home Address, Account Number, CIF, and IFSC codes. | Identity theft, phishing attacks, account takeover. |
| **2. Storage of Sensitive Statements** | Storing unencrypted PDFs or raw database rows on public cloud buckets (e.g. unprotected S3). | Major data breach, severe regulatory fines. |
| **3. Mobile SMS Scraping Vulnerabilities** | Requesting `READ_SMS` permission on Android grants access to **all** SMS, including sensitive OTPs and personal messages. | Google Play Store policy violations, user privacy invasion. |
| **4. Third-Party LLM Leaks** | Sending full unmasked statement texts to external AI APIs (OpenAI, Anthropic, etc.). | Financial data stored in third-party server training logs. |
| **5. Regulatory Non-Compliance** | Non-compliance with **India's DPDP Act 2023** (Digital Personal Data Protection Act) and RBI norms. | Mandatory penalties up to ₹250 Crores for data breaches. |

---

## 2. Web App vs. Mobile App: Which is More Secure?

| Security Dimension | 💻 Web App (Client / Zero-Knowledge) | 📱 Mobile App (Android Native) |
| :--- | :--- | :--- |
| **Data Collection Exposure** | **Safer**: Only processes the specific PDF/CSV the user explicitly uploads. | **Riskier**: `READ_SMS` can see all OTPs, personal messages, and bank alerts unless strictly sandboxed. |
| **Google Play / App Store Scrutiny** | **None**: No app store gatekeeper or permission rejections. | **Very High**: Google severely restricts `READ_SMS` permissions and often bans apps that don't prove financial necessity. |
| **Attack Surface** | Web vulnerabilities (XSS, CSRF, TLS) — easily mitigated with modern frameworks like Next.js. | Reverse engineering, rooted device tampering, malware sniffing local SQLite databases. |
| **Device Storage** | Can be 100% in-memory (no files permanently saved to disk). | Often caches raw transaction logs in local SQLite storage. |

---

## 3. The 4 Security Pillars Implemented in Happy Pocket

To win high marks from judges and adhere to banking standards, our app incorporates these 4 security pillars:

### Pillar 1: Zero-Knowledge & Ephemeral Ingestion (No Statement Retention)
* When a user uploads a statement PDF, it is processed **in-memory** or in a temporary isolated buffer.
* Once the transactions are extracted and categorized, **the raw PDF is immediately deleted (`unlink`)**. We **never store raw PDF bank statements on disk**.

### Pillar 2: Automatic PII & Sensitive Entity Masking
Before transactions are displayed on screen or passed to any intelligence layer, sensitive identifiers are sanitized:
* **Account Numbers:** Masked to the last 4 digits (`44006240665` $\to$ `•••• 40665`).
* **CIF & CKYCR Numbers:** Automatically redacted.
* **Home Address & Phone:** Stripped during the layout cleaning phase.

### Pillar 3: On-Premise / Edge Parsing (No Third-Party AI Data Leaks)
* Our parser uses deterministic regex algorithms and local extraction (`pypdf` / WebAssembly).
* Financial statements are **not** blindly shipped to external third-party cloud LLMs where bank balances could be retained.

### Pillar 4: Compliance with Indian Regulations (DPDP Act 2023 & RBI)
* **Explicit Consent:** Data is only parsed when the user explicitly triggers an upload.
* **Right to Erasure:** A single click on **"Reset DB"** flushes all state, balances, and transaction history from memory.
* **Open Banking Alignment:** Compatible with the RBI **Account Aggregator (AA)** framework, which uses end-to-end encrypted financial information packets (FIP to FIU).

---

## 4. Architectural Security Commitments

Happy Pocket enforces privacy by design through four foundational engineering commitments:

1. **Zero-Knowledge Statement Processing:** Bank statements and transaction streams are processed ephemerally in memory; raw statement documents are unlinked and never permanently persisted to disk.
2. **Deterministic Local Parsing:** Financial categorization and entity dissection execute locally or on isolated instances, preventing user account balances and transaction data from leaking to third-party commercial AI training sets.
3. **Automated PII Redaction:** Account numbers, customer identification numbers (CIF), and personal addresses are sanitized prior to display or downstream processing.
4. **Sovereign User Control & Right-to-Erasure:** Users maintain full authority over their financial data with one-click full state purging in accordance with modern digital privacy frameworks.
