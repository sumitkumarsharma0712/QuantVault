export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker {
  symbol: string;
  name: string;
  category: 'equity' | 'crypto' | 'fx' | 'derivatives';
  price: number;
  change: number; // percentage, e.g. +3.88
  volume: string; // e.g. "4.8M"
  history: Candle[];
}

export interface Position {
  id: string;
  symbol: string;
  assetName: string;
  exposure: number; // e.g. 18.4 (percent of portfolio)
  qty: number;
  avgPrice: number;
  markPrice: number;
  pnlPercent: number;
  pnlAbs: number;
  side: 'LONG' | 'SHORT';
  takeProfit?: number;
  stopLoss?: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  type: 'LIMIT' | 'MARKET' | 'STOP';
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  time: string;
}

export interface ExecutionStep {
  label: string;
  time: string;
  icon: string;
}

export interface TradeLog {
  id: string;
  executionTime: string;
  instrument: string;
  side: 'BUY / LONG' | 'SELL / SHORT';
  avgPrice: number;
  quantity: number;
  notionalValue: number;
  feeBps: number;
  status: 'FILLED' | 'CANCELLED';
  venue: string;
  // Details for inspector
  strategy: string;
  clientTag: string;
  orderType: string;
  latency: string;
  walletAddress?: string;
  steps: ExecutionStep[];
}

export interface NewsItem {
  id: string;
  category: string;
  time: string;
  title: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'STABLE';
  score: number; // e.g. 75 for 75% bar fill
  volume: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  title: string;
  actual: string;
  forecast: string;
  prev: string;
  impact: 'HIGH' | 'MID' | 'LOW';
}

export interface SentimentMatrixItem {
  symbol: string;
  score: number; // e.g. 82 or -45
  bgColor: string;
}
