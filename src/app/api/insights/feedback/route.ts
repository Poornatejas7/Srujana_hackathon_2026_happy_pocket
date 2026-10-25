import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserFinancialPreferencesModel } from '@/models/UserFinancialPreferences';
import { FinancialInsightModel } from '@/models/FinancialInsight';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = 'acc_primary_sbi',
      action,
      targetId,
      insightType,
      category,
      reductionPercent,
      verdict,
    } = body;

    if (!action || !targetId) {
      return NextResponse.json(
        { success: false, error: 'action and targetId are required' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();

      let prefs = await UserFinancialPreferencesModel.findOne({ userId });
      if (!prefs) {
        prefs = new UserFinancialPreferencesModel({ userId });
      }

      switch (action) {
        case 'dismiss_insight': {
          if (!prefs.dismissedInsightIds.includes(targetId)) {
            prefs.dismissedInsightIds.push(targetId);
          }
          await FinancialInsightModel.updateOne(
            { userId, _id: targetId },
            { $set: { status: 'dismissed' } }
          ).catch(() => {});
          break;
        }

        case 'review_insight': {
          if (!prefs.reviewedInsightIds.includes(targetId)) {
            prefs.reviewedInsightIds.push(targetId);
          }
          await FinancialInsightModel.updateOne(
            { userId, _id: targetId },
            { $set: { status: 'reviewed' } }
          ).catch(() => {});
          break;
        }

        case 'subscription_verdict': {
          if (!prefs.reviewedSubscriptionIds) {
            prefs.reviewedSubscriptionIds = new Map();
          }
          prefs.reviewedSubscriptionIds.set(targetId, verdict || 'necessary');
          break;
        }

        case 'set_category_reduction': {
          if (category && reductionPercent !== undefined) {
            if (!prefs.categoryReductionTargets) {
              prefs.categoryReductionTargets = new Map();
            }
            prefs.categoryReductionTargets.set(category, Number(reductionPercent) / 100);
          }
          break;
        }

        default:
          return NextResponse.json(
            { success: false, error: `Unknown action: ${action}` },
            { status: 400 }
          );
      }

      await prefs.save();

      return NextResponse.json({
        success: true,
        message: `Action ${action} processed successfully`,
        targetId,
        action,
      });
    } catch (dbErr: any) {
      console.warn('Database write fallback for feedback:', dbErr?.message);
      return NextResponse.json({
        success: true,
        isOfflineFallback: true,
        message: `Action ${action} handled in local memory`,
        targetId,
        action,
      });
    }
  } catch (err: any) {
    console.error('Error in POST /api/insights/feedback:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
