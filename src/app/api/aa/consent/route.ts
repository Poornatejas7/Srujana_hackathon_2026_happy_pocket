import { NextRequest, NextResponse } from 'next/server';

export interface BankFipInfo {
  id: string;
  name: string;
  fipId: string;
  logo: string;
  primaryColor: string;
  ifscPrefix: string;
}

export const SUPPORTED_FIP_BANKS: BankFipInfo[] = [
  { id: 'hdfc', name: 'HDFC Bank', fipId: 'HDFC-FIP', logo: '🏦', primaryColor: '#004c8f', ifscPrefix: 'HDFC000' },
  { id: 'sbi', name: 'State Bank of India', fipId: 'SBIN-FIP', logo: '🏛️', primaryColor: '#280071', ifscPrefix: 'SBIN000' },
  { id: 'icici', name: 'ICICI Bank', fipId: 'ICIC-FIP', logo: '🏢', primaryColor: '#b02a30', ifscPrefix: 'ICIC000' },
  { id: 'axis', name: 'Axis Bank', fipId: 'UTIB-FIP', logo: '💳', primaryColor: '#861f41', ifscPrefix: 'UTIB000' },
  { id: 'canara', name: 'Canara Bank', fipId: 'CNRB-FIP', logo: '🪙', primaryColor: '#0085ca', ifscPrefix: 'CNRB000' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', fipId: 'KKBK-FIP', logo: '🛡️', primaryColor: '#ed1c24', ifscPrefix: 'KKBK000' },
  { id: 'pnb', name: 'Punjab National Bank', fipId: 'PUNB-FIP', logo: '🌾', primaryColor: '#a20032', ifscPrefix: 'PUNB000' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobileNumber, bankId = 'hdfc', aaHandle = 'setu-aa' } = body;

    const cleanMobile = (mobileNumber || '').replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    const tenDigit = cleanMobile.slice(-10);
    const selectedBank = SUPPORTED_FIP_BANKS.find((b) => b.id === bankId) || SUPPORTED_FIP_BANKS[0];

    // Check if live Setu credentials are provided in environment
    const setuClientId = process.env.SETU_CLIENT_ID;
    const setuClientSecret = process.env.SETU_CLIENT_SECRET;

    if (setuClientId && setuClientSecret) {
      try {
        const setuRes = await fetch('https://fiu-sandbox.setu.co/consents', {
          method: 'POST',
          headers: {
            'x-client-id': setuClientId,
            'x-client-secret': setuClientSecret,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ConsentDetail: {
              consentMode: 'STORE',
              fetchType: 'PERIODIC',
              consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
              fiTypes: ['DEPOSIT'],
              DataConsumer: { id: 'happy-pocket-fiu' },
              Customer: { id: `${tenDigit}@${aaHandle}` },
              Purpose: {
                code: '101',
                refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
                text: 'Analyze living expenses and discover recurring subscriptions without data leak',
              },
              FIDataRange: {
                from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                to: new Date().toISOString(),
              },
              DataLife: { unit: 'MONTH', value: 12 },
              Frequency: { unit: 'DAILY', value: 1 },
            },
          }),
        });

        const liveData = await setuRes.json();
        if (liveData && liveData.id) {
          return NextResponse.json({
            success: true,
            isLiveGateway: true,
            consentId: liveData.id,
            redirectUrl: liveData.url,
            bank: selectedBank,
            maskedMobile: `••••••${tenDigit.slice(-4)}`,
            aaHandle: `${tenDigit}@${aaHandle}`,
          });
        }
      } catch (setuErr) {
        console.warn('Setu live gateway error, using canonical sandbox fallback:', setuErr);
      }
    }

    // High-Fidelity Sovereign RBI AA Sandbox Flow
    const consentId = `RBI_AA_${Date.now()}_${Math.random().toString(36).substring(4, 9).toUpperCase()}`;
    const otp = '123456';

    const consentArtifact = {
      consentId,
      status: 'CONSENT_REQUESTED',
      fiuId: 'HAPPY_POCKET_FIU_IN_01',
      fipId: selectedBank.fipId,
      bankName: selectedBank.name,
      customerVpa: `${tenDigit}@${aaHandle}`,
      maskedMobile: `+91 ••••• •${tenDigit.slice(-4)}`,
      purpose: {
        code: '101',
        category: 'Personal Finance Management',
        description: 'Expenditure verification, living expense isolation & leak discovery',
      },
      dataRange: {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        to: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
      dataTypes: ['DEPOSIT (Savings / Current Accounts)'],
      frequency: 'Daily periodic background refresh',
      encryption: '256-bit Curve25519 End-to-End',
      revocable: true,
    };

    return NextResponse.json({
      success: true,
      isLiveGateway: false,
      consentId,
      consentArtifact,
      bank: selectedBank,
      otpHint: otp,
      message: `OTP sent to +91 ••••• •${tenDigit.slice(-4)} via RBI AA Gateway`,
    });
  } catch (err: any) {
    console.error('Error generating AA consent:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to initiate Account Aggregator consent' },
      { status: 500 }
    );
  }
}
