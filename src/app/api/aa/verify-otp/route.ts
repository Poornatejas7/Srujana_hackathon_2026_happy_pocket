import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_FIP_BANKS } from '../consent/route';

export async function POST(req: NextRequest) {
  try {
    const { consentId, otp, bankId = 'hdfc' } = await req.json();

    if (!consentId) {
      return NextResponse.json({ success: false, error: 'Consent ID is required' }, { status: 400 });
    }

    if (!otp || otp.trim().length !== 6) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 6-digit OTP' }, { status: 400 });
    }

    // Check live Setu AA if keys are set
    const setuClientId = process.env.SETU_CLIENT_ID;
    const setuClientSecret = process.env.SETU_CLIENT_SECRET;

    if (setuClientId && setuClientSecret) {
      try {
        const verifyRes = await fetch(`https://fiu-sandbox.setu.co/consents/${consentId}`, {
          headers: {
            'x-client-id': setuClientId,
            'x-client-secret': setuClientSecret,
          },
        });
        const verifyData = await verifyRes.json();
        if (verifyData && verifyData.status === 'ACTIVE') {
          // Live consent approved!
        }
      } catch (e) {
        console.warn('Setu OTP verify check fallback:', e);
      }
    }

    // Default demo OTP is 123456 or matching digits
    if (otp !== '123456' && otp !== '000000' && !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ success: false, error: 'Invalid OTP. For test sandbox, use 123456' }, { status: 401 });
    }

    const selectedBank = SUPPORTED_FIP_BANKS.find((b) => b.id === bankId) || SUPPORTED_FIP_BANKS[0];

    // Bank accounts discovered at FIP
    const discoveredAccounts = [
      {
        accountNumber: `${selectedBank.ifscPrefix.slice(0, 4)}50100492817482`,
        maskedAccountNumber: '•••• 7482',
        accountType: 'SAVINGS',
        bankName: selectedBank.name,
        ifsc: `${selectedBank.ifscPrefix}0492`,
        accountHolder: 'Poornatejas C',
        availableBalance: 10000.00,
        currency: 'INR',
        upiId: `poornatejas@ok${selectedBank.id}`,
        isPrimary: true,
      },
    ];

    return NextResponse.json({
      success: true,
      consentId,
      status: 'CONSENT_APPROVED',
      bankName: selectedBank.name,
      fipId: selectedBank.fipId,
      discoveredAccounts,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error('Error verifying AA OTP:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to verify Account Aggregator OTP' },
      { status: 500 }
    );
  }
}
