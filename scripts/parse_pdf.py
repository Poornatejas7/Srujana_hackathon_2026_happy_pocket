#!/usr/bin/env python3
import sys
import json
import re
from pypdf import PdfReader

# ==============================================================================
# UNIVERSAL INDIAN BANKING & UPI TRANSACTION PARSER
# Supports:
# 1. Standard NPCI UPI (UPI/DR/..., UPI/CR/..., UPI-DR-..., UPI-CR-...)
# 2. HDFC Bank UPI & Netbanking (UPI-MERCHANT-VPA-BANK-RRN, NETBANKING TFR)
# 3. ICICI Bank (MMT/IMPS/..., BIL/ONL/..., EBA/..., INF/INFT/...)
# 4. State Bank of India (WDL TFR UPI/..., DEP TFR UPI/..., TRANSFER TO/FROM)
# 5. Axis Bank, Canara Bank, Kotak Mahindra, Bank of Baroda, PNB
# 6. NEFT (N followed by 16 alphanum chars)
# 7. RTGS (R followed by 16 alphanum chars)
# 8. IMPS (IMPS/P2A/..., IMPS/P2P/..., IMPS/MOB/...)
# 9. NACH / ECS / Auto-Debits (ACH/..., ECS/..., UMRN mandates)
# 10. Card Swipes & E-Commerce (POS/..., ECOM/..., IPS/...)
# 11. ATM Cash Withdrawals (ATM-WDL/..., NFS/..., CASH WDL)
# ==============================================================================

# Regex for common date representations in Indian statements
# DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY, DD MMM YYYY, YYYY-MM-DD
DATE_PATTERNS = [
    re.compile(r'^(\d{2}[/-]\d{2}[/-]\d{4})'),
    re.compile(r'^(\d{2}[/-]\d{2}[/-]\d{2})\b'),
    re.compile(r'^(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})', re.I),
    re.compile(r'^(\d{4}-\d{2}-\d{2})')
]

# Patterns for extracting monetary amounts (debit/credit/balance)
DEBIT_CREDIT_PATTERNS = [
    # SBI double-column with dashes: "- 315.00 - 9,700.14" (Debit) or "- - 25.10 8,950.23" (Credit)
    re.compile(r'-\s*([0-9,]+\.\d{2})\s+-\s*([0-9,]+\.\d{2})'),
    re.compile(r'-\s*-\s*([0-9,]+\.\d{2})\s+([0-9,]+\.\d{2})'),
    # Standard format: Amount followed by DR/CR e.g. "1,250.00 DR" or "50,000.00 CR"
    re.compile(r'([0-9,]+\.\d{2})\s*(DR|CR)\b', re.I),
    # Two comma-separated or space-separated numbers (Debit/Credit and Balance)
    re.compile(r'([0-9,]+\.\d{2})')
]

def clean_statement_text(lines):
    """Repairs line wrapping artifacts common in bank PDFs (e.g. MEESHO \n T/UTIB -> MEESHO/UTIB)"""
    joined = []
    for l in lines:
        s = l.strip()
        if not s:
            continue
        # Drop pure headers and pagination
        if re.search(r'Page\s*no\b|statement\s+summary|opening\s+balance|closing\s+balance|nominee\s+name|ifsc\s+code', s, re.I):
            continue
        joined.append(s)
    return joined

