import { NextRequest, NextResponse } from 'next/server';
import { calculateInvestmentProjection } from '@/lib/insightsEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = Number(searchParams.get('amount')) || 2500;
    const years = Number(searchParams.get('years')) || 5;
    const rateParam = searchParams.get('rate');
    const returnRate = rateParam !== null && !isNaN(Number(rateParam)) ? Number(rateParam) : 12;

    const result = calculateInvestmentProjection(amount, years, returnRate);

    return NextResponse.json({
      success: true,
      inputs: {
        monthlyContribution: amount,
        years,
        annualReturnRatePercent: returnRate,
      },
      projection: result,
      formulaExplanation:
        'Future Value = P * [((1 + r)^n - 1) / r] where P is monthly contribution, r is monthly rate (annual rate / 12), and n is total months (years * 12). When r = 0, Future Value = P * n.',
      disclaimer:
        'Illustrative projection only. Market returns are not guaranteed. Actual outcomes may differ and investments can lose value. Figures exclude applicable fees and taxes unless explicitly modelled.',
    });
  } catch (err: any) {
    console.error('Error in GET /api/insights/investment-projection:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to calculate projection' },
      { status: 500 }
    );
  }
}
