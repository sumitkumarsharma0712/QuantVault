import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MarketsView from './components/MarketsView';
import PortfolioView from './components/PortfolioView';
import ResearchView from './components/ResearchView';
import AuditView from './components/AuditView';
import LoginView from './components/LoginView';
import OnboardingView from './components/OnboardingView';

import { Ticker, Position, TradeLog } from './types';
import { initialTickers, initialPositions, initialTradeLogs } from './data/mockData';
import { Settings as SettingsIcon, ShieldAlert, CheckSquare, RefreshCw, HelpCircle } from 'lucide-react';

interface User {
  name: string;
  role: string;
  id: string;
}

export default function App() {
  // Session management state: 'login' | 'onboarding' | 'dashboard'
  const [sessionState, setSessionState] = useState<'login' | 'onboarding' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core application database engines
  const [tickers, setTickers] = useState<Ticker[]>(initialTickers);
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(initialTradeLogs);

  // Navigation filtering indices
  const [activeTab, setActiveTab] = useState<string>('Markets');
  const [selectedTickerSymbol, setSelectedTickerSymbol] = useState<string>('NVDA');
  const [assetCategory, setAssetCategory] = useState<'equity' | 'crypto' | 'fx' | 'derivatives'>('equity');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [latency, setLatency] = useState<number>(12);

  // Settings screen inputs
  const [complianceLock, setComplianceLock] = useState(true);
  const [apiReportingEnabled, setApiReportingEnabled] = useState(false);

  // Calculated Portfolio value
  const [portfolioValue, setPortfolioValue] = useState<number>(12842094.82);

  // Handle successful login
  const handleLoginSuccess = (email: string) => {
    // Generate a beautiful mock user based on email
    const namePrefix = email.split('@')[0];
    const capitalized = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
    setCurrentUser({
      name: `${capitalized} Dalton`,
      role: 'Senior Trader',
      id: `QV-09${Math.floor(10 + Math.random() * 90)}`
    });
    setSessionState('dashboard');
  };

  // Handle onboarding compliance signup complete
  const handleOnboardingComplete = (firmName: string, fullName: string) => {
    setCurrentUser({
      name: fullName || 'James Dalton',
      role: 'Prop Investigator',
      id: `QV-08${Math.floor(10 + Math.random() * 90)}`
    });
    setSessionState('dashboard');
  };

  // Live simulation speed modifier
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(1);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('qv_gemini_api_key') || '');

  // Live simulation ticker ticking up and down (scaled by simSpeed)
  useEffect(() => {
    if (sessionState !== 'dashboard') return;

    const intervalMs = simSpeed === 5 ? 700 : simSpeed === 2 ? 1500 : 3500;

    const timer = setInterval(() => {
      // 1. We update all ticker prices slightly
      setTickers((prevTickers) =>
        prevTickers.map((t) => {
          const deltaPct = (Math.random() - 0.49) * 0.003; // small randomized walk +/- 0.15%
          const newPrice = parseFloat((t.price * (1 + deltaPct)).toFixed(2));
          const changeDelta = parseFloat((t.change + deltaPct * 100).toFixed(2));

          // Also tick the last candlestick in chart history
          const updatedHistory = [...t.history];
          if (updatedHistory.length > 0) {
            const lastCandle = { ...updatedHistory[updatedHistory.length - 1] };
            lastCandle.close = newPrice;
            lastCandle.high = Math.max(lastCandle.high, newPrice);
            lastCandle.low = Math.min(lastCandle.low, newPrice);
            updatedHistory[updatedHistory.length - 1] = lastCandle;
          }

          return {
            ...t,
            price: newPrice,
            change: changeDelta,
            history: updatedHistory
          };
        })
      );

      // 2. Adjust network latency jitter slightly
      setLatency((prev) => Math.max(8, Math.min(24, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [sessionState, simSpeed]);

  // Sync positions markPrice, absolute PnL values, and check TP/SL Bracket order triggers
  useEffect(() => {
    setPositions((prevPositions) => {
      const updatedPositions: Position[] = [];

      for (const pos of prevPositions) {
        const pureSymbol = pos.symbol.split('.')[0];
        const ticker = tickers.find((t) => t.symbol === pureSymbol || t.symbol === pos.symbol);
        
        if (ticker) {
          const newMark = ticker.price;
          const delta = pos.side === 'LONG' ? (newMark - pos.avgPrice) : (pos.avgPrice - newMark);
          const pnlAbs = parseFloat((delta * pos.qty).toFixed(2));
          const pnlPercent = parseFloat(((delta / pos.avgPrice) * 100).toFixed(1));

          // Bracket Trigger Check
          let triggered = false;
          let triggerType: 'TP' | 'SL' | null = null;

          if (pos.takeProfit) {
            if ((pos.side === 'LONG' && newMark >= pos.takeProfit) || (pos.side === 'SHORT' && newMark <= pos.takeProfit)) {
              triggered = true;
              triggerType = 'TP';
            }
          }
          if (pos.stopLoss) {
            if ((pos.side === 'LONG' && newMark <= pos.stopLoss) || (pos.side === 'SHORT' && newMark >= pos.stopLoss)) {
              triggered = true;
              triggerType = 'SL';
            }
          }

          if (triggered && triggerType) {
            const orderId = `TX-09${Math.floor(20 + Math.random() * 80)}-TR`;
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

            const triggerLogItem: TradeLog = {
              id: orderId,
              executionTime: timeStr,
              instrument: pos.symbol,
              side: pos.side === 'LONG' ? 'SELL / SHORT' : 'BUY / LONG',
              avgPrice: newMark,
              quantity: pos.qty,
              notionalValue: parseFloat((pos.qty * newMark).toFixed(2)),
              feeBps: 0.05,
              status: 'FILLED',
              venue: 'COINBASE_PRIME',
              strategy: triggerType === 'TP' ? 'Bracket_TakeProfit_v1' : 'Bracket_StopLoss_v1',
              clientTag: 'Automated-Trigger',
              orderType: 'Market IOC',
              latency: '0.85 ms',
              steps: [
                { label: `${triggerType} Price Crossed`, time: now.toLocaleTimeString(), icon: 'play' },
                { label: 'Auto Liquidation Executed', time: now.toLocaleTimeString(), icon: 'check' },
              ]
            };

            setTradeLogs((prev) => [triggerLogItem, ...prev]);
            continue; // Liquidation complete, skip keeping position
          }

          updatedPositions.push({
            ...pos,
            markPrice: newMark,
            pnlAbs,
            pnlPercent
          });
        } else {
          updatedPositions.push(pos);
        }
      }

      return updatedPositions;
    });
  }, [tickers]);

  // Recalculate portfolio valuation when position profits fluctuate
  useEffect(() => {
    const basisValue = 11250000.00; // base liquid collateral value
    const totalPnLAbs = positions.reduce((acc, p) => acc + p.pnlAbs, 0);
    setPortfolioValue(basisValue + totalPnLAbs);
  }, [positions]);

  // Handle placing a transaction order (with TP/SL bracket fields)
  const handleTradeExecuted = (
    symbol: string,
    side: 'BUY' | 'SELL',
    qty: number,
    price: number,
    type: 'LIMIT' | 'MARKET' | 'STOP',
    takeProfit?: number,
    stopLoss?: number
  ) => {
    // 1. Append a new trade audit log
    const orderId = `TX-09${Math.floor(20 + Math.random() * 80)}-XW`;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    const newLogItem: TradeLog = {
      id: orderId,
      executionTime: timeStr,
      instrument: `${symbol}-PERP`,
      side: side === 'BUY' ? 'BUY / LONG' : 'SELL / SHORT',
      avgPrice: price,
      quantity: qty,
      notionalValue: parseFloat((qty * price).toFixed(2)),
      feeBps: 0.05,
      status: 'FILLED',
      venue: 'COINBASE_PRIME',
      strategy: 'Momentum_Alpha_v4',
      clientTag: 'Prop-Desk-S1',
      orderType: `${type} GTC`,
      latency: `${(Math.random() * 1.5 + 0.5).toFixed(2)} ms`,
      steps: [
        { label: 'Order Initiated', time: now.toLocaleTimeString(), icon: 'play' },
        { label: 'Routing to Coinbase', time: now.toLocaleTimeString(), icon: 'send' },
        { label: `Full Fill (${qty} units)`, time: now.toLocaleTimeString(), icon: 'check' },
      ]
    };

    setTradeLogs((prev) => [newLogItem, ...prev]);

    // 2. Create or adjust Position record
    setPositions((prevPositions) => {
      const existingIndex = prevPositions.findIndex((p) => p.symbol === symbol || p.symbol.startsWith(symbol));
      
      if (existingIndex !== -1) {
        const updated = [...prevPositions];
        const target = updated[existingIndex];
        const isAligned = (target.side === 'LONG' && side === 'BUY') || (target.side === 'SHORT' && side === 'SELL');

        if (isAligned) {
          const totalCost = (target.avgPrice * target.qty) + (price * qty);
          const totalQty = target.qty + qty;
          const avgPrice = parseFloat((totalCost / totalQty).toFixed(2));

          updated[existingIndex] = {
            ...target,
            qty: totalQty,
            avgPrice,
            takeProfit: takeProfit || target.takeProfit,
            stopLoss: stopLoss || target.stopLoss
          };
        } else {
          if (target.qty > qty) {
            updated[existingIndex] = {
              ...target,
              qty: target.qty - qty
            };
          } else {
            updated.splice(existingIndex, 1);
          }
        }
        return updated;
      } else {
        const newPos: Position = {
          id: `pos-${Math.floor(Math.random() * 900) + 100}`,
          symbol: `${symbol}.US`,
          assetName: symbol === 'NVDA' ? 'NVIDIA Corp.' : symbol === 'AAPL' ? 'Apple Inc.' : symbol === 'TSLA' ? 'Tesla Inc.' : 'Sub Asset Allocation',
          exposure: 8.5,
          qty,
          avgPrice: price,
          markPrice: price,
          pnlPercent: 0,
          pnlAbs: 0,
          side: side === 'BUY' ? 'LONG' : 'SHORT',
          takeProfit,
          stopLoss
        };
        return [...prevPositions, newPos];
      }
    });
  };

  // Liquidate complete position allocation
  const handlePositionClosed = (id: string) => {
    const target = positions.find((p) => p.id === id);
    if (!target) return;

    const orderId = `TX-09${Math.floor(20 + Math.random() * 80)}-CC`;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    const exitLogItem: TradeLog = {
      id: orderId,
      executionTime: timeStr,
      instrument: target.symbol,
      side: target.side === 'LONG' ? 'SELL / SHORT' : 'BUY / LONG',
      avgPrice: target.markPrice,
      quantity: target.qty,
      notionalValue: parseFloat((target.qty * target.markPrice).toFixed(2)),
      feeBps: 0.05,
      status: 'FILLED',
      venue: 'COINBASE_PRIME',
      strategy: 'Manual_Termination',
      clientTag: 'Risk-Desk',
      orderType: 'Market IOC',
      latency: '1.02 ms',
      steps: [
        { label: 'Liquidation Trigger', time: now.toLocaleTimeString(), icon: 'play' },
        { label: 'Settlement confirmed', time: now.toLocaleTimeString(), icon: 'check' },
      ]
    };

    setTradeLogs((prev) => [exitLogItem, ...prev]);
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'Markets':
        return (
          <MarketsView
            tickers={tickers}
            positions={positions}
            tradeLogs={tradeLogs}
            selectedTickerSymbol={selectedTickerSymbol}
            setSelectedTickerSymbol={setSelectedTickerSymbol}
            assetCategory={assetCategory}
            searchTerm={searchTerm}
            onTradeExecuted={handleTradeExecuted}
            onPositionClosed={handlePositionClosed}
            portfolioValue={portfolioValue}
          />
        );
      case 'Trade':
        return <AuditView />;
      case 'Portfolio':
        return <PortfolioView positions={positions} portfolioValue={portfolioValue} />;
      case 'Research':
        return <ResearchView geminiApiKey={geminiApiKey} />;
      case 'Settings':
        return (
          <div className="pt-12 p-6 max-w-2xl mx-auto space-y-6">
            <div className="border border-outline-variant rounded-md bg-surface-container-low p-4 select-none">
              <div className="flex gap-2 items-center text-primary mb-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <h3 className="font-sans text-base font-bold text-on-surface">Terminal Settings & Compliance</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Configure your localized Secure Sandbox. Manage trading desks, API reporting protocols, and legal clearing requirements.
              </p>
            </div>

            <div className="border border-outline-variant rounded bg-surface-container divide-y divide-outline-variant/30 select-none">
              {/* Simulation Velocity Selector */}
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-sans text-xs font-bold text-on-surface uppercase tracking-wider">Simulation Tick Speed</h4>
                  <p className="text-[11px] text-on-surface-variant/80 mt-0.5">Adjust how fast market prices tick and update in real-time.</p>
                </div>
                <div className="flex gap-1.5">
                  {([1, 2, 5] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSimSpeed(speed)}
                      className={`px-3 py-1 font-sans text-xs font-bold rounded border transition-all cursor-pointer ${
                        simSpeed === speed
                          ? 'bg-primary border-primary text-on-primary'
                          : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini API Key Configuration */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-sans text-xs font-bold text-on-surface uppercase tracking-wider">Gemini API Token</h4>
                    <p className="text-[11px] text-on-surface-variant/80 mt-0.5">Activate real-time institutional AI copilot forecasting & analytics.</p>
                  </div>
                </div>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGeminiApiKey(val);
                    localStorage.setItem('qv_gemini_api_key', val);
                  }}
                  placeholder="Enter Gemini API Key..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded p-2 font-mono text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              {/* Compliance switch */}
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-sans text-xs font-bold text-on-surface uppercase tracking-wider">Enforce Regulatory Compliance lock</h4>
                  <p className="text-[11px] text-on-surface-variant/80 mt-0.5">Blocks non-compliant transaction scopes automatically.</p>
                </div>
                <input
                  type="checkbox"
                  checked={complianceLock}
                  onChange={(e) => setComplianceLock(e.target.checked)}
                  className="rounded bg-surface-variant text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* API Reporting switch */}
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-sans text-xs font-bold text-on-surface uppercase tracking-wider">API Transaction Reporting Feed</h4>
                  <p className="text-[11px] text-on-surface-variant/80 mt-0.5">Broadcast real-time trading audit streams to clearing agencies.</p>
                </div>
                <input
                  type="checkbox"
                  checked={apiReportingEnabled}
                  onChange={(e) => setApiReportingEnabled(e.target.checked)}
                  className="rounded bg-surface-variant text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-primary shrink-0 self-start" />
              <div>
                <h4 className="font-sans text-xs font-bold text-on-surface">FIPS 140-2 Cryptographic Secure</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">
                  This QuantVault institutional workstation complies with federal clearing requirements and employs zero-knowledge proof calculations for auditing transactions.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-12 text-center text-xs text-on-surface-variant">Module in development.</div>;
    }
  };

  // Rendering screen based on sessionState
  if (sessionState === 'login') {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onRequestAccess={() => setSessionState('onboarding')}
      />
    );
  }

  if (sessionState === 'onboarding') {
    return (
      <OnboardingView
        onBackToLogin={() => setSessionState('login')}
        onOnboardingComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="flex bg-surface-dim text-on-surface font-sans selection:bg-primary/30 min-h-screen">
      {/* Shared fixed Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setSessionState('login');
          setActiveTab('Markets');
        }}
      />

      {/* Main workspace (Offsets to match the sidebar's w-64 height) */}
      <div className="flex-1 pl-64 flex flex-col relative min-h-screen">
        <Header
          activeTab={activeTab}
          assetCategory={assetCategory}
          setAssetCategory={setAssetCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          latency={latency}
        />
        
        {/* Rendered main screen area content */}
        <main className="flex-1 bg-surface-dim overflow-none">
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
}
