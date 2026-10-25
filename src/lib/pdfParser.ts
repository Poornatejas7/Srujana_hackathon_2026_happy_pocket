import { RawTransaction } from '@/types/finance';

/**
 * Dissects raw Indian banking narration (UPI, IMPS, NEFT, RTGS, NACH, CARD, ATM)
 * into canonical transaction fields.
 */
export function dissectNarration(rawText: string) {
  const clean = rawText.replace(/\s+/g, ' ').trim();
  const upper = clean.toUpperCase();

  let txChannel: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'NACH_MANDATE' | 'CARD_POS' | 'ATM_CASH' | 'TRANSFER' = 'TRANSFER';
  let direction: 'DEBIT' | 'CREDIT' = upper.includes('DEP') || upper.includes('CR') ? 'CREDIT' : 'DEBIT';
  let rrnUtr = '';
  let payeeName = '';
  let bankCode = '';
  let vpa = '';
  let userNote = '';
  let isRecurring = false;

  // 1. UPI Extraction: e.g. UPI/DR/103643355290/NETFLIX/HDFC/netflix.bd/Execu or UPI/CR/...
  if (upper.includes('UPI/') || upper.includes('UPI-') || upper.includes('/UPI')) {
    txChannel = 'UPI';
    const upiMatch = clean.match(/UPI\/(DR|CR)\/(\d{10,12})\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/i);
    if (upiMatch) {
      direction = upiMatch[1].toUpperCase() === 'CR' ? 'CREDIT' : 'DEBIT';
      rrnUtr = upiMatch[2];
      payeeName = upiMatch[3].trim();
      bankCode = upiMatch[4].trim();
      vpa = upiMatch[5].trim();
      userNote = upiMatch[6].trim();
      isRecurring = /mand|execu|autopay|sub/i.test(userNote);
    } else {
      // Partial UPI matches e.g. UPI/429182/SWIGGY/swiggy@icici
      const rrnMatch = clean.match(/\b(\d{10,12})\b/);
      if (rrnMatch) rrnUtr = rrnMatch[1];
      const vpaMatch = clean.match(/([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/);
      if (vpaMatch) vpa = vpaMatch[1];
      payeeName = clean;
    }
  } 
  // 2. IMPS Extraction
  else if (/\bIMPS\b/i.test(clean)) {
    txChannel = 'IMPS';
    const impsMatch = clean.match(/IMPS(?:-P2A|-P2P)?[/-]([A-Z0-9]{10,14})[/-]([^/]+)(?:[/-]([A-Z0-9]+))?/i);
    if (impsMatch) {
      rrnUtr = impsMatch[1];
      payeeName = impsMatch[2].trim();
      bankCode = impsMatch[3] ? impsMatch[3].slice(0, 4) : '';
    } else {
      payeeName = clean;
    }
  }
  // 3. NEFT / RTGS Extraction
  else if (/\b(NEFT|RTGS)\b/i.test(clean)) {
    txChannel = upper.includes('NEFT') ? 'NEFT' : 'RTGS';
    const neftMatch = clean.match(/(?:NEFT|RTGS)[/-]([A-Z0-9]{16})[/-]([^/]+)/i);
    if (neftMatch) {
      rrnUtr = neftMatch[1];
      payeeName = neftMatch[2].trim();
    } else {
      payeeName = clean;
    }
  }
  // 4. NACH / ECS Mandates
  else if (/\b(ACH|NACH|ECS|SIP|EMI|LOAN)\b/i.test(clean)) {
    txChannel = 'NACH_MANDATE';
    isRecurring = true;
    direction = 'DEBIT';
    const umrnMatch = clean.match(/(?:UMRN|MANDATE)?[/-]?([A-Z0-9]{20})/i);
    if (umrnMatch) rrnUtr = umrnMatch[1];
    payeeName = clean.replace(/ACH|NACH|ECS|DR|CR/gi, '').trim();
  }
  // 5. Card / POS Swipes
  else if (/\b(POS|ECOM|SWIPE|CARD)\b/i.test(clean)) {
    txChannel = 'CARD_POS';
    direction = 'DEBIT';
    payeeName = clean.replace(/POS|ECOM|DR|CR|\d{6}\/\d{4}/gi, '').trim();
  }
  // 6. ATM Cash Withdrawal
  else if (/\b(ATM|CASH\s+WDL|NFS)\b/i.test(clean)) {
    txChannel = 'ATM_CASH';
    direction = 'DEBIT';
    payeeName = 'ATM Cash Withdrawal';
  } else {
    payeeName = clean;
  }

  // Cleanup prefixes
  payeeName = payeeName.replace(/^(WDL\s+TFR|DEP\s+TFR|TRANSFER\s+TO|TRANSFER\s+FROM)\s*/i, '').trim();
  payeeName = payeeName.replace(/^UPI\/(?:DR|CR)\/\d+\//i, '').trim();
  if (!payeeName) payeeName = 'Bank Transaction';

  return {
    txChannel,
    direction,
    rrnUtr,
    payeeName,
    bankCode,
    vpa,
    userNote,
    isRecurring,
  };
}

/**
 * Extracts raw text lines from a Bank Statement PDF ArrayBuffer using pdfjs-dist.
 */
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const lines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageLines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of textContent.items as any[]) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        if (currentLine.trim()) pageLines.push(currentLine.trim());
        currentLine = item.str;
      } else {
        currentLine += (currentLine ? ' ' : '') + item.str;
      }
      lastY = item.transform[5];
    }
    if (currentLine.trim()) pageLines.push(currentLine.trim());
    lines.push(...pageLines);
  }

  return lines;
}

