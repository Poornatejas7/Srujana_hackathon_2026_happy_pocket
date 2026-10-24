import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TransactionModel } from '@/models/Transaction';
import mongoose from 'mongoose';

// 1. GET: Fetch transactions from MongoDB
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const transactions = await TransactionModel.find({})
      .sort({ timestamp: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ success: true, count: transactions.length, transactions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 2. POST: Create one or multiple transactions
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (Array.isArray(body)) {
      const sanitized = body.map(t => {
        const doc: any = { ...t };
        if (doc.id && !doc._id && mongoose.isValidObjectId(doc.id)) {
          doc._id = doc.id;
        } else {
          delete doc.id;
        }
        return doc;
      });
      const docs = await TransactionModel.insertMany(sanitized, { ordered: false });
      return NextResponse.json({ success: true, count: docs.length, data: docs });
    } else {
      const docData: any = { ...body };
      if (docData.id && !docData._id && mongoose.isValidObjectId(docData.id)) {
        docData._id = docData.id;
      } else {
        delete docData.id;
      }
      const doc = await TransactionModel.create(docData);
      return NextResponse.json({ success: true, data: doc });
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
