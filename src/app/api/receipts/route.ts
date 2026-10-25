import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ReceiptModel } from '@/models/Receipt';
import { TransactionModel } from '@/models/Transaction';
import { matchReceiptsToTransactions } from '@/lib/receiptMatcher';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const receipts = await ReceiptModel.find({}).sort({ orderDate: -1 }).lean();
    const transactions = await TransactionModel.find({}).lean();

    // Run real-time matching
    const matchCandidates = receipts.map((r: any) => ({
      receiptId: r._id.toString(),
      orderId: r.orderId,
      merchant: r.merchant,
      orderDate: r.orderDate,
      totalAmount: r.totalAmount,
      items: r.items || [],
    }));

    const txCandidates = transactions.map((t: any) => ({
      id: t._id.toString(),
      timestamp: t.timestamp,
      amount: t.amount,
      cleanMerchant: t.cleanMerchant,
      rawDescription: t.rawDescription,
      upiRrn: t.upiRrn,
      remark: t.remark,
    }));

    const matchResults = matchReceiptsToTransactions(matchCandidates, txCandidates);

    // Merge match results into receipts
    const enrichedReceipts = receipts.map((r: any) => {
      const match = matchResults.find(m => m.receiptId === r._id.toString());
      return {
        ...r,
        matchedTransactionId: match?.transactionId || r.matchedTransactionId || null,
        matchedConfidence: match?.confidence ?? r.matchedConfidence ?? 0,
        matchSignals: match?.signals ?? r.matchSignals ?? [],
        status: match?.status ?? r.status ?? 'UNMATCHED',
      };
    });

    return NextResponse.json({
      success: true,
      count: enrichedReceipts.length,
      receipts: enrichedReceipts,
    });
  } catch (err: any) {
    console.error('Receipts GET error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch receipts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.orderId || !body.merchant || body.totalAmount === undefined) {
      return NextResponse.json({ 
        error: 'Missing required receipt fields (orderId, merchant, totalAmount)' 
      }, { status: 400 });
    }

    const orderDate = body.orderDate ? new Date(body.orderDate) : new Date();

    const transactions = await TransactionModel.find({}).lean();
    const txCandidates = transactions.map((t: any) => ({
      id: t._id.toString(),
      timestamp: t.timestamp,
      amount: t.amount,
      cleanMerchant: t.cleanMerchant,
      rawDescription: t.rawDescription,
      upiRrn: t.upiRrn,
      remark: t.remark,
    }));

    const matchCandidate = [{
      receiptId: 'temp_id',
      orderId: body.orderId,
      merchant: body.merchant,
      orderDate,
      totalAmount: Number(body.totalAmount),
      items: body.items || [],
    }];

    const matches = matchReceiptsToTransactions(matchCandidate, txCandidates);
    const topMatch = matches[0];

    const receiptDoc = await ReceiptModel.findOneAndUpdate(
      { orderId: body.orderId },
      {
        orderId: body.orderId,
        merchant: body.merchant,
        orderDate,
        totalAmount: Number(body.totalAmount),
        taxAmount: body.taxAmount ? Number(body.taxAmount) : 0,
        shippingFee: body.shippingFee ? Number(body.shippingFee) : 0,
        currency: body.currency || 'INR',
        items: body.items || [],
        status: topMatch?.status || 'UNMATCHED',
        matchedTransactionId: topMatch?.transactionId || undefined,
        matchedConfidence: topMatch?.confidence || 0,
        matchSignals: topMatch?.signals || [],
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      receipt: receiptDoc,
      matchResult: topMatch,
    });
  } catch (err: any) {
    console.error('Receipts POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save receipt' }, { status: 500 });
  }
}
