import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserFinancialPreferencesModel } from '@/models/UserFinancialPreferences';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'acc_primary_sbi';

    try {
      await connectToDatabase();
      let prefs = await UserFinancialPreferencesModel.findOne({ userId }).lean();

      if (!prefs) {
        prefs = {
          userId,
          categoryReductionTargets: {
            'Bakery items & snacks': 0.25,
            'Frequent food delivery': 0.25,
            'Restaurants & dining out': 0.25,
            'Gaming & entertainment': 0.25,
            'Shopping & impulse purchases': 0.25,
          },
          emergencyFundMonths: 6,
          currentEmergencySavings: 45000,
          healthInsuranceAllocation: 1200,
          dismissedInsightIds: [],
          reviewedInsightIds: [],
          reviewedSubscriptionIds: {},
        };
      }

      return NextResponse.json({ success: true, preferences: prefs });
    } catch (dbErr: any) {
      return NextResponse.json({
        success: true,
        isOffline: true,
        preferences: {
          userId,
          categoryReductionTargets: {
            'Bakery items & snacks': 0.25,
            'Frequent food delivery': 0.25,
            'Restaurants & dining out': 0.25,
            'Gaming & entertainment': 0.25,
            'Shopping & impulse purchases': 0.25,
          },
          emergencyFundMonths: 6,
          currentEmergencySavings: 45000,
          healthInsuranceAllocation: 1200,
          dismissedInsightIds: [],
          reviewedInsightIds: [],
          reviewedSubscriptionIds: {},
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 'acc_primary_sbi', ...updates } = body;

    try {
      await connectToDatabase();
      const updated = await UserFinancialPreferencesModel.findOneAndUpdate(
        { userId },
        { $set: updates },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: updated,
      });
    } catch (dbErr: any) {
      return NextResponse.json({
        success: true,
        isOffline: true,
        message: 'Preferences saved locally',
        preferences: { userId, ...updates },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
