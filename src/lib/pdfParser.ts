import { RawTransaction } from '@/types/finance';

/**
 * Extracts raw text lines from a Bank Statement PDF ArrayBuffer using pdfjs-dist.
 */
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string[]> {
  // Dynamically import pdfjs-dist to ensure client-side compatibility
  const pdfjs = await import('pdfjs-dist');
  
  // Set worker source to CDN or local fallback
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
 * Parses raw text lines from standard Indian (HDFC, SBI, ICICI, Axis) and US (Chase, BoA) bank statement formats.
 */
export function parseBankStatementLines(lines: string[], accountId = 'acc_parsed_stmt'): RawTransaction[] {
  const transactions: RawTransaction[] = [];
  
  // Common date regexes: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD MMM YYYY, MM/DD/YYYY
  const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i;
  // Amount regex: currency formats like 1,234.50 or 450.00 or 1234
  const amountRegex = /(?:INR|Rs\.?|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2}))/gi;

  lines.forEach((line, index) => {
    // Ignore statement headers and summary boilerplate
    if (/statement period|opening balance|closing balance|page \d+|account number|ifsc code|branch code/i.test(line)) {
      return;
    }

    const dateMatch = line.match(dateRegex);
    if (!dateMatch) return;

    // Extract all numbers that look like monetary amounts
    const matches = [...line.matchAll(amountRegex)];
    if (matches.length === 0) return;

    // Pick the most plausible transaction amount (usually the largest or last column)
    const rawAmtCandidate = matches[matches.length - 1][1].replace(/,/g, '');
    const amountVal = parseFloat(rawAmtCandidate);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // Determine Debit vs Credit
    const isCredit = /\b(cr|credit|deposit|inflow|refund)\b/i.test(line) && !/\b(dr|debit)\b/i.test(line);
    const finalAmount = isCredit ? amountVal : -amountVal;

    // Clean narration description
    let narration = line
      .replace(dateRegex, '')
      .replace(matches[matches.length - 1][0], '')
      .replace(/\b(dr|cr|cheque|chq|txn|ref)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!narration || narration.length < 3) {
      narration = 'Bank Transaction Entry';
    }

    // Attempt date parsing
    let txDate = new Date().toISOString();
    try {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate.getTime())) {
        txDate = parsedDate.toISOString();
      }
    } catch {
      // fallback to current date
    }

    transactions.push({
      id: `tx_pdf_${Date.now()}_${index}`,
      accountId,
      amount: finalAmount,
      rawDescription: narration,
      currency: line.includes('Rs') || line.includes('INR') || /upi|neft|imps/i.test(line) ? 'INR' : 'USD',
      timestamp: txDate
    });
  });

  return transactions;
}