/**
 * Universal statement line parser for standard Indian bank statements (SBI, HDFC, ICICI, Axis, Canara).
 * Converts raw narrations into canonical schema with dissected NPCI RRN, VPA, and channel.
 */
export function parseBankStatementLines(lines: string[], accountId = 'acc_parsed_stmt'): RawTransaction[] {
  const transactions: RawTransaction[] = [];
  
  const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i;
  const amountRegex = /(?:INR|Rs\.?|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2}))/gi;

  lines.forEach((line, index) => {
    if (/statement period|opening balance|closing balance|page \d+|account number|ifsc code|branch code/i.test(line)) {
      return;
    }

    const dateMatch = line.match(dateRegex);
    if (!dateMatch) return;

    const matches = [...line.matchAll(amountRegex)];
    if (matches.length === 0) return;

    const rawAmtCandidate = matches[matches.length - 1][1].replace(/,/g, '');
    const amountVal = parseFloat(rawAmtCandidate);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // Dissect narration details
    const dissected = dissectNarration(line);

    // Determine Debit vs Credit (respect dissected direction if explicit, or regex indicator)
    const isCredit = dissected.direction === 'CREDIT' || (/\b(cr|credit|deposit|inflow|refund)\b/i.test(line) && !/\b(dr|debit)\b/i.test(line));
    const finalAmount = isCredit ? amountVal : -amountVal;

    let txDate = new Date().toISOString();
    try {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate.getTime())) {
        txDate = parsedDate.toISOString();
      }
    } catch {
      // fallback
    }

    transactions.push({
      id: `tx_pdf_${Date.now()}_${index}`,
      accountId,
      amount: finalAmount,
      rawDescription: line,
      currency: 'INR',
      timestamp: txDate,
      txMode: dissected.txChannel,
      upiRrn: dissected.rrnUtr,
      payeeName: dissected.payeeName,
      bankCode: dissected.bankCode,
      vpaHandle: dissected.vpa,
      remark: dissected.userNote || dissected.txChannel,
    });
  });

  return transactions;
}

/**
 * Universal CSV Statement Parser for Indian Bank Statements (SBI, HDFC, ICICI, Axis, Canara, etc.)
 */
