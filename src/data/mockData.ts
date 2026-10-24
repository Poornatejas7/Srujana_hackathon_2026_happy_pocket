import { Account, RawTransaction } from '@/types/finance';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_chase_chk',
    name: 'Chase Total Checking',
    type: 'CHECKING',
    institution: 'Chase Bank',
    accountNumberMask: '•••• 4192',
    balance: 4280.50,
    currency: 'USD',
    color: '#2563eb'
  },
  {
    id: 'acc_amex_gold',
    name: 'Amex Gold Rewards',
    type: 'CREDIT_CARD',
    institution: 'American Express',
    accountNumberMask: '•••• 1008',
    balance: -1140.20,
    currency: 'USD',
    color: '#d97706'
  },
  {
    id: 'acc_hysa_marcus',
    name: 'Marcus High Yield Savings',
    type: 'SAVINGS',
    institution: 'Goldman Sachs',
    accountNumberMask: '•••• 8821',
    balance: 18450.00,
    currency: 'USD',
    color: '#059669'
  },
  {
    id: 'acc_apple_cash',
    name: 'Apple Cash / P2P',
    type: 'UPI_WALLET',
    institution: 'Apple Pay / Green Dot',
    accountNumberMask: '•••• 3099',
    balance: 215.00,
    currency: 'USD',
    color: '#7c3aed'
  }
];

