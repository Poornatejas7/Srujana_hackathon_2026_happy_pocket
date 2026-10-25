import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TransactionModel } from '@/models/Transaction';
import { extractUPIEntity } from '@/lib/engine';
import mongoose from 'mongoose';

// Helper to sanitize, clean and categorize a transaction
function cleanAndCategorizeTx(t: any) {
  const doc: any = { ...t };
  if (doc.id && !doc._id && mongoose.isValidObjectId(doc.id)) {
    doc._id = doc.id;
  } else {
    delete doc.id;
  }

  // Run through classification engine
  const classification = extractUPIEntity(
    doc.rawDescription || '',
    doc.payeeName || '',
    doc.vpaHandle || ''
  );

  if (!doc.cleanMerchant) {
    doc.cleanMerchant = classification.cleanName;
  }
  if (!doc.accountType) {
    doc.accountType = classification.accountType;
  }
  if (!doc.category) {
    doc.category = classification.category;
  }
  if (!doc.tier) {
    doc.tier = classification.tier;
  }
  if (doc.isRecurring === undefined) {
    doc.isRecurring = classification.isRecurring;
  }
  if (doc.isInternalTransfer === undefined) {
    doc.isInternalTransfer = classification.isSelfTransfer;
  }
  if (doc.isRefundOrReversal === undefined) {
    doc.isRefundOrReversal = classification.isRefund;
  }
  if (!doc.direction) {
    doc.direction = (doc.amount && doc.amount > 0) ? 'CREDIT' : 'DEBIT';
  }

  return doc;
}

// 1. GET: Fetch transactions from MongoDB Atlas
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const accountType = searchParams.get('accountType');
    const category = searchParams.get('category');

    const filter: any = {};
    if (accountType) {
      filter.accountType = accountType;
    }
    if (category) {
      filter.category = category;
    }

    const transactions = await TransactionModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(300)
      .lean();

    const merchantCount = transactions.filter((t: any) => t.accountType === 'Merchant / Business').length;
    const personalCount = transactions.filter((t: any) => t.accountType === 'Personal').length;

    return NextResponse.json({ 
      success: true, 
      count: transactions.length, 
      merchantCount,
      personalCount,
      database: 'happypocket',
      collection: 'transactions',
      transactions 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 2. POST: Create one or multiple transactions (with automatic cleaning & Merchant vs Personal categorization)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (Array.isArray(body)) {
      const sanitized = body.map(cleanAndCategorizeTx);
      const docs = await TransactionModel.insertMany(sanitized, { ordered: false });
      return NextResponse.json({ 
        success: true, 
        count: docs.length, 
        message: 'Transactions categorized and saved to MongoDB Atlas',
        database: 'happypocket',
        collection: 'transactions',
        data: docs 
      });
    } else {
      const docData = cleanAndCategorizeTx(body);
      const doc = await TransactionModel.create(docData);
      return NextResponse.json({ 
        success: true, 
        message: 'Transaction categorized and saved to MongoDB Atlas',
        database: 'happypocket',
        collection: 'transactions',
        data: doc 
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 3. PUT: Update/Edit existing transaction (e.g., category override, merchant edit)
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, _id, ...updateFields } = body;
    const targetId = _id || id;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Transaction id required' }, { status: 400 });
    }

    let updatedDoc;
    if (mongoose.isValidObjectId(targetId)) {
      updatedDoc = await TransactionModel.findByIdAndUpdate(targetId, updateFields, { new: true });
    } else {
      updatedDoc = await TransactionModel.findOneAndUpdate(
        { $or: [{ rawDescription: targetId }, { upiRrn: targetId }] },
        updateFields,
        { new: true }
      );
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 4. DELETE: Delete transaction from database (e.g. canceling mandate or removing entry)
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const merchant = searchParams.get('merchant');

    if (id) {
      if (mongoose.isValidObjectId(id)) {
        await TransactionModel.findByIdAndDelete(id);
      } else {
        await TransactionModel.deleteMany({ $or: [{ rawDescription: id }, { upiRrn: id }] });
      }
      return NextResponse.json({ success: true, deletedId: id });
    } else if (merchant) {
      const res = await TransactionModel.deleteMany({
        $or: [
          { payeeName: new RegExp(merchant, 'i') },
          { cleanMerchant: new RegExp(merchant, 'i') },
          { rawDescription: new RegExp(merchant, 'i') },
        ],
      });
      return NextResponse.json({ success: true, deletedMerchant: merchant, deletedCount: res.deletedCount });
    }

    return NextResponse.json({ success: false, error: 'id or merchant parameter required' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