export function parseCSVStatement(csvText: string, accountId = 'acc_parsed_stmt'): RawTransaction[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Parse CSV line respecting quoted values with commas
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Detect header row
  let headerIndex = -1;
  let headers: string[] = [];
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const row = parseLine(lines[i]).map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (row.some(c => c.includes('date')) && (
      row.some(c => c.includes('narration') || c.includes('particular') || c.includes('desc') || c.includes('remark')) ||
      row.some(c => c.includes('amount') || c.includes('debit') || c.includes('credit') || c.includes('withdrawal'))
    )) {
      headerIndex = i;
      headers = row;
      break;
    }
  }

  let dateCol = headers.findIndex(h => h.includes('date'));
  let descCol = headers.findIndex(h => h.includes('narration') || h.includes('particular') || h.includes('desc') || h.includes('detail') || h.includes('remark'));
  let refCol = headers.findIndex(h => h.includes('ref') || h.includes('chq') || h.includes('cheque') || h.includes('rrn') || h.includes('utr'));
  let debitCol = headers.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('dr'));
  let creditCol = headers.findIndex(h => h.includes('credit') || h.includes('deposit') || h.includes('cr'));
  let amountCol = headers.findIndex(h => h.includes('amount') || h.includes('amt'));
  let typeCol = headers.findIndex(h => h.includes('type') || h.includes('drcr'));

  if (dateCol === -1) dateCol = 0;
  if (descCol === -1) descCol = 1;

  const transactions: RawTransaction[] = [];
  const startRow = headerIndex >= 0 ? headerIndex + 1 : 0;

  for (let i = startRow; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = cols[dateCol] || '';
    const rawDesc = cols[descCol] || '';
    if (!rawDesc && !rawDate) continue;

    const dissected = dissectNarration(rawDesc);
    const rrn = refCol >= 0 && cols[refCol] ? cols[refCol].replace(/[^a-zA-Z0-9]/g, '') : dissected.rrnUtr;

    let finalAmount = 0;
    if (debitCol >= 0 && creditCol >= 0) {
      const debitRaw = (cols[debitCol] || '').replace(/[^\d.-]/g, '');
      const creditRaw = (cols[creditCol] || '').replace(/[^\d.-]/g, '');
      const debitVal = parseFloat(debitRaw);
      const creditVal = parseFloat(creditRaw);

      if (!isNaN(creditVal) && creditVal > 0) {
        finalAmount = creditVal;
      } else if (!isNaN(debitVal) && debitVal > 0) {
        finalAmount = -debitVal;
      }
    } else if (amountCol >= 0) {
      const amtRaw = (cols[amountCol] || '').replace(/[^\d.-]/g, '');
      const amtVal = parseFloat(amtRaw);
      if (!isNaN(amtVal)) {
        if (typeCol >= 0) {
          const typeStr = (cols[typeCol] || '').toUpperCase();
          finalAmount = typeStr.includes('CR') || typeStr.includes('CREDIT') ? Math.abs(amtVal) : -Math.abs(amtVal);
        } else {
          finalAmount = amtVal;
        }
      }
    } else {
      const nums = cols.map(c => parseFloat(c.replace(/[^\d.-]/g, ''))).filter(n => !isNaN(n) && n > 0);
      if (nums.length > 0) {
        const isCredit = dissected.direction === 'CREDIT' || /credit|deposit|cr\b|refund/i.test(rawDesc);
        finalAmount = isCredit ? nums[0] : -nums[0];
      }
    }

    if (finalAmount === 0) continue;

    let txDate = new Date().toISOString();
    try {
      const parts = rawDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
      if (parts) {
        const d = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10) - 1;
        const y = parseInt(parts[3].length === 2 ? `20${parts[3]}` : parts[3], 10);
        const dt = new Date(Date.UTC(y, m, d));
        if (!isNaN(dt.getTime())) txDate = dt.toISOString();
      } else {
        const dt = new Date(rawDate);
        if (!isNaN(dt.getTime())) txDate = dt.toISOString();
      }
    } catch {}

    transactions.push({
      id: `tx_csv_${Date.now()}_${i}`,
      accountId,
      amount: finalAmount,
      rawDescription: rawDesc || 'Bank Transaction',
      currency: 'INR',
      timestamp: txDate,
      txMode: dissected.txChannel,
      upiRrn: rrn || `CSV${Date.now()}${i}`,
      payeeName: dissected.payeeName,
      bankCode: dissected.bankCode,
      vpaHandle: dissected.vpa,
      remark: dissected.userNote || dissected.txChannel,
    });
  }

  return transactions;
}

