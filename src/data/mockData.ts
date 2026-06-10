import { Ticker, Position, TradeLog, NewsItem, EconomicEvent, SentimentMatrixItem, Candle } from '../types';

// Helper to generate a realistic candlestick series for a given base price
export function generateCandles(basePrice: number, count: number = 30): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = basePrice * 0.95; // start slightly lower for an upward trend

  for (let i = 0; i < count; i++) {
    // Generate simple random walk values
    const change = (Math.random() - 0.42) * (basePrice * 0.02); // slight positive bias
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.008);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.008);
    const volume = Math.floor(Math.random() * 500000) + 100000;

    // format a fake timestamp
    const date = new Date();
    date.setDate(date.getDate() - (count - i));
    const timeStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    candles.push({
      time: timeStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }
  return candles;
}

export const initialTickers: Ticker[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'equity',
    price: 903.55,
    change: 3.88,
    volume: '4.8M',
    history: generateCandles(903.55, 30),
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'equity',
    price: 189.43,
    change: 1.24,
    volume: '2.1M',
    history: generateCandles(189.43, 30),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'equity',
    price: 175.22,
    change: -2.41,
    volume: '3.5M',
    history: generateCandles(175.22, 30),
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    category: 'equity',
    price: 412.10,
    change: 0.45,
    volume: '1.8M',
    history: generateCandles(412.10, 30),
  },
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    category: 'crypto',
    price: 64281.50,
    change: -0.12,
    volume: '12.5k',
    history: generateCandles(64281.50, 30),
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum / US Dollar',
    category: 'crypto',
    price: 3452.12,
    change: 1.02,
    volume: '24.2k',
    history: generateCandles(3452.12, 30),
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'fx',
    price: 1.0842,
    change: 0.15,
    volume: '45.1M',
    history: generateCandles(1.0842, 30),
  },
  {
    symbol: 'GBP/USD',
    name: 'Pound / US Dollar',
    category: 'fx',
    price: 1.2615,
    change: -0.08,
    volume: '32.4M',
    history: generateCandles(1.2615, 30),
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    category: 'derivatives',
    price: 520.45,
    change: 0.32,
    volume: '8.4M',
    history: generateCandles(520.45, 30),
  }
];

export const initialPositions: Position[] = [
  {
    id: 'pos-1',
    symbol: 'NVDA.US',
    assetName: 'NVIDIA Corp.',
    exposure: 18.4,
    qty: 2450,
    avgPrice: 412.20,
    markPrice: 903.55,
    pnlPercent: 124.1,
    pnlAbs: 1250000,
    side: 'LONG',
  },
  {
    id: 'pos-2',
    symbol: 'BTC.X',
    assetName: 'Bitcoin Trust',
    exposure: 12.1,
    qty: 14.2,
    avgPrice: 42100.00,
    markPrice: 64281.50,
    pnlPercent: 52.6,
    pnlAbs: 314000,
    side: 'LONG',
  },
  {
    id: 'pos-3',
    symbol: 'US10Y.FI',
    assetName: 'Treasury 10Y',
    exposure: 24.5,
    qty: 3000000,
    avgPrice: 98.24,
    markPrice: 97.45,
    pnlPercent: -0.81,
    pnlAbs: -24000,
    side: 'LONG',
  },
  {
    id: 'pos-4',
    symbol: 'BRN.CMD',
    assetName: 'Brent Crude Fut',
    exposure: 4.2,
    qty: 500,
    avgPrice: 84.12,
    markPrice: 81.45,
    pnlPercent: -3.17,
    pnlAbs: -1300,
    side: 'SHORT', // matches "Shorts: 3" concept or we can mark it Short
  }
];