export const INITIAL_RAW_TRANSACTIONS: RawTransaction[] = [
  // 1. Regular Salary Inflows
  {
    id: 'tx_inc_01',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-01T09:00:00Z',
    rawDescription: 'ACH DIRECT DEPOSIT TECH CORP PAYROLL 9912',
    amount: 3450.00,
    currency: 'USD'
  },
  {
    id: 'tx_inc_02',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-15T09:00:00Z',
    rawDescription: 'ACH DIRECT DEPOSIT TECH CORP PAYROLL 9912',
    amount: 3450.00,
    currency: 'USD'
  },

  // 2. Self-Transfers (Internal transfers that could fool naive calculators)
  {
    id: 'tx_trf_01_out',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-03T11:20:00Z',
    rawDescription: 'ONLINE TRANSFER TO MARCUS HYSA 8821 REF#99812',
    amount: -800.00,
    currency: 'USD'
  },
  {
    id: 'tx_trf_01_in',
    accountId: 'acc_hysa_marcus',
    timestamp: '2026-10-03T11:20:00Z',
    rawDescription: 'ELECTRONIC INFLOW FROM CHASE CHK 4192 REF#99812',
    amount: 800.00,
    currency: 'USD'
  },
  {
    id: 'tx_trf_02_out',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-12T16:05:00Z',
    rawDescription: 'AUTOPAY AMEX GOLD PAYMENT AUTOPAY REF#77182',
    amount: -920.00,
    currency: 'USD'
  },
  {
    id: 'tx_trf_02_in',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-12T16:05:00Z',
    rawDescription: 'ONLINE PAYMENT RECEIVED - THANK YOU',
    amount: 920.00,
    currency: 'USD'
  },

  // 3. Regular Subscriptions & Creeping Price Hikes
  {
    id: 'tx_sub_netflix_sep',
    accountId: 'acc_amex_gold',
    timestamp: '2026-09-18T04:12:00Z',
    rawDescription: 'NETFLIX.COM 866-579-7172 CA REF#4412',
    amount: -15.49,
    currency: 'USD'
  },
  {
    id: 'tx_sub_netflix_oct',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-18T04:12:00Z',
    rawDescription: 'NETFLIX.COM 866-579-7172 CA REF#9911',
    amount: -22.99, // Creeping price increase!
    currency: 'USD'
  },
  {
    id: 'tx_sub_spotify_sep',
    accountId: 'acc_chase_chk',
    timestamp: '2026-09-08T02:00:00Z',
    rawDescription: 'SPOTIFY USA 1500000 NEW YORK NY',
    amount: -11.99,
    currency: 'USD'
  },
  {
    id: 'tx_sub_spotify_oct',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-08T02:00:00Z',
    rawDescription: 'SPOTIFY USA 1500000 NEW YORK NY',
    amount: -11.99,
    currency: 'USD'
  },
  {
    id: 'tx_sub_gym_sep',
    accountId: 'acc_chase_chk',
    timestamp: '2026-09-01T08:00:00Z',
    rawDescription: 'EQUINOX FITNESS CLUBS NYC #219',
    amount: -180.00,
    currency: 'USD'
  },
  {
    id: 'tx_sub_gym_oct',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-01T08:00:00Z',
    rawDescription: 'EQUINOX FITNESS CLUBS NYC #219',
    amount: -180.00,
    currency: 'USD'
  },
  // Zombie subscription (user forgot after 14-day trial)
  {
    id: 'tx_sub_zombie_sep',
    accountId: 'acc_amex_gold',
    timestamp: '2026-09-24T12:00:00Z',
    rawDescription: 'LUMEN METABOLISM TRACKER PRO MTHLY',
    amount: -39.99,
    currency: 'USD'
  },
  {
    id: 'tx_sub_zombie_oct',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-24T12:00:00Z',
    rawDescription: 'LUMEN METABOLISM TRACKER PRO MTHLY',
    amount: -39.99,
    currency: 'USD'
  },

  // 4. Essential Utilities & Housing
  {
    id: 'tx_util_rent',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-01T01:00:00Z',
    rawDescription: 'AVALON BAY APARTMENTS ACH RENT RES-14A',
    amount: -1950.00,
    currency: 'USD'
  },
  {
    id: 'tx_util_power',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-05T14:15:00Z',
    rawDescription: 'CON EDISON BILL PAYMENT ELEC-GAS',
    amount: -114.60,
    currency: 'USD'
  },
  {
    id: 'tx_util_wifi',
    accountId: 'acc_chase_chk',
    timestamp: '2026-10-10T10:30:00Z',
    rawDescription: 'VERIZON FIOS INTERNET 300MBPS',
    amount: -79.99,
    currency: 'USD'
  },

  // 5. Purchases with Refunds & Returns
  {
    id: 'tx_shop_zara_purchase',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-04T15:20:00Z',
    rawDescription: 'ZARA USA STORE 048 NEW YORK NY',
    amount: -245.50,
    currency: 'USD'
  },
  {
    id: 'tx_shop_zara_refund',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-09T18:00:00Z',
    rawDescription: 'ZARA USA RETURN CREDIT STORE 048',
    amount: 180.00, // Partial return!
    currency: 'USD'
  },

  // 6. Split / Shared Expenses
  {
    id: 'tx_din_sushi_full',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-14T20:45:00Z',
    rawDescription: 'NOBU DOWNTOWN RESTAURANT NY',
    amount: -320.00,
    currency: 'USD'
  },
  {
    id: 'tx_din_sushi_split1',
    accountId: 'acc_apple_cash',
    timestamp: '2026-10-15T10:12:00Z',
    rawDescription: 'APPLE CASH RECEIVED FROM SARAH K "Nobu Dinner"',
    amount: 106.66,
    currency: 'USD'
  },
  {
    id: 'tx_din_sushi_split2',
    accountId: 'acc_apple_cash',
    timestamp: '2026-10-15T11:45:00Z',
    rawDescription: 'APPLE CASH RECEIVED FROM DAVE M "Nobu split"',
    amount: 106.66,
    currency: 'USD'
  },

  // 7. Everyday Discretionary & Groceries
  {
    id: 'tx_groc_trader',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-07T17:30:00Z',
    rawDescription: 'TRADER JOE S #542 CHELSEA',
    amount: -89.40,
    currency: 'USD'
  },
  {
    id: 'tx_groc_wholefoods',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-19T19:10:00Z',
    rawDescription: 'WHOLEFDS MKT UNION SQ NYC',
    amount: -134.12,
    currency: 'USD'
  },
  {
    id: 'tx_trans_uber',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-16T23:40:00Z',
    rawDescription: 'UBER *TRIP 9BK12 HELP.UBER.COM',
    amount: -42.80,
    currency: 'USD'
  },
  {
    id: 'tx_cafe_bluebottle',
    accountId: 'acc_amex_gold',
    timestamp: '2026-10-21T08:35:00Z',
    rawDescription: 'BLUE BOTTLE COFFEE BRYANT PK',
    amount: -7.50,
    currency: 'USD'
  }
];