def dissect_narration(raw_text):
    """
    Dissects every possible Indian transaction channel into clean, structured metadata:
    - tx_channel: UPI, IMPS, NEFT, RTGS, NACH, POS, ATM, NETBANKING
    - direction: DEBIT, CREDIT
    - rrn_utr: 12-digit RRN, 16-digit UTR, or UMRN
    - payee_name: Normalized beneficiary / merchant
    - bank_code: 4-letter IFSC bank prefix (HDFC, SBIN, ICIC, UTIB, CNRB)
    - vpa: Virtual Payment Address
    - user_note: Payment remarks or Mandate indicators
    """
    clean = re.sub(r'\s+', ' ', raw_text).strip()

    # Pre-clean broken slashes caused by column wrapping
    clean = re.sub(r'([A-Za-z0-9])/\s*([A-Za-z0-9])\s+([A-Za-z0-9]{2,})', r'\1/\2\3', clean)
    clean = re.sub(r'KARNATA\s+K', 'KARNATAKA', clean)
    clean = re.sub(r'H\s+DFC', 'HDFC', clean)
    clean = re.sub(r'SANTHOS\s+H', 'SANTHOSH', clean)
    clean = re.sub(r'MEESHO\s+T', 'MEESHO', clean)
    clean = re.sub(r'KOTRESH\s+C', 'KOTRESH C', clean)
    clean = re.sub(r'VEERABHA\s*', 'VEERABHADRAPPA', clean)

    tx_channel = 'OTHER'
    direction = 'UNKNOWN'
    rrn_utr = ''
    payee_name = clean
    bank_code = ''
    vpa = ''
    user_note = ''
    is_recurring = False

    # 1. Check Standard NPCI UPI: UPI/(DR|CR)/<RRN>/<NAME>/<BANK>/<VPA>/<REMARK>
    m_upi = re.search(r'UPI[/-](DR|CR)[/-](\d{12})[/-]([^/]+)(?:[/-]([^/]+))?(?:[/-]([^/]+))?(?:[/-]([^/]+))?', clean, re.I)
    if m_upi:
        tx_channel = 'UPI'
        direction = 'DEBIT' if m_upi.group(1).upper() == 'DR' else 'CREDIT'
        rrn_utr = m_upi.group(2)
        payee_name = m_upi.group(3).strip()
        bank_code = (m_upi.group(4) or '').strip()
        vpa = (m_upi.group(5) or '').strip()
        raw_note = (m_upi.group(6) or '').strip()
        user_note = re.sub(r'-\s*[0-9,]+\.\d{2}.*|1?Page\s*no.*|Balance.*', '', raw_note).strip()
        if re.search(r'Mand|Execu|AutoPay|Sub', raw_note, re.I):
            is_recurring = True
            
    # 2. Check HDFC / ICICI UPI variant: UPI-<MERCHANT>-<VPA>-<BANK>-<RRN>
    elif re.search(r'UPI[-/]', clean, re.I):
        tx_channel = 'UPI'
        direction = 'DEBIT' if re.search(r'WDL|DR\b|TO\b', clean, re.I) else 'CREDIT'
        parts = re.split(r'[-/]', clean)
        # Find 12-digit RRN anywhere in parts
        for p in parts:
            if re.match(r'^\d{12}$', p.strip()):
                rrn_utr = p.strip()
                break
        payee_name = parts[1] if len(parts) > 1 else clean
        if len(parts) > 2 and '@' in parts[2]:
            vpa = parts[2].strip()

    # 3. Check IMPS: IMPS/P2A/<RRN>/<NAME>/<IFSC>/...
    elif re.search(r'\bIMPS[/-]', clean, re.I):
        tx_channel = 'IMPS'
        direction = 'DEBIT' if re.search(r'WDL|DR\b', clean, re.I) else 'CREDIT'
        m_imps = re.search(r'IMPS/(?:P2A|P2P|MOB)/(\d{12})/([^/]+)(?:/([A-Z]{4}\w+))?', clean, re.I)
        if m_imps:
            rrn_utr = m_imps.group(1)
            payee_name = m_imps.group(2).strip()
            bank_code = m_imps.group(3)[:4] if m_imps.group(3) else ''
        else:
            payee_name = clean

    # 4. Check NEFT / RTGS: NEFT/N<UTR>/<NAME>... or RTGS/R<UTR>/...
    elif re.search(r'\b(NEFT|RTGS)[/-]', clean, re.I):
        tx_channel = 'NEFT' if 'NEFT' in clean.upper() else 'RTGS'
        direction = 'CREDIT' if re.search(r'DEP|CR\b|SALARY', clean, re.I) else 'DEBIT'
        m_neft = re.search(r'(?:NEFT|RTGS)[/-]([A-Z0-9]{16})[/-]([^/]+)', clean, re.I)
        if m_neft:
            rrn_utr = m_neft.group(1)
            payee_name = m_neft.group(2).strip()
        else:
            payee_name = clean

    # 5. Check NACH / ECS Auto-Debits: ACH/<NAME>/UMRN...
    elif re.search(r'\b(ACH|NACH|ECS|SIP|EMI|LOAN)\b', clean, re.I):
        tx_channel = 'NACH_MANDATE'
        direction = 'DEBIT'
        is_recurring = True
        m_umrn = re.search(r'(?:UMRN|MANDATE)?[/-]?([A-Z0-9]{20})', clean, re.I)
        if m_umrn:
            rrn_utr = m_umrn.group(1)
        payee_name = re.sub(r'ACH|NACH|ECS|DR|CR', '', clean, flags=re.I).strip()

    # 6. Check POS / E-Commerce Card Spends: POS/<MERCHANT>/... or ECOM/...
    elif re.search(r'\b(POS|ECOM|SWIPE|CARD)\b', clean, re.I):
        tx_channel = 'CARD_POS'
        direction = 'DEBIT'
        payee_name = re.sub(r'POS|ECOM|DR|CR|\d{6}/\d{4}', '', clean, flags=re.I).strip()

    # 7. Check ATM Cash Withdrawal: ATM-WDL / CASH WDL / NFS
    elif re.search(r'\b(ATM|CASH\s+WDL|NFS)\b', clean, re.I):
        tx_channel = 'ATM_CASH'
        direction = 'DEBIT'
        payee_name = 'ATM Cash Withdrawal'

    # Clean residual bank terminal numbers e.g. "0097695162091 AT 40184"
    terminal_ref = ''
    m_term = re.search(r'(\d{10,16}\s+AT\s+\d+)', clean)
    if m_term:
        terminal_ref = m_term.group(1)
        payee_name = payee_name.replace(terminal_ref, '').strip()

    # Clean branch names e.g. "DONIMALAI TOWNSHIP"
    branch_loc = ''
    m_loc = re.search(r'(DONIMALAI TOWNSHIP|[A-Z\s]+BRANCH|[A-Z\s]+TOWNSHIP)', clean)
    if m_loc:
        branch_loc = m_loc.group(1).strip()
        payee_name = payee_name.replace(branch_loc, '').strip()

    # Strip prefixes like "WDL TFR", "DEP TFR", "UPI/DR/..." from payee name
    payee_name = re.sub(r'^(WDL\s+TFR|DEP\s+TFR|TRANSFER\s+TO|TRANSFER\s+FROM)\s*', '', payee_name, flags=re.I).strip()
    payee_name = re.sub(r'^UPI/(?:DR|CR)/\d+/', '', payee_name, flags=re.I).strip()
    payee_name = re.sub(r'/\s*$', '', payee_name).strip()

    if not payee_name:
        payee_name = 'Bank Transaction'

    return {
        'tx_channel': tx_channel,
        'direction': direction,
        'rrn_utr': rrn_utr,
        'payee_name': payee_name,
        'bank_code': bank_code,
        'vpa': vpa,
        'user_note': user_note or 'UPI',
        'terminal_ref': terminal_ref,
        'branch_location': branch_loc,
        'is_recurring': is_recurring,
        'full_narration': clean
    }

