import React from 'react';
import { Position } from '../types';
import { ArrowUpRight, ArrowDownRight, Share2, Printer, Compass, ShieldCheck, AlertCircle, Shield } from 'lucide-react';

interface PortfolioViewProps {
  positions: Position[];
  portfolioValue: number;
}

export default function PortfolioView({ positions, portfolioValue }: PortfolioViewProps) {
  // Let's compute some aggregate statistics dynamically from active positions
  const totalPnLAbs = positions.reduce((acc, pos) => acc + pos.pnlAbs, 0);
  const totalPnLPercent = (totalPnLAbs / (portfolioValue - totalPnLAbs || 1)) * 100;
  const isPnLPositive = totalPnLAbs >= 0;

  // Let's handle an area SVG grid mapping for the graph
  const chartPoints = [
    { x: 0, y: 150 },
    { x: 100, y: 135 },
    { x: 200, y: 105 },
    { x: 300, y: 125 },
    { x: 400, y: 95 },
    { x: 500, y: 110 },
    { x: 600, y: 55 },
    { x: 700, y: 40 },
    { x: 800, y: 35 },
  ];

  // Interactive state for performance chart
  const [hoveredPointIdx, setHoveredPointIdx] = React.useState<number | null>(null);

  // Dynamic sector allocations
  const sectorAllocations = React.useMemo(() => {
    if (positions.length === 0) {
      return [
        { label: 'TECH', value: 42, color: '#adc6ff' },
        { label: 'FINANCE', value: 25, color: '#3b82f6' },
        { label: 'CASH', value: 15, color: '#8c909f' },
        { label: 'OTHER', value: 18, color: '#10b981' },
      ];
    }
    const techSum = positions.filter(p => p.symbol.includes('NVDA') || p.symbol.includes('AAPL') || p.symbol.includes('TSLA')).reduce((acc, p) => acc + p.qty * p.markPrice, 0);
    const financeSum = positions.filter(p => !p.symbol.includes('NVDA') && !p.symbol.includes('AAPL') && !p.symbol.includes('TSLA')).reduce((acc, p) => acc + p.qty * p.markPrice, 0);
    const cashSum = portfolioValue * 0.12;
    const totalAssetVal = techSum + financeSum + cashSum;

    const techPct = Math.round((techSum / totalAssetVal) * 100) || 40;
    const finPct = Math.round((financeSum / totalAssetVal) * 100) || 15;
    const cashPct = Math.round((cashSum / totalAssetVal) * 100) || 12;
    const otherPct = Math.max(5, 100 - techPct - finPct - cashPct);

    return [
      { label: 'TECH', value: techPct, color: '#adc6ff' },
      { label: 'FINANCE', value: finPct, color: '#3b82f6' },
      { label: 'CASH', value: cashPct, color: '#8c909f' },
      { label: 'OTHER', value: otherPct, color: '#10b981' },
    ];
  }, [positions, portfolioValue]);

  // Donut chart calculations (circumference = 2 * pi * r = 2 * 3.14159 * 50 = 314.16)
  const donutSlices = React.useMemo(() => {
    let accumulatedPercent = 0;
    return sectorAllocations.map((sector) => {
      const strokeLength = (sector.value / 100) * 314.16;
      const strokeOffset = 314.16 - strokeLength + (accumulatedPercent / 100) * 314.16;
      accumulatedPercent += sector.value;
      return {
        ...sector,
        strokeOffset
      };
    });
  }, [sectorAllocations]);

  const handlePerformanceMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const idx = Math.min(chartPoints.length - 1, Math.max(0, Math.round((x / width) * (chartPoints.length - 1))));
    setHoveredPointIdx(idx);
  };

  const handlePerformanceMouseLeave = () => {
    setHoveredPointIdx(null);
  };

  const activePointIdx = hoveredPointIdx !== null ? hoveredPointIdx : chartPoints.length - 1;
  const activePoint = chartPoints[activePointIdx];
  const activeVal = portfolioValue * (1 - (100 - activePoint.y) * 0.0003);

  return (
    <div className="pt-12 p-3 space-y-4 h-[calc(100vh-3rem)] overflow-y-auto relative">
      {/* Background Decorative Matrix Grid */}
      <div className="grid-mesh absolute inset-0 pointer-events-none"></div>

      {/* Portfolio Header details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 relative z-10 mb-2">
        <div>
          <p className="font-sans text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
            Institutional Portfolio Manager
          </p>
          <h2 className="font-sans text-3xl font-extrabold text-on-surface tracking-tight font-sans">
            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className={`font-mono text-xs font-bold flex items-center ${isPnLPositive ? 'text-primary' : 'text-[#FB923C]'}`}>
              {isPnLPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {isPnLPositive ? '+' : ''}{totalPnLPercent.toFixed(2)}% (+${totalPnLAbs.toLocaleString(undefined, { maximumFractionDigits: 0 })})
            </span>
            <span className="text-on-surface-variant/60 text-[10px] uppercase font-mono tracking-wider">
              Real-time calculations • UTC 14:22:04
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('PDF Export sequence finalized. Report download initiated.')}
            className="px-3 py-1.5 border border-outline text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container-highest transition-all rounded cursor-pointer"
          >
            Export Report
          </button>
          <button
            onClick={() => alert('Quick Trade terminal trigger initialized.')}
            className="px-3 py-1.5 bg-primary-container text-on-primary-container text-[10px] font-sans font-bold uppercase tracking-wider rounded select-none hover:brightness-110 active:opacity-90 cursor-pointer"
          >
            Quick Trade
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-2 relative z-10">
        {/* Large smooth area path SVG line chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant rounded p-4 h-64 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Equity Performance Index (30D)
              </h3>
              <p className="text-[11px] font-mono text-primary font-bold mt-0.5">
                Valuation: ${activeVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-1 bg-surface-container rounded p-0.5 border border-outline-variant/30 font-mono text-[9px] font-bold">
              <span className="px-2 py-0.5 rounded text-on-surface-variant cursor-pointer hover:text-on-surface">1D</span>
              <span className="px-2 py-0.5 rounded text-on-surface-variant cursor-pointer hover:text-on-surface">1W</span>
              <span className="px-2.5 py-0.5 bg-primary rounded text-on-primary cursor-pointer font-extrabold shadow">1M</span>
              <span className="px-2 py-0.5 rounded text-on-surface-variant cursor-pointer hover:text-on-surface">1Y</span>
            </div>
          </div>

          {/* Render Area graph overlay with custom tooltip dot */}
          <div className="flex-1 relative">
            <svg
              className="w-full h-full text-primary cursor-crosshair"
              viewBox="0 0 800 160"
              preserveAspectRatio="none"
              onMouseMove={handlePerformanceMouseMove}
              onMouseLeave={handlePerformanceMouseLeave}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#adc6ff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#adc6ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide markings */}
              <line x1="0" y1="40" x2="800" y2="40" stroke="#424754" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="0" y1="100" x2="800" y2="100" stroke="#424754" strokeWidth="0.5" strokeDasharray="5,5" />

              {/* Dynamic crosshair line */}
              {hoveredPointIdx !== null && (
                <line
                  x1={activePoint.x}
                  y1="0"
                  x2={activePoint.x}
                  y2="160"
                  stroke="#adc6ff"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}

              {/* Polygons */}
              <path
                d="M 0,140 Q 100,125 200,95 T 400,115 T 600,55 T 800,35 L 800,160 L 0,160 Z"
                fill="url(#areaGrad)"
              />
              <path
                d="M 0,140 Q 100,125 200,95 T 400,115 T 600,55 T 800,35"
                fill="none"
                stroke="#adc6ff"
                strokeWidth="2.5"
              />

              {/* Highlight dot peak indicator */}
              <circle cx={activePoint.x} cy={activePoint.y} r="6" fill="#adc6ff" className="transition-all duration-200" />
              <circle cx={activePoint.x} cy={activePoint.y} r="3" fill="#002e6a" />
              
              {/* Point hover floating badge */}
              <rect x={activePoint.x > 700 ? activePoint.x - 80 : activePoint.x + 10} y={activePoint.y - 10} width="75" height="22" rx="3" fill="#171f33" stroke="#adc6ff" strokeWidth="1" />
              <text x={activePoint.x > 700 ? activePoint.x - 72 : activePoint.x + 18} y={activePoint.y + 4} fontFamily="monospace" fontSize="9" fill="#dae2fd" fontWeight="bold">
                ${(activeVal / 1e6).toFixed(2)}M
              </text>
            </svg>
          </div>
        </div>

        {/* Small exposures allocations heatmap block */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low border border-outline-variant rounded p-4 h-64 flex flex-col items-center justify-between">
          <h3 className="w-full font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-left mb-1">
            Sector Exposure Matrix
          </h3>
          
          <div className="flex-1 w-full flex items-center justify-center gap-4">
            {/* SVG Donut Chart */}
            <svg width="110" height="110" viewBox="0 0 120 120" className="shrink-0">
              {donutSlices.map((slice, idx) => (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="12"
                  strokeDasharray="314.16"
                  strokeDashoffset={slice.strokeOffset}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-300 hover:stroke-[15px] cursor-pointer"
                />
              ))}
              <circle cx="60" cy="60" r="38" fill="#171f33" />
              <text x="60" y="63" textAnchor="middle" fill="#dae2fd" className="font-mono text-[9px] font-bold">
                ALLOCATION
              </text>
            </svg>

            {/* Color Legend list */}
            <div className="flex flex-col gap-1.5 justify-center flex-1">
              {donutSlices.map((slice, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                  <span className="text-on-surface-variant font-bold text-[9px]">{slice.label}</span>
                  <span className="text-primary ml-auto font-bold">{slice.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Position Ledger Table */}
      <div className="bg-surface-container-low border border-outline-variant rounded overflow-hidden relative z-10">
        <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-high/50 select-none">
          <h3 className="font-sans text-[10px] font-bold text-on-surface uppercase tracking-wider">
            Active Strategic Positions allocation
          </h3>
          <div className="flex gap-4 font-mono text-[10px] text-on-surface-variant">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-1.5"></span> Longs: 14
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#FB923C] mr-1.5"></span> Shorts: 3
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/30 text-[9px] font-bold text-outline">
                <th className="px-4 py-2 uppercase">Asset Name</th>
                <th className="px-4 py-2 uppercase">Symbol</th>
                <th className="px-4 py-2 uppercase text-right">Exposure</th>
                <th className="px-4 py-2 uppercase text-right">Qty</th>
                <th className="px-4 py-2 uppercase text-right">Avg Price</th>
                <th className="px-4 py-2 uppercase text-right">Market Price</th>
                <th className="px-4 py-2 uppercase text-right">P&L (%)</th>
                <th className="px-4 py-2 uppercase text-right">P&L (Abs)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px] font-medium text-on-surface-variant divide-y divide-outline-variant/20">
              {positions.map((pos) => {
                const isProfit = pos.pnlAbs >= 0;
                return (
                  <tr key={pos.id} className="hover:bg-surface-container-highest/30 transition-colors">
                    <td className="px-4 py-2.5 font-sans font-bold text-xs text-on-surface">{pos.assetName}</td>
                    <td className="px-4 py-2.5 text-primary font-bold">{pos.symbol}</td>
                    <td className="px-4 py-2.5 text-right">{pos.exposure}%</td>
                    <td className="px-4 py-2.5 text-right">{pos.qty.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">${pos.avgPrice.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right">${pos.markPrice.toFixed(2)}</td>
                    <td className={`px-4 py-2.5 text-right font-bold ${isProfit ? 'text-primary' : 'text-[#FB923C]'}`}>
                      {isProfit ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold ${isProfit ? 'text-primary' : 'text-[#FB923C]'}`}>
                      {isProfit ? '+' : ''}${pos.pnlAbs.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bento Sub-Modules layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 relative z-10 select-none pb-8">
        <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col justify-between h-32">
          <div>
            <h3 className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Portfolio Beta
            </h3>
            <p className="font-mono text-xl font-bold text-on-surface">
              1.14 <span className="text-xs text-on-surface-variant font-sans font-semibold">S&P 500 Index</span>
            </p>
          </div>
          <div className="pt-2 border-t border-outline-variant/30">
            <p className="text-[8px] text-outline mb-1 uppercase font-semibold">STRESS TEST: GLOBAL RECESSION</p>
            <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-[#FB923C] w-3/4"></div>
            </div>
            <p className="text-[8px] mt-1 text-[#FB923C] font-semibold">-12.4% Projected Drawdown</p>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col justify-between h-32">
          <div>
            <h3 className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Margin Utilization
            </h3>
            <p className="font-mono text-xl font-bold text-on-surface">22.8%</p>
          </div>
          <div className="pt-2 border-t border-outline-variant/30 flex justify-between">
            <div>
              <p className="text-[8px] text-outline uppercase font-semibold">FREE MARGIN</p>
              <p className="font-mono text-[10px] text-primary font-bold">$4.8M</p>
            </div>
            <div>
              <p className="text-[8px] text-outline uppercase font-semibold">MAINTENANCE</p>
              <p className="font-mono text-[10px] text-[#ffb95f] font-bold">$1.2M</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
            <Shield className="w-24 h-24 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Compliance & Security Status
            </h3>
            <div className="flex items-center text-primary gap-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-bold text-xs uppercase tracking-wider">OPTIMIZED</span>
            </div>
          </div>
          <div className="pt-2 border-t border-outline-variant/30">
            <p className="text-[8px] text-outline uppercase font-semibold">VIX IV CONTEXT: 14.82</p>
            <p className="text-[9px] leading-tight text-on-surface-variant/80 italic mt-0.5">
              Hedging active via Put Spread on ES Jun 24.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
