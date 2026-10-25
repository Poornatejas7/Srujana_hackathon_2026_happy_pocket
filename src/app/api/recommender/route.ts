import { NextResponse } from 'next/server';
import { 
  generateRecommenderPlan, 
  fetchLiveAmfiNav, 
  TOP_SIP_BASKET 
} from '@/lib/recommenderEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const monthlyLeakage = Number(body.monthlyLeakage) || 3000;

    // Fetch live NAVs from official AMFI Open API for our top schemes
    const liveNavMap: Record<string, number> = {};
    const liveNavDetails: Array<{ symbol: string; name: string; nav: number; date: string }> = [];

    await Promise.all(
      TOP_SIP_BASKET.map(async (fund) => {
        const live = await fetchLiveAmfiNav(fund.amfiCode);
        liveNavMap[fund.symbol] = live.nav;
        liveNavDetails.push({
          symbol: fund.symbol,
          name: fund.name,
          nav: live.nav,
          date: live.date,
        });
      })
    );

    const plan = generateRecommenderPlan(monthlyLeakage, liveNavMap);

    return NextResponse.json({
      success: true,
      plan,
      liveNavs: liveNavDetails,
      source: 'AMFI India Real-Time Daily NAVs & IRDAI Actuarial Benchmarks',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = Number(searchParams.get('amount')) || 3000;

    const liveNavMap: Record<string, number> = {};
    await Promise.all(
      TOP_SIP_BASKET.map(async (fund) => {
        const live = await fetchLiveAmfiNav(fund.amfiCode);
        liveNavMap[fund.symbol] = live.nav;
      })
    );

    const plan = generateRecommenderPlan(amount, liveNavMap);

    return NextResponse.json({
      success: true,
      plan,
      source: 'AMFI India Real-Time Daily NAVs & IRDAI Actuarial Benchmarks',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
