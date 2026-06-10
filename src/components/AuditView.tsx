import React, { useState } from 'react';
import { TradeLog } from '../types';
import { initialTradeLogs } from '../data/mockData';
import { Download, FileText, Calendar, Search, Filter, HelpCircle, CheckSquare, Flag, ArrowRight } from 'lucide-react';

export default function AuditView() {
  const [logs, setLogs] = useState<TradeLog[]>(initialTradeLogs);
  const [selectedLogId, setSelectedLogId] = useState<string>('TX-0921-XW');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FILLED' | 'CANCELLED'>('ALL');
  const [assetFilter, setAssetFilter] = useState<string>('All Assets');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Find active log representation
  const activeLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  // Perform client side search filtering
  const filteredLogs = logs.filter((log) => {
    // Status
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    
    // Asset class (crypto vs equities)
    if (assetFilter === 'Spot Crypto' && !log.instrument.includes('BTC') && !log.instrument.includes('ETH')) return false;
    if (assetFilter === 'Equities' && !log.instrument.includes('US') && !log.instrument.includes('USD')) return false;

    // Search order string
    if (searchTerm && !log.id.toLowerCase().includes(searchTerm.toLowerCase()) && !log.instrument.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleDownloadLogFile = () => {
    if (!activeLog) return;
    const logOutput = `
=== QUANTVAULT AUDIT GATEWAY SECURE INTEGRITY RECORD ===
ORDER_ID: ${activeLog.id}
TIMESTAMP: ${activeLog.executionTime}
INSTRUMENT: ${activeLog.instrument}
EXEC_SIDE: ${activeLog.side}
AVG_PRICE: $${activeLog.avgPrice.toLocaleString()}
FILLED_QTY: ${activeLog.quantity}
NOTIONAL_VAL: $${activeLog.notionalValue.toLocaleString()} USD
TOTAL_FEES_BPS: ${activeLog.feeBps}
VENUE: ${activeLog.venue}
STRATEGY_TAG: ${activeLog.strategy}
CLIENT_UNIT_TAG: ${activeLog.clientTag}
LATENCY_INDEX: ${activeLog.latency}
STATUS: ${activeLog.status}

=== CHRONOLOGICAL TELEMETRY TIMELINE ===
${activeLog.steps.map((step, i) => `[STEP ${i + 1}] ${step.time} -> ${step.label}`).join('\n')}

RECORD STATUS: SIGNED_AND_VERIFIED_SECURE
    `;

    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(logOutput);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `QUANTVAULT_AUDIT_${activeLog.id}.log`);
    dlAnchorElem.click();
  };

  return (
    <div className="pt-12 p-3 flex flex-col h-[calc(100vh-3rem)] overflow-hidden bg-surface-dim select-none">
      
      {/* Page Header */}
      <div className="flex justify-between items-center my-2">
        <div>
          <h2 className="font-sans text-xl font-bold text-on-surface">Trade Audit & History</h2>
          <p className="text-on-surface-variant text-xs">
            Comprehensive ledger of compliance execution, clearing, and clearing settled nodes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('CSV Log database backup downloaded completely.')}
            className="bg-surface-container-high border border-outline-variant px-3 py-1 flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors rounded text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT CSV
          </button>
          <button
            onClick={() => alert('Institutional audit digest PDF generated successfully.')}
            className="bg-surface-container-high border border-outline-variant px-3 py-1 flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors rounded text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            AUDIT REPORT
          </button>
        </div>
      </div>

      {/* Advanced filters card bar */}
      <div className="bg-surface-container border border-outline-variant p-3 flex flex-wrap gap-4 items-end rounded-md mb-2">
        <div className="flex flex-col gap-1">
          <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Date Range Filter
          </label>
          <div className="flex bg-surface-container-low border border-outline-variant px-2 py-1 rounded">
            <Calendar className="w-3.5 h-3.5 text-on-surface-variant mr-2 self-center" />
            <input
              type="text"
              readOnly
              className="bg-transparent border-none p-0 focus:ring-0 text-xs w-40 outline-none select-none text-on-surface font-mono"
              value="2023-10-01 - 2023-10-31"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Asset Class
          </label>
          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded px-2 py-1 select-none text-xs text-on-surface focus:ring-1 focus:ring-primary h-7 outline-none"
          >
            <option>All Assets</option>
            <option>Spot Crypto</option>
            <option>Equities</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Status Options
          </label>
          <div className="flex gap-1 h-7">
            {(['ALL', 'FILLED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2 py-1 border text-[9px] font-bold rounded tracking-wider cursor-pointer select-none transition-all uppercase ${
                  statusFilter === status
                    ? 'bg-primary border-primary text-on-primary font-extrabold'
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex flex-col gap-1">
          <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Search Order ID
          </label>
          <div className="flex bg-surface-container-low border border-outline-variant px-2 py-1 rounded h-7">
            <Search className="w-3.5 h-3.5 text-on-surface-variant mr-2 self-center" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-xs w-36 outline-none text-on-surface font-mono"
              placeholder="e.g. TX-482..."
            />
          </div>
        </div>
      </div>

      {/* Main layout contents: Left Table vs Right Inspector drawer */}
      <div className="flex gap-2 flex-1 overflow-hidden">
        
        {/* Scrollable table ledger (col-span-12 or flex-1) */}
        <div className="flex-1 bg-surface-container border border-outline-variant overflow-auto relative rounded-md">
          <table className="w-full text-left border-collapse select-none min-w-[1000px]">
            <thead className="sticky top-0 bg-surface-container-high/95 backdrop-blur-md z-35 shadow-sm text-[9px] font-bold text-outline">
              <tr className="border-b border-outline-variant">
                <th className="p-3 uppercase">Order ID</th>
                <th className="p-3 uppercase">Execution Time</th>
                <th className="p-3 uppercase">Instrument</th>
                <th className="p-3 uppercase">Side</th>
                <th className="p-3 uppercase text-right">Avg Price</th>
                <th className="p-3 uppercase text-right">Quantity</th>
                <th className="p-3 uppercase text-right">Notional Value</th>
                <th className="p-3 uppercase text-right">Fee (BPS)</th>
                <th className="p-3 uppercase">Status</th>
                <th className="p-3 uppercase">Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-mono text-[11px] font-medium text-on-surface-variant">
              {filteredLogs.map((log) => {
                const isSelected = log.id === selectedLogId;
                const isBuy = log.side.includes('BUY');
                const isCancelled = log.status === 'CANCELLED';

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`hover:bg-surface-container-highest transition-colors cursor-pointer ${
                      isSelected ? 'bg-surface-container-low border-l-2 border-primary' : ''
                    }`}
                  >
                    <td className="p-3 text-primary font-bold">{log.id}</td>
                    <td className="p-3 text-on-surface-variant/80">{log.executionTime}</td>
                    <td className="p-3 font-sans font-extrabold text-on-surface">{log.instrument}</td>
                    <td className={`p-3 font-bold ${isBuy ? 'text-primary' : 'text-[#FB923C]'}`}>{log.side}</td>
                    <td className="p-3 text-right">${log.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right">{log.quantity.toFixed(4)}</td>
                    <td className="p-3 text-right">${log.notionalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</td>
                    <td className="p-3 text-right">{log.feeBps}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold border ${
                        isCancelled 
                          ? 'bg-error/10 text-error border-error/20' 
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 font-sans font-semibold text-[10px]">{log.venue}</td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center font-sans text-xs text-on-surface-variant/40">
                    No matching systemic transaction audit logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Pane: Drawer trade details inspector */}
        {activeLog && (
          <aside className="w-80 bg-surface-container-low border border-outline-variant flex flex-col rounded-md overflow-hidden relative">
            <div className="p-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h3 className="font-sans text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Audit Inspector
              </h3>
              <CheckSquare className="w-4 h-4 text-primary animate-pulse" />
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {/* Profile summary card */}
              <div className="bg-surface-container p-3 border border-outline-variant rounded relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                  <CheckSquare className="w-16 h-16 stroke-[1.5]" />
                </div>
                <div className="relative z-10">
                  <p className="font-sans text-[8px] font-bold text-outline uppercase tracking-wider mb-1">
                    Selected Secure Order
                  </p>
                  <h4 className="font-mono text-base font-extrabold text-primary">{activeLog.id}</h4>
                  <div className="flex items-center gap-1.5 mt-2 bg-primary/10 border border-primary/20 p-1.5 rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] text-on-surface font-mono font-bold leading-none truncate">
                      Settled on wallet chain (0x82...e1)
                    </span>
                  </div>
                </div>
              </div>

              {/* Data checklist grid */}
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <span className="block text-[8px] text-outline font-sans font-bold uppercase tracking-wider mb-0.5">STRATEGY</span>
                  <p className="font-sans font-bold text-on-surface">{activeLog.strategy}</p>
                </div>
                <div>
                  <span className="block text-[8px] text-outline font-sans font-bold uppercase tracking-wider mb-0.5 font-semibold">UNIT CLASSIFIER</span>
                  <p className="font-sans font-bold text-on-surface">{activeLog.clientTag}</p>
                </div>
                <div>
                  <span className="block text-[8px] text-outline font-sans font-bold uppercase tracking-wider mb-0.5">TYPE</span>
                  <p className="font-sans font-bold text-on-surface">{activeLog.orderType}</p>
                </div>
                <div>
                  <span className="block text-[8px] text-outline font-sans font-bold uppercase tracking-wider mb-0.5">LATENCY</span>
                  <p className="font-mono font-bold text-primary">{activeLog.latency}</p>
                </div>
              </div>

              {/* Step checklist timelines */}
              <div className="space-y-3 pt-2">
                <span className="block text-[8px] text-outline font-sans font-bold uppercase tracking-wider">
                  System Chronological execution steps
                </span>
                
                <div className="space-y-3 relative pl-4 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-outline-variant">
                  {activeLog.steps.map((step, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[15px] top-1 w-2.5 h-2.5 rounded-full bg-primary-container border-2 border-surface-container-low flex items-center justify-center"></span>
                      <p className="font-sans font-bold text-xs text-on-surface leading-none">{step.label}</p>
                      <p className="font-mono text-[9px] text-outline mt-0.5">{step.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spark mini chart visualization */}
              <div className="pt-2">
                <span className="block text-[8px] text-outline font-sans font-bold uppercase tracking-wider mb-2">
                  System fill latency curves
                </span>
                <div className="h-16 bg-surface-container border border-outline-variant rounded relative flex items-end p-2 gap-1 overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle, #8c909f 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }}></div>
                  <div className="w-full bg-primary/10 h-[30%] rounded-sm"></div>
                  <div className="w-full bg-primary/20 h-[50%] rounded-sm"></div>
                  <div className="w-full bg-primary/45 h-[80%] rounded-sm relative flex justify-center">
                    <span className="absolute -top-4 font-mono text-[8px] text-primary font-bold">FILL</span>
                  </div>
                  <div className="w-full bg-primary/30 h-[40%] rounded-sm"></div>
                  <div className="w-full bg-primary/10 h-[20%] rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Bottom actions panel */}
            <div className="p-3 bg-surface-container border-t border-outline-variant flex gap-2">
              <button
                onClick={handleDownloadLogFile}
                className="flex-1 bg-primary text-on-primary py-2 rounded font-sans font-bold text-[10px] uppercase tracking-wider hover:brightness-110 cursor-pointer text-center"
              >
                DOWNLOAD LOG
              </button>
              <button
                onClick={() => alert(`Log sequence record ${activeLog.id} marked with secure audit flag.`)}
                className="p-2 border border-outline-variant rounded hover:bg-surface-container-highest cursor-pointer flex justify-center items-center text-on-surface-variant hover:text-primary transition-colors"
                title="Flag secure Audit"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