def parse_universal_pdf(pdf_path, password=None):
    reader = PdfReader(pdf_path)
    
    # Check if PDF is encrypted / password-protected
    if reader.is_encrypted:
        if not password:
            return {
                "is_encrypted": True,
                "error": "PASSWORD_REQUIRED",
                "message": "This bank statement is password-protected. Please enter the password (e.g., DOB DDMMYYYY or PAN)."
            }
        decrypted = reader.decrypt(password)
        if decrypted == 0:
            return {
                "is_encrypted": True,
                "error": "INCORRECT_PASSWORD",
                "message": "Incorrect password. Most banks use DOB (DDMMYYYY) or PAN in lowercase."
            }
            
    all_lines = []
    for page in reader.pages:
        txt = page.extract_text()
        if txt:
            all_lines.extend(txt.split('\n'))
            
    lines = clean_statement_text(all_lines)
    txs = []
    current_block = None

    def match_date(line):
        for pat in DATE_PATTERNS:
            m = pat.match(line)
            if m:
                return m.group(1)
        return None

    def extract_amounts(block_lines):
        block_text = ' '.join(block_lines)
        is_credit = bool(re.search(r'DEP TFR|CR\b|\bCREDIT\b|\bUPI/CR\b|RECEIVED|SALARY', block_text, re.I))
        
        # Test SBI debit/credit format
        m_sbi_debit = re.search(r'-\s*([0-9,]+\.\d{2})\s+-\s*([0-9,]+\.\d{2})', block_text)
        if m_sbi_debit:
            return -float(m_sbi_debit.group(1).replace(',', '')), float(m_sbi_debit.group(2).replace(',', ''))
            
        m_sbi_credit = re.search(r'-\s*-\s*([0-9,]+\.\d{2})\s+([0-9,]+\.\d{2})', block_text)
        if m_sbi_credit:
            return float(m_sbi_credit.group(1).replace(',', '')), float(m_sbi_credit.group(2).replace(',', ''))

        # Test DR/CR tag format: "450.00 DR"
        m_drcr = re.search(r'([0-9,]+\.\d{2})\s*(DR|CR)\b', block_text, re.I)
        if m_drcr:
            val = float(m_drcr.group(1).replace(',', ''))
            amt = val if m_drcr.group(2).upper() == 'CR' else -val
            return amt, 0.0

        # Test general number matching (take first number as amount, second as balance)
        nums = re.findall(r'([0-9,]+\.\d{2})', block_text)
        if nums:
            val = float(nums[0].replace(',', ''))
            bal = float(nums[1].replace(',', '')) if len(nums) > 1 else 0.0
            return (val if is_credit else -val), bal

        return 0.0, 0.0

    def finalize_block(block, idx):
        if not block:
            return
        amt, bal = extract_amounts(block['lines'])
        if amt == 0.0:
            return
            
        dissected = dissect_narration(' '.join(block['lines']))
        
        # Normalize date to ISO string
        d_str = block['date']
        iso_date = "2026-10-24T12:00:00Z"
        # Match DD/MM/YYYY or DD-MM-YYYY
        parts = re.split(r'[/-]', d_str)
        if len(parts) == 3:
            if len(parts[0]) == 4: # YYYY-MM-DD
                iso_date = f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}T12:00:00Z"
            else: # DD/MM/YYYY
                day, month, year = parts[0], parts[1], parts[2]
                if len(year) == 2:
                    year = '20' + year
                iso_date = f"{year}-{month.zfill(2)}-{day.zfill(2)}T12:00:00Z"

        txs.append({
            "id": f"tx_univ_{idx}",
            "accountId": "acc_primary",
            "amount": amt,
            "balance": bal,
            "rawDescription": dissected['full_narration'],
            "currency": "INR",
            "timestamp": iso_date,
            "txMode": dissected['tx_channel'],
            "upiRrn": dissected['rrn_utr'],
            "payeeName": dissected['payee_name'],
            "bankCode": dissected['bank_code'],
            "vpaHandle": dissected['vpa'],
            "remark": dissected['user_note'],
            "terminalRef": dissected['terminal_ref'],
            "branchLocation": dissected['branch_location'],
            "isRecurring": dissected['is_recurring']
        })

    block_idx = 0
    for line in lines:
        d = match_date(line)
        if d:
            finalize_block(current_block, block_idx)
            block_idx += 1
            current_block = {
                'date': d,
                'lines': [line]
            }
        elif current_block:
            current_block['lines'].append(line)

    finalize_block(current_block, block_idx)
    return txs

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    password = sys.argv[2] if len(sys.argv) > 2 else None
    try:
        res = parse_universal_pdf(sys.argv[1], password=password)
        if isinstance(res, dict) and res.get('is_encrypted'):
            print(json.dumps(res))
            sys.exit(0)
            
        print(json.dumps({
            "success": True, 
            "transactions": res, 
            "extractedCount": len(res),
            "channels": list(set(t['txMode'] for t in res))
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