export const initialTradeLogs: TradeLog[] = [
  {
    id: 'TX-0921-XW',
    executionTime: '2023-10-24 14:22:01.042',
    instrument: 'BTC-PERP',
    side: 'BUY / LONG',
    avgPrice: 28451.20,
    quantity: 4.2000,
    notionalValue: 119495.04,
    feeBps: 0.05,
    status: 'FILLED',
    venue: 'COINBASE_PRIME',
    strategy: 'Momentum_Alpha_v4',
    clientTag: 'Prop-Desk-S1',
    orderType: 'Limit GTC',
    latency: '1.42 ms',
    walletAddress: '0x82a51f8B478ec94A71295329C1F5780ee0e18E91',
    steps: [
      { label: 'Order Initiated', time: '14:22:01.001', icon: 'play' },
      { label: 'Routing to Coinbase', time: '14:22:01.025', icon: 'send' },
      { label: 'Full Fill (4.2 BTC)', time: '14:22:01.042', icon: 'check' },
    ],
  },
  {
    id: 'TX-0920-BA',
    executionTime: '2023-10-24 14:18:45.912',
    instrument: 'ETH-PERP',
    side: 'SELL / SHORT',
    avgPrice: 1822.45,
    quantity: 50.0000,
    notionalValue: 91122.50,
    feeBps: 0.05,
    status: 'FILLED',
    venue: 'BINANCE_US_INST',
    strategy: 'Volatility_Arbitrage_v2',
    clientTag: 'Prop-Desk-S1',
    orderType: 'Limit GTC',
    latency: '1.85 ms',
    walletAddress: '0x38efC2719aBa7382c7aE9D1e2A3841920ee9C851',
    steps: [
      { label: 'Order Initiated', time: '14:18:45.801', icon: 'play' },
      { label: 'Routing to Binance Institutional', time: '14:18:45.875', icon: 'send' },
      { label: 'Full Fill (50.0 ETH)', time: '14:18:45.912', icon: 'check' },
    ],
  },
  {
    id: 'TX-0899-LM',
    executionTime: '2023-10-24 13:55:12.110',
    instrument: 'SOL-USD',
    side: 'BUY / LONG',
    avgPrice: 32.11,
    quantity: 1500.0000,
    notionalValue: 48165.00,
    feeBps: 0.08,
    status: 'CANCELLED',
    venue: 'KRAKEN_OTC',
    strategy: 'Mean_Reversion_Alpha',
    clientTag: 'Tactical-S2',
    orderType: 'Limit GTC',
    latency: '2.10 ms',
    steps: [
      { label: 'Order Initiated', time: '13:55:10.010', icon: 'play' },
      { label: 'Kraken Quote Received', time: '13:55:11.200', icon: 'send' },
      { label: 'Cancelled by User Request', time: '13:55:12.110', icon: 'cross' },
    ],
  },
  {
    id: 'TX-0889-QK',
    executionTime: '2023-10-24 12:44:01.231',
    instrument: 'LINK-USDT',
    side: 'BUY / LONG',
    avgPrice: 10.42,
    quantity: 2400.0000,
    notionalValue: 25008.00,
    feeBps: 0.05,
    status: 'FILLED',
    venue: 'BINANCE_US_INST',
    strategy: 'Correlation_Pari_v1',
    clientTag: 'Systematic-S3',
    orderType: 'Market GTC',
    latency: '0.95 ms',
    steps: [
      { label: 'Market Order Triggered', time: '12:44:00.890', icon: 'play' },
      { label: 'Routing to Binance', time: '12:44:01.120', icon: 'send' },
      { label: 'Full Fill (2400.00 LINK)', time: '12:44:01.231', icon: 'check' },
    ],
  },
  {
    id: 'TX-0888-QP',
    executionTime: '2023-10-24 12:42:15.004',
    instrument: 'NVDA-PERP',
    side: 'BUY / LONG',
    avgPrice: 412.50,
    quantity: 120.0000,
    notionalValue: 49500.00,
    feeBps: 0.05,
    status: 'FILLED',
    venue: 'COINBASE_PRIME',
    strategy: 'Momentum_Alpha_v4',
    clientTag: 'Prop-Desk-S1',
    orderType: 'Limit IOC',
    latency: '1.24 ms',
    steps: [
      { label: 'Limit Order Sent', time: '12:42:14.880', icon: 'play' },
      { label: 'Routed successfully', time: '12:42:14.950', icon: 'send' },
      { label: 'Filled 120 Units', time: '12:42:15.004', icon: 'check' },
    ],
  }
];

export const initialNews: NewsItem[] = [
  {
    id: 'news-1',
    category: 'MACRO',
    time: '14:22:10',
    title: 'Fed’s Powell Signals Rates May Stay Higher for Longer as Inflation Persists',
    sentiment: 'BEARISH',
    score: 75,
    volume: '1.2M',
  },
  {
    id: 'news-2',
    category: 'TECH',
    time: '14:15:45',
    title: 'NVIDIA Blackwell Production Yields Exceed Initial Institutional Expectations',
    sentiment: 'BULLISH',
    score: 88,
    volume: '4.8M',
  },
  {
    id: 'news-3',
    category: 'FX',
    time: '13:58:30',
    title: 'ECB Balance Sheet Reduction Accelerated; Euro Resilience Tested Against USD',
    sentiment: 'NEUTRAL',
    score: 20,
    volume: '0.9M',
  },
  {
    id: 'news-4',
    category: 'ENERGY',
    time: '13:40:12',
    title: 'WTI Crude Futures Stabilize Near $82 Amid Middle East De-escalation Tones',
    sentiment: 'STABLE',
    score: 55,
    volume: '2.1M',
  },
  {
    id: 'news-5',
    category: 'REGULATE',
    time: '12:10:04',
    title: 'SEC Establishes Clearer Framework for Tokenized Financial Securities Custody',
    sentiment: 'BULLISH',
    score: 65,
    volume: '0.8M',
  }
];

export const initialEvents: EconomicEvent[] = [
  {
    id: 'event-1',
    time: '15:30',
    title: 'US Core CPI (MoM)',
    actual: '0.4%',
    forecast: '0.3%',
    prev: '0.3%',
    impact: 'HIGH',
  },
  {
    id: 'event-2',
    time: '16:45',
    title: 'CAD Housing Starts',
    actual: '242K',
    forecast: '238K',
    prev: '240K',
    impact: 'MID',
  },
  {
    id: 'event-3',
    time: '18:00',
    title: 'US Business Inventories',
    actual: '--',
    forecast: '0.4%',
    prev: '0.3%',
    impact: 'LOW',
  },
  {
    id: 'event-4',
    time: '21:00',
    title: 'FOMC Meeting Minutes',
    actual: 'HAWKISH',
    forecast: 'NEUTRAL',
    prev: 'DOVISH',
    impact: 'HIGH',
  }
];

export const initialSentimentMatrix: SentimentMatrixItem[] = [
  { symbol: 'TSLA', score: 82, bgColor: 'bg-primary/40 border-primary/20' },
  { symbol: 'META', score: -45, bgColor: 'bg-error/30 border-error/20' },
  { symbol: 'GOOGL', score: 12, bgColor: 'bg-primary/20 border-primary/10' },
  { symbol: 'AMD', score: 94, bgColor: 'bg-primary/60 border-primary/20' },
  { symbol: 'AMZN', score: 0, bgColor: 'bg-surface-container-highest border-outline-variant' },
  { symbol: 'NFLX', score: -15, bgColor: 'bg-error/10 border-error/10' },
  { symbol: 'ASML', score: 33, bgColor: 'bg-primary/30 border-primary/20' },
  { symbol: 'INTC', score: -62, bgColor: 'bg-error/40 border-error/20' }
];
