import React, { useState, useEffect, useRef } from 'react';
import { Ticker, Position, TradeLog, Candle } from '../types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, Filter, ChevronRight, Info, Check, HelpCircle } from 'lucide-react';

interface MarketsViewProps {
  tickers: Ticker[];
  positions: Position[];
  tradeLogs: TradeLog[];
  selectedTickerSymbol: string;
  setSelectedTickerSymbol: (symbol: string) => void;
  assetCategory: 'equity' | 'crypto' | 'fx' | 'derivatives';
  searchTerm: string;
  onTradeExecuted: (symbol: string, side: 'BUY' | 'SELL', qty: number, price: number, type: 'LIMIT' | 'MARKET' | 'STOP', takeProfit?: number, stopLoss?: number) => void;
  onPositionClosed: (id: string) => void;
  portfolioValue: number;
}

export default function MarketsView({
  tickers,
  positions,
  tradeLogs,
  selectedTickerSymbol,
  setSelectedTickerSymbol,
  assetCategory,
  searchTerm,
  onTradeExecuted,
  onPositionClosed,
  portfolioValue
}: MarketsViewProps) {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '1h' | 'D'>('5m');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'STOP'>('LIMIT');
  const [activeLedgerTab, setActiveLedgerTab] = useState<'positions' | 'history'>('positions');

  // Interactive Chart Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [showEMA, setShowEMA] = useState(false);
  const [showBB, setShowBB] = useState(false);

  // Execution inputs
  const [execPriceInput, setExecPriceInput] = useState('903.55');
  const [execSizeInput, setExecSizeInput] = useState('');
  const [takeProfitInput, setTakeProfitInput] = useState('');
  const [stopLossInput, setStopLossInput] = useState('');
  const [postOnly, setPostOnly] = useState(false);
  const [execMessage, setExecMessage] = useState<string | null>(null);

  // Drag-to-pan states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Hover state for candlestick chart tooltip
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [crosshairX, setCrosshairX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Find active ticker
  const activeTicker = tickers.find((t) => t.symbol === selectedTickerSymbol) || tickers[0];

  useEffect(() => {
    if (activeTicker) {
      setExecPriceInput(activeTicker.price.toString());
    }
  }, [selectedTickerSymbol, activeTicker]);

  // Reset zoom & pan when active ticker changes
  useEffect(() => {
    setZoom(1);
    setPanOffset(0);
  }, [selectedTickerSymbol]);

  // Handle transaction submit
  const handleExecuteTrade = (side: 'BUY' | 'SELL') => {
    const qty = parseFloat(execSizeInput);
    if (!qty || isNaN(qty) || qty <= 0) {
      alert('Kindly specify an execution quantity greater than 0.');
      return;
    }

    const price = orderType === 'MARKET' ? activeTicker.price : parseFloat(execPriceInput);
    if (!price || isNaN(price) || price <= 0) {
      alert('Kindly specify a valid numeric price.');
      return;
    }

    const tp = parseFloat(takeProfitInput);
    const sl = parseFloat(stopLossInput);

    // Call callback to perform central ledger state calculation
    onTradeExecuted(
      activeTicker.symbol,
      side,
      qty,
      price,
      orderType,
      isNaN(tp) ? undefined : tp,
      isNaN(sl) ? undefined : sl
    );

    // Show flash confirmation
    setExecMessage(`SECURE DESK: ${side} Order of ${qty} units of ${activeTicker.symbol} filled successfully!`);
    setExecSizeInput('');
    setTakeProfitInput('');
    setStopLossInput('');

    setTimeout(() => {
      setExecMessage(null);
    }, 4000);
  };

  // Quick helper to prefill 100% max size
  const handleSetMaxSize = () => {
    const available = 42104.22; // styled preset mock balance
    const price = parseFloat(execPriceInput) || activeTicker.price;
    const maxUnits = available / price;
    setExecSizeInput(maxUnits.toFixed(4));
  };

  // Filter tickers list based on active category tabs and search term
  const filteredTickers = tickers.filter((t) => {
    const matchesCategory = t.category === assetCategory;
    const matchesSearch = t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate order book depth items
  // Generates asks/bids with offset from market price
  const generateOrderBookDepth = () => {
    if (!activeTicker) return { asks: [], bids: [] };
    const price = activeTicker.price;
    const tick = price > 1000 ? 1.00 : price > 100 ? 0.05 : 0.01;

    const asks = [
      { price: price + tick * 3, qty: 1240, scale: '12.5k', width: '45%' },
      { price: price + tick * 2, qty: 450, scale: '11.3k', width: '30%' },
      { price: price + tick * 1, qty: 88, scale: '10.8k', width: '15%' },
    ];

    const bids = [
      { price: price - tick * 1, qty: 210, scale: '210', width: '20%' },
      { price: price - tick * 2, qty: 1500, scale: '1.7k', width: '60%' },
      { price: price - tick * 3, qty: 2240, scale: '3.9k', width: '80%' },
    ];

    return { asks, bids };
  };

  const { asks, bids } = generateOrderBookDepth();

  // Visible slice based on zoom and pan
  const totalItems = activeTicker?.history?.length || 0;
  const visibleCount = Math.max(5, Math.round(totalItems / zoom));
  const maxPan = totalItems - visibleCount;
  const clampedPan = Math.max(0, Math.min(maxPan, panOffset));
  const visibleHistory = activeTicker?.history?.slice(clampedPan, clampedPan + visibleCount) || [];

  // Calculate Indicators over entire history
  const calculateEMA = (data: Candle[], period: number = 10) => {
    if (data.length === 0) return [];
    const ema: number[] = [];
    const k = 2 / (period + 1);
    let currentEma = data[0].close;
    ema.push(currentEma);
    for (let i = 1; i < data.length; i++) {
      currentEma = data[i].close * k + currentEma * (1 - k);
      ema.push(currentEma);
    }
    return ema;
  };

  const calculateBB = (data: Candle[], period: number = 15) => {
    const upper: number[] = [];
    const lower: number[] = [];
    const basis: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        basis.push(data[i].close);
        upper.push(data[i].close);
        lower.push(data[i].close);
        continue;
      }
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      const sma = sum / period;
      const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      basis.push(sma);
      upper.push(sma + 2 * stdDev);
      lower.push(sma - 2 * stdDev);
    }
    return { basis, upper, lower };
  };

  const fullEMA = calculateEMA(activeTicker?.history || []);
  const fullBB = calculateBB(activeTicker?.history || []);

  // Slice indicators to match visible history
  const emaData = fullEMA.slice(clampedPan, clampedPan + visibleCount);
  const bbData = {
    basis: fullBB.basis.slice(clampedPan, clampedPan + visibleCount),
    upper: fullBB.upper.slice(clampedPan, clampedPan + visibleCount),
    lower: fullBB.lower.slice(clampedPan, clampedPan + visibleCount)
  };

  // Mouse handling
  const handleChartMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current || !activeTicker) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    if (isDragging) {
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 4) {
        const sensitivity = 0.4;
        setPanOffset((prev) => {
          const shift = Math.round(-deltaX * sensitivity);
          return Math.max(0, Math.min(totalItems - visibleCount, prev + shift));
        });
        setStartX(e.clientX);
      }
    } else {
      const x = e.clientX - rect.left;
      const width = rect.width;
      const historyCount = visibleHistory.length;
      const index = Math.floor((x / width) * historyCount);
      if (index >= 0 && index < historyCount) {
        setHoveredCandle(visibleHistory[index]);
        setCrosshairX(x);
      }
    }
  };

  const handleChartMouseLeave = () => {
    setIsDragging(false);
    setHoveredCandle(null);
    setCrosshairX(null);
  };

  const handleChartMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="grid grid-cols-12 gap-2 h-[calc(100vh-3rem)] overflow-hidden bg-surface-dim pt-12 p-2">
      
      {/* 1. Left panel: Market Watch (2/12 columns) */}
      <section className="col-span-12 lg:col-span-2 bg-surface-container border border-outline-variant flex flex-col rounded-md overflow-hidden">
        <div className="p-2 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
          <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Market Watch</span>
          <Filter className="w-3.5 h-3.5 text-on-surface-variant cursor-pointer" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur-md text-[9px] font-bold text-outline">
              <tr className="border-b border-outline-variant/30">
                <th className="p-2">TICKER</th>
                <th className="p-2 text-right">PRICE</th>
                <th className="p-2 text-right">CHG%</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px] font-medium">
              {filteredTickers.map((t) => {
                const isSelected = t.symbol === selectedTickerSymbol;
                const isPositive = t.change >= 0;
                return (
                  <tr
                    key={t.symbol}
                    onClick={() => setSelectedTickerSymbol(t.symbol)}
                    className={`hover:bg-surface-container-highest cursor-pointer border-b border-outline-variant/20 transition-all ${
                      isSelected ? 'bg-surface-container-highest border-r-2 border-primary text-on-surface' : 'text-on-surface-variant'
                    }`}
                  >
                    <td className="p-2 font-sans font-bold text-xs">{t.symbol}</td>
                    <td className="p-2 text-right text-on-surface font-semibold">
                      {t.price > 100 ? t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.price.toFixed(4)}
                    </td>
                    <td className={`p-2 text-right font-bold ${isPositive ? 'text-primary' : 'text-[#FB923C]'}`}>
                      {isPositive ? '+' : ''}{t.change.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
              {filteredTickers.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center font-sans text-xs text-on-surface-variant/50">
                    No matching sub-assets
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Center: Charting & positions ledger (7/12 columns) */}
      <section className="col-span-12 lg:col-span-7 flex flex-col gap-2 overflow-hidden height-full">
        {/* Interactive Candle Chart */}
        <div className="flex-1 min-h-[300px] bg-surface-container border border-outline-variant relative flex flex-col rounded-md overflow-hidden">
          <div className="p-2 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="font-sans font-extrabold text-lg text-primary">{activeTicker?.symbol}</span>
                <span className="font-mono text-sm text-on-surface-variant font-medium">
                  {activeTicker?.price > 100 
                    ? activeTicker?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : activeTicker?.price?.toFixed(4)}
                </span>
                <span className={`font-mono text-xs font-bold ${activeTicker?.change >= 0 ? 'text-primary' : 'text-[#FB923C]'}`}>
                  {activeTicker?.change >= 0 ? '+' : ''}{activeTicker?.change?.toFixed(2)}%
                </span>
              </div>
              <div className="flex gap-1.5 items-center">
                {(['1m', '5m', '1h', 'D'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2 py-0.5 text-[9px] font-sans font-bold rounded-sm border cursor-pointer transition-all ${
                      timeframe === t
                        ? 'bg-primary border-primary text-on-primary font-bold'
                        : 'bg-surface-variant border-outline-variant/30 text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    {t}
                  </button>
                ))}

                {/* Zoom / Pan Navigation */}
                <div className="h-4 w-[1px] bg-outline-variant/40 mx-1"></div>
                <button
                  onClick={() => setZoom(z => Math.min(8, z + 0.5))}
                  className="px-2 py-0.5 text-[9px] bg-surface-variant border border-outline-variant/30 text-on-surface-variant font-bold rounded hover:border-outline cursor-pointer"
                  title="Zoom In"
                >
                  + Zoom
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(1, z - 0.5))}
                  className="px-2 py-0.5 text-[9px] bg-surface-variant border border-outline-variant/30 text-on-surface-variant font-bold rounded hover:border-outline cursor-pointer"
                  title="Zoom Out"
                >
                  - Zoom
                </button>
                <button
                  onClick={() => { setZoom(1); setPanOffset(0); }}
                  className="px-2 py-0.5 text-[9px] bg-surface-variant border border-outline-variant/30 text-on-surface-variant font-bold rounded hover:border-outline cursor-pointer"
                  title="Reset"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Technical Indicators Checkboxes */}
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-1 text-[9px] font-sans font-bold text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEMA}
                  onChange={(e) => setShowEMA(e.target.checked)}
                  className="w-3 h-3 text-primary bg-surface-container rounded border-outline-variant"
                />
                EMA (10)
              </label>
              <label className="flex items-center gap-1 text-[9px] font-sans font-bold text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBB}
                  onChange={(e) => setShowBB(e.target.checked)}
                  className="w-3 h-3 text-primary bg-surface-container rounded border-outline-variant"
                />
                Bollinger Bands
              </label>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant px-2 py-0.5 bg-surface-container-highest rounded border border-outline-variant flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                DRAG TO PAN
              </span>
            </div>
          </div>

          {/* Svg Candlestick plot container */}
          <div className="flex-1 relative overflow-hidden bg-surface-container-lowest">
            {/* Background absolute grid decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{
              backgroundImage: 'linear-gradient(#424754 1px, transparent 1px), linear-gradient(90deg, #424754 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>

            {/* Custom interactive Chart Tooltip Headup Display */}
            <div className="absolute top-2 left-2 z-20 pointer-events-none bg-surface-container-high/90 border border-outline-variant p-2 rounded text-[10px] font-mono grid grid-cols-5 gap-3 shadow-md backdrop-blur-sm">
              <div><span className="text-on-surface-variant block uppercase text-[8px] tracking-wider">Time</span><span className="text-on-surface font-semibold">{hoveredCandle ? hoveredCandle.time : visibleHistory[visibleHistory.length-1]?.time}</span></div>
              <div><span className="text-on-surface-variant block uppercase text-[8px] tracking-wider">Open</span><span className="text-on-surface font-semibold">${hoveredCandle ? hoveredCandle.open.toFixed(2) : visibleHistory[visibleHistory.length-1]?.open.toFixed(2)}</span></div>
              <div><span className="text-on-surface-variant block uppercase text-[8px] tracking-wider">High</span><span className="text-primary font-semibold">${hoveredCandle ? hoveredCandle.high.toFixed(2) : visibleHistory[visibleHistory.length-1]?.high.toFixed(2)}</span></div>
              <div><span className="text-on-surface-variant block uppercase text-[8px] tracking-wider">Low</span><span className="text-[#FB923C] font-semibold">${hoveredCandle ? hoveredCandle.low.toFixed(2) : visibleHistory[visibleHistory.length-1]?.low.toFixed(2)}</span></div>
              <div><span className="text-on-surface-variant block uppercase text-[8px] tracking-wider">Close</span><span className="text-on-surface font-semibold">${hoveredCandle ? hoveredCandle.close.toFixed(2) : visibleHistory[visibleHistory.length-1]?.close.toFixed(2)}</span></div>
            </div>

            {/* Rendered SVG path & polygons */}
            {activeTicker && visibleHistory.length > 0 && (
              <svg
                ref={svgRef}
                className="w-full h-full p-2"
                onMouseDown={handleChartMouseDown}
                onMouseMove={handleChartMouseMove}
                onMouseLeave={handleChartMouseLeave}
                onMouseUp={handleChartMouseUp}
              >
                {/* Find limits to scale chart properly */}
                {(() => {
                  const oHigh = Math.max(...visibleHistory.map(c => c.high));
                  const oLow = Math.min(...visibleHistory.map(c => c.low));
                  const margin = (oHigh - oLow) * 0.15 || 10;
                  const maxPrice = oHigh + margin;
                  const minPrice = oLow - margin;
                  
                  // SVG Coordinates conversion mapping
                  const scaleY = (val: number) => {
                    const pixelsY = 220; // total chart height boundary representation
                    const ratio = (val - minPrice) / (maxPrice - minPrice);
                    return parseFloat((pixelsY * (1 - ratio) + 12).toFixed(2));
                  };

                  const cCount = visibleHistory.length;

                  return (
                    <>
                      {/* Grid price reference marks */}
                      {[0.25, 0.5, 0.75].map((ratio) => {
                        const markerPrice = minPrice + (maxPrice - minPrice) * ratio;
                        const yPos = scaleY(markerPrice);
                        return (
                          <g key={ratio} className="opacity-20 font-mono text-[9px]">
                            <line x1="0%" y1={yPos} x2="100%" y2={yPos} stroke="#8c909f" strokeDasharray="3,3" />
                            <text x="94%" y={yPos - 4} fill="#dae2fd">${markerPrice.toFixed(2)}</text>
                          </g>
                        );
                      })}

                      {/* Bollinger Bands Shaded Area & Lines */}
                      {showBB && bbData.upper.length === cCount && (
                        <>
                          <path
                            fill="#3b82f6"
                            fillOpacity="0.05"
                            className="pointer-events-none animate-fadeIn"
                            d={
                              visibleHistory.map((c, i) => `${i === 0 ? 'M' : 'L'} ${(i / (cCount - 1)) * 96 + 2}% ${scaleY(bbData.upper[i])}`).join(' ') +
                              ' ' +
                              visibleHistory.slice().reverse().map((c, i) => `L ${( (cCount - 1 - i) / (cCount - 1) ) * 96 + 2}% ${scaleY(bbData.lower[cCount - 1 - i])}`).join(' ') +
                              ' Z'
                            }
                          />
                          <path
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                            className="opacity-50 pointer-events-none animate-fadeIn"
                            d={visibleHistory.map((c, i) => `${i === 0 ? 'M' : 'L'} ${(i / (cCount - 1)) * 96 + 2}% ${scaleY(bbData.upper[i])}`).join(' ')}
                          />
                          <path
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                            className="opacity-50 pointer-events-none animate-fadeIn"
                            d={visibleHistory.map((c, i) => `${i === 0 ? 'M' : 'L'} ${(i / (cCount - 1)) * 96 + 2}% ${scaleY(bbData.lower[i])}`).join(' ')}
                          />
                        </>
                      )}

                      {/* EMA line */}
                      {showEMA && emaData.length === cCount && (
                        <path
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          className="pointer-events-none animate-fadeIn"
                          d={visibleHistory.map((c, i) => `${i === 0 ? 'M' : 'L'} ${(i / (cCount - 1)) * 96 + 2}% ${scaleY(emaData[i])}`).join(' ')}
                        />
                      )}

                      {/* Connective Area Area path */}
                      <path
                        className="fill-primary/5 pointer-events-none"
                        d={
                          visibleHistory.map((c, i) => `${i === 0 ? 'M' : 'L'} ${(i / (cCount - 1)) * 96 + 2}% ${scaleY(c.close)}`).join(' ') + 
                          ` L 98% 280 L 2% 280 Z`
                        }
                      />

                      {/* Spark line overlay graph path */}
                      <path
                        fill="none"
                        stroke="#adc6ff"
                        strokeWidth="1.5"
                        className="opacity-40 pointer-events-none"
                        d={visibleHistory.map((c, i) => `${i === 0 ? 'M' : 'L'} ${(i / (cCount - 1)) * 96 + 2}% ${scaleY(c.close)}`).join(' ')}
                      />

                      {/* Active Position Bracket Level Lines (TP/SL) */}
                      {positions.filter(p => p.symbol.split('.')[0] === activeTicker.symbol).map((pos) => {
                        return (
                          <React.Fragment key={pos.id}>
                            {pos.takeProfit && pos.takeProfit >= minPrice && pos.takeProfit <= maxPrice && (
                              <g className="opacity-80">
                                <line x1="0%" y1={scaleY(pos.takeProfit)} x2="100%" y2={scaleY(pos.takeProfit)} stroke="#10b981" strokeDasharray="4,4" strokeWidth="1.2" />
                                <text x="10" y={scaleY(pos.takeProfit) - 4} fill="#10b981" className="font-sans font-bold text-[8px]">TP LEVEL: ${pos.takeProfit}</text>
                              </g>
                            )}
                            {pos.stopLoss && pos.stopLoss >= minPrice && pos.stopLoss <= maxPrice && (
                              <g className="opacity-80">
                                <line x1="0%" y1={scaleY(pos.stopLoss)} x2="100%" y2={scaleY(pos.stopLoss)} stroke="#ef4444" strokeDasharray="4,4" strokeWidth="1.2" />
                                <text x="10" y={scaleY(pos.stopLoss) - 4} fill="#ef4444" className="font-sans font-bold text-[8px]">SL LEVEL: ${pos.stopLoss}</text>
                              </g>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {/* Interactive crosshair projection vertical guide */}
                      {crosshairX !== null && (
                        <line
                          x1={crosshairX}
                          y1="0"
                          x2={crosshairX}
                          y2="280"
                          stroke="#adc6ff"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                          className="opacity-70 pointer-events-none"
                        />
                      )}

                      {/* Loop render candlesticks */}
                      {visibleHistory.map((c, i) => {
                        const xPercent = (i / (cCount - 1)) * 96 + 2; // offset padding
                        const yOpen = scaleY(c.open);
                        const yClose = scaleY(c.close);
                        const yHigh = scaleY(c.high);
                        const yLow = scaleY(c.low);

                        const isBullish = c.close >= c.open;
                        const fillColor = isBullish ? '#adc6ff' : '#FB923C'; // Sky Blue buy vs Orange Sell

                        return (
                          <g key={i} className="cursor-crosshair">
                            {/* Wick */}
                            <line
                              x1={`${xPercent}%`}
                              y1={yHigh}
                              x2={`${xPercent}%`}
                              y2={yLow}
                              stroke={fillColor}
                              strokeWidth="1.5"
                            />
                            {/* Real Body */}
                            <rect
                              x={`calc(${xPercent}% - 4px)`}
                              className="transition-all hover:scale-y-110"
                              y={Math.min(yOpen, yClose)}
                              width="8"
                              height={Math.max(Math.abs(yOpen - yClose), 2)}
                              fill={fillColor}
                              rx="1"
                            />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}

            {/* Simulated volume bars at the absolute bottom */}
            <div className="absolute bottom-0 left-0 w-full h-12 flex items-end gap-[4px] px-4 opacity-25">
              {visibleHistory.map((c, i) => (
                <div
                  key={i}
                  style={{ height: `${(c.volume / 600000) * 100}%` }}
                  className={`flex-1 rounded-sm ${c.close >= c.open ? 'bg-primary' : 'bg-[#FB923C]'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Panel: Position Trackers */}
        <div className="h-1/3 bg-surface-container border border-outline-variant flex flex-col rounded-md overflow-hidden min-h-[160px]">
          <div className="p-2 border-b border-outline-variant bg-surface-container-high flex gap-4">
            <button
              onClick={() => setActiveLedgerTab('positions')}
              className={`pb-1 text-xs font-bold leading-none select-none cursor-pointer border-b-2 hover:text-on-surface transition-all ${
                activeLedgerTab === 'positions' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent'
              }`}
            >
              Open Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveLedgerTab('history')}
              className={`pb-1 text-xs font-bold leading-none select-none cursor-pointer border-b-2 hover:text-on-surface transition-all ${
                activeLedgerTab === 'history' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent'
              }`}
            >
              Order & Execute Stream
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {activeLedgerTab === 'positions' ? (
              <table className="w-full text-left border-collapse select-none">
                <thead className="sticky top-0 bg-surface-container-low/95 text-[9px] font-bold text-outline uppercase">
                  <tr className="border-b border-outline-variant/30">
                    <th className="p-2">INSTRUMENT</th>
                    <th className="p-2">SIDE</th>
                    <th className="p-2 text-right">SIZE</th>
                    <th className="p-2 text-right">ENTRY</th>
                    <th className="p-2 text-right">MARK</th>
                    <th className="p-2 text-right">PNL (UNREALIZED)</th>
                    <th className="p-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[11px] font-medium text-on-surface-variant">
                  {positions.map((pos) => {
                    const isLong = pos.side === 'LONG';
                    const isProfit = pos.pnlAbs >= 0;
                    return (
                      <tr key={pos.id} className="border-b border-outline-variant/30 hover:bg-surface-container-highest transition-colors">
                        <td className="p-2 font-sans font-extrabold text-xs text-on-surface flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isLong ? 'bg-primary' : 'bg-[#FB923C]'}`}></span>
                          {pos.symbol}
                        </td>
                        <td className={`p-2 font-bold ${isLong ? 'text-primary' : 'text-[#FB923C]'}`}>{pos.side}</td>
                        <td className="p-2 text-right font-semibold">{pos.qty.toLocaleString()}</td>
                        <td className="p-2 text-right">
                          <div>${pos.avgPrice.toFixed(2)}</div>
                          {(pos.takeProfit || pos.stopLoss) && (
                            <div className="text-[9px] text-outline">
                              {pos.takeProfit ? `TP:${pos.takeProfit}` : ''} {pos.stopLoss ? `SL:${pos.stopLoss}` : ''}
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-right">${pos.markPrice.toFixed(2)}</td>
                        <td className={`p-2 text-right font-bold ${isProfit ? 'text-primary' : 'text-[#FB923C]'}`}>
                          {isProfit ? '+' : ''}${pos.pnlAbs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => onPositionClosed(pos.id)}
                            className="bg-error-container text-on-error-container hover:brightness-110 active:opacity-80 px-2 py-0.5 font-sans font-bold text-[9px] rounded-sm cursor-pointer select-none"
                          >
                            CLOSE
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {positions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center font-sans text-xs text-on-surface-variant/40">
                        No active leveraged exposure
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="p-3 space-y-2 font-mono text-[10px] text-on-surface-variant">
                {tradeLogs.slice(0, 8).map((log, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-outline-variant/20 pb-1 hover:text-on-surface transition-colors">
                    <span className="text-primary font-bold">{log.id}</span>
                    <span>{log.executionTime}</span>
                    <span className="font-sans font-extrabold text-xs">{log.instrument}</span>
                    <span className={log.side.includes('BUY') ? 'text-primary' : 'text-[#FB923C]'}>{log.side}</span>
                    <span>Qty: {log.quantity}</span>
                    <span className="font-semibold text-on-surface">${log.avgPrice.toLocaleString()}</span>
                    <span className="px-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[8px] tracking-wide">{log.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Right: Order Book depth & trade execution inputs (3/12 columns) */}
      <section className="col-span-12 lg:col-span-3 flex flex-col gap-2 overflow-hidden height-full select-none">
        {/* Order Book Panel */}
        <div className="h-1/2 bg-surface-container border border-outline-variant flex flex-col rounded-md overflow-hidden min-h-[220px]">
          <div className="p-2 border-b border-outline-variant flex justify-between bg-surface-container-high font-sans">
            <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Order Book</span>
            <span className="text-[9px] leading-tight text-on-surface-variant font-mono uppercase">
              SPREAD: 0.02 (0.002%)
            </span>
          </div>

          <div className="flex-1 flex flex-col font-mono text-[11px] justify-between py-1">
            {/* Ask items list (Renders descending prices) */}
            <div className="flex-1 flex flex-col-reverse justify-end">
              {asks.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 p-1 hover:bg-surface-container-highest relative group transition-colors">
                  <div style={{ width: item.width }} className="absolute right-0 top-0 bottom-0 depth-bar-ask pointer-events-none"></div>
                  <span className="text-[#FB923C] font-semibold relative pl-2">{item.price.toFixed(2)}</span>
                  <span className="text-right relative text-on-surface">{item.qty.toLocaleString()}</span>
                  <span className="text-right relative text-outline pr-2">{item.scale}</span>
                </div>
              ))}
            </div>

            {/* Mid point ticking price display */}
            <div className="py-2 bg-surface-container-highest/50 text-center border-y border-outline-variant flex justify-center items-center gap-2">
              <span className="font-extrabold text-base text-on-surface leading-none font-mono">
                {activeTicker ? activeTicker.price.toFixed(2) : '---'}
              </span>
              <Info className="w-3 h-3 text-[#adc6ff] animate-pulse" />
            </div>

            {/* Bid items list (Renders ascending prices) */}
            <div className="flex-1 flex flex-col justify-start">
              {bids.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 p-1 hover:bg-surface-container-highest relative group transition-colors">
                  <div style={{ width: item.width }} className="absolute right-0 top-0 bottom-0 depth-bar-bid pointer-events-none"></div>
                  <span className="text-primary font-semibold relative pl-2">{item.price.toFixed(2)}</span>
                  <span className="text-right relative text-on-surface">{item.qty.toLocaleString()}</span>
                  <span className="text-right relative text-outline pr-2">{item.scale}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade execution input desk */}
        <div className="flex-1 bg-surface-container border border-outline-variant flex flex-col p-3 gap-3 rounded-md min-h-[300px]">
          {/* LIMIT / MARKET / STOP Order toggles */}
          <div className="flex gap-1 bg-surface-container-low p-1 rounded border border-outline-variant/30">
            {(['LIMIT', 'MARKET', 'STOP'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-1 font-sans font-bold text-[10px] rounded-sm tracking-wider cursor-pointer transition-all ${
                  orderType === type
                    ? 'bg-primary-container text-on-primary-container font-extrabold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Price Limit Input */}
            <div>
              <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                PRICE (USD)
              </label>
              <input
                type="text"
                value={execPriceInput}
                onChange={(e) => setExecPriceInput(e.target.value)}
                disabled={orderType === 'MARKET'}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 font-mono text-xs text-on-surface outline-none focus:border-primary disabled:opacity-50"
              />
            </div>

            {/* Size Units quantity Input */}
            <div>
              <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                SIZE (UNITS)
              </label>
              <input
                type="text"
                placeholder="0.00"
                value={execSizeInput}
                onChange={(e) => setExecSizeInput(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 font-mono text-xs text-on-surface outline-none focus:border-primary"
              />
            </div>

            {/* Bracket TP/SL Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  TAKE PROFIT (TP)
                </label>
                <input
                  type="text"
                  placeholder="None"
                  value={takeProfitInput}
                  onChange={(e) => setTakeProfitInput(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 font-mono text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  STOP LOSS (SL)
                </label>
                <input
                  type="text"
                  placeholder="None"
                  value={stopLossInput}
                  onChange={(e) => setStopLossInput(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 font-mono text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Balance status pill */}
            <div className="flex justify-between items-center text-[10px] text-outline px-1">
              <span>Available: 42,104.22 USD</span>
              <button
                type="button"
                onClick={handleSetMaxSize}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Flash Alert HUD Feedbacks */}
          {execMessage && (
            <div className="p-2 bg-primary/10 border border-primary/20 rounded flex items-start gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-primary shrink-0 self-start" />
              <p className="font-mono text-[9px] leading-tight text-on-surface">{execMessage}</p>
            </div>
          )}

          {/* Exec Buy/Sell split Grid */}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button
              onClick={() => handleExecuteTrade('BUY')}
              className="bg-primary hover:brightness-110 active:scale-95 text-on-primary py-2.5 font-sans font-bold rounded shadow-sm flex flex-col items-center transition-all cursor-pointer"
            >
              <span className="text-xs font-extrabold tracking-wider">BUY / LONG</span>
              <span className="text-[9px] font-mono opacity-80 mt-0.5">
                ${activeTicker ? (activeTicker.price + 0.01).toFixed(2) : '---'}
              </span>
            </button>
            <button
              onClick={() => handleExecuteTrade('SELL')}
              className="bg-[#FB923C] hover:brightness-110 active:scale-95 text-on-error py-2.5 font-sans font-bold rounded shadow-sm flex flex-col items-center transition-all cursor-pointer"
            >
              <span className="text-xs font-extrabold tracking-wider">SELL / SHORT</span>
              <span className="text-[9px] font-mono opacity-80 mt-0.5">
                ${activeTicker ? (activeTicker.price - 0.01).toFixed(2) : '---'}
              </span>
            </button>
          </div>

          {/* Post only session flags */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="post-only-box"
              checked={postOnly}
              onChange={(e) => setPostOnly(e.target.checked)}
              className="rounded bg-surface-variant border-none text-primary focus:ring-0 w-3.5 h-3.5"
            />
            <label htmlFor="post-only-box" className="text-xs text-on-surface-variant cursor-pointer select-none">
              Post Only Options
            </label>
            <HelpCircle className="ml-auto w-3.5 h-3.5 text-outline hover:text-on-surface cursor-help" />
          </div>
        </div>
      </section>
    </div>
  );
}
