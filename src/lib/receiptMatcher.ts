export interface ReceiptMatchCandidate {
  receiptId: string;
  orderId: string;
  merchant: string;
  orderDate: Date;
  totalAmount: number;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number; category?: string }>;
}

export interface TransactionMatchCandidate {
  id: string;
  timestamp: Date;
  amount: number; // negative for debit
  cleanMerchant?: string;
  rawDescription: string;
  upiRrn?: string;
  remark?: string;
}

export interface MatchResult {
  receiptId: string;
  orderId: string;
  transactionId: string;
  confidence: number; // 0 to 100
  signals: string[];
  isMatched: boolean;
  status: 'MATCHED' | 'PARTIAL' | 'UNMATCHED';
}

/**
 * Multi-Signal Receipt Matching Engine (Section 10 of FinLens Spec):
 * Matches authorized order receipts/invoices against bank transactions using:
 * 1. Exact or near-exact amount (factoring taxes, delivery fees)
 * 2. Clearing settlement date window (within +/- 4 days)
 * 3. Merchant identifier token overlap
 * 4. Explicit Order ID / Invoice Ref embedded in UPI remarks
 */
export function matchReceiptsToTransactions(
  receipts: ReceiptMatchCandidate[],
  transactions: TransactionMatchCandidate[]
): MatchResult[] {
  const results: MatchResult[] = [];
  const assignedTxIds = new Set<string>();

  for (const receipt of receipts) {
    let bestMatch: {
      tx: TransactionMatchCandidate;
      score: number;
      signals: string[];
    } | null = null;

    const receiptDate = new Date(receipt.orderDate).getTime();
    const receiptMerchantTokens = receipt.merchant.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    for (const tx of transactions) {
      // Outflows only for purchase receipts (or positive if return refund receipt)
      if (receipt.totalAmount > 0 && tx.amount >= 0) continue;
      if (assignedTxIds.has(tx.id)) continue;

      let score = 0;
      const signals: string[] = [];

      const txAmount = Math.abs(tx.amount);
      const txText = `${tx.cleanMerchant || ''} ${tx.rawDescription || ''} ${tx.remark || ''}`.toLowerCase();
      const txDate = new Date(tx.timestamp).getTime();
      const dayDiff = Math.abs(txDate - receiptDate) / (1000 * 60 * 60 * 24);

      // Signal 1: Order ID match in description or remark (+50 points)
      if (receipt.orderId && txText.includes(receipt.orderId.toLowerCase())) {
        score += 50;
        signals.push(`Exact Order ID match (${receipt.orderId}) in payment narration`);
      }

      // Signal 2: Merchant Token Match (+30 points)
      const matchesMerchant = receiptMerchantTokens.some(token => txText.includes(token));
      if (matchesMerchant) {
        score += 30;
        signals.push(`Merchant name verified (${receipt.merchant})`);
      }

      // Signal 3: Amount Match
      const amountDiff = Math.abs(txAmount - receipt.totalAmount);
      if (amountDiff < 0.01) {
        // Exact amount match
        score += 45;
        signals.push(`Exact amount matched (₹${txAmount.toFixed(2)})`);
      } else if (amountDiff / receipt.totalAmount <= 0.05) {
        // Within 5% (taxes, rounding, tip or platform fee)
        score += 25;
        signals.push(`Amount matched within 5% tolerance (₹${txAmount.toFixed(2)} vs ₹${receipt.totalAmount.toFixed(2)})`);
      }

      // Signal 4: Settlement Date Window
      if (dayDiff <= 1) {
        score += 25;
        signals.push(`Same-day or next-day clearing (within ${dayDiff.toFixed(1)} days)`);
      } else if (dayDiff <= 4) {
        score += 15;
        signals.push(`Clearing within standard banking settlement window (${Math.round(dayDiff)} days)`);
      }

      if (score >= 65 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { tx, score: Math.min(score, 100), signals };
      }
    }

    if (bestMatch && bestMatch.score >= 70) {
      assignedTxIds.add(bestMatch.tx.id);
      results.push({
        receiptId: receipt.receiptId,
        orderId: receipt.orderId,
        transactionId: bestMatch.tx.id,
        confidence: bestMatch.score,
        signals: bestMatch.signals,
        isMatched: true,
        status: bestMatch.score >= 85 ? 'MATCHED' : 'PARTIAL',
      });
    } else {
      results.push({
        receiptId: receipt.receiptId,
        orderId: receipt.orderId,
        transactionId: '',
        confidence: bestMatch ? bestMatch.score : 0,
        signals: bestMatch ? bestMatch.signals : ['No matching transaction within +/- 4 days window'],
        isMatched: false,
        status: 'UNMATCHED',
      });
    }
  }

  return results;
}
