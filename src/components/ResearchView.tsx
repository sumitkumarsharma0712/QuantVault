import React, { useState } from 'react';
import { NewsItem, EconomicEvent, SentimentMatrixItem } from '../types';
import { initialNews, initialEvents, initialSentimentMatrix } from '../data/mockData';
import { RefreshCw, Filter, Calendar, BarChart, Download, AlertTriangle, CheckSquare, Bot, Send, MessageSquare, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ResearchViewProps {
  geminiApiKey?: string;
}

export default function ResearchView({ geminiApiKey }: ResearchViewProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [events] = useState<EconomicEvent[]>(initialEvents);
  const [sentiments] = useState<SentimentMatrixItem[]>(initialSentimentMatrix);
  const [filterTech, setFilterTech] = useState(false);

  // AI Copilot States
  const [activeTab, setActiveTab] = useState<'matrix' | 'copilot'>('matrix');
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotResponse, setCopilotResponse] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Welcome to QuantVault AI Copilot. Ask me for market forecasts, sentiment analysis, or momentum strategy drafts.' }
  ]);

  // Simulated pull to refresh news list
  const handleRefreshNews = () => {
    // slight shuffle
    const shuffled = [...news].reverse();
    setNews(shuffled);
    alert('SECURE GATEWAY: News feed synchronized with live Reuters/Bloomberg terminals.');
  };

  // Ask Copilot Handler
  const handleAskCopilot = async (promptText: string) => {
    if (!promptText.trim()) return;
    setCopilotLoading(true);
    
    // Add user prompt to history
    setChatHistory((prev) => [...prev, { role: 'user', text: promptText }]);
    setCopilotInput('');

    try {
      if (geminiApiKey) {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
        });
        const text = response.text || 'No response returned from Gemini.';
        setChatHistory((prev) => [...prev, { role: 'model', text }]);
      } else {
        // High fidelity simulated response
        setTimeout(() => {
          let reply = '';
          const upper = promptText.toUpperCase();
          if (upper.includes('NVDA') || upper.includes('NVIDIA')) {
            reply = `**QuantVault AI Forecast (NVDA):**\n\nNVIDIA's order book shows strong buy imbalances near $900. Institutional volume flow reports high momentum. Pivot points are clear at $894 (support) and $932 (resistance). Bollinger Bands indicate potential breakout pattern in next 12 hours.`;
          } else if (upper.includes('AAPL') || upper.includes('APPLE')) {
            reply = `**QuantVault AI Forecast (AAPL):**\n\nApple Inc. presents a consolidation profile with support holding at $176.50. High sentiment indexing indicates steady retail/institutional accumulation. Bollinger Bands narrowing points to upcoming volatility compression.`;
          } else if (upper.includes('TSLA') || upper.includes('TESLA')) {
            reply = `**QuantVault AI Forecast (TSLA):**\n\nTesla is facing short-term resistance at $182. Sentiment scores skew slightly bearish (-18%) due to lower production index estimates. Short-term downside targeted at $165 support.`;
          } else if (upper.includes('STRATEGY') || upper.includes('MOMENTUM')) {
            reply = `**QuantVault AI Alpha Strategy:**\n\n- **Trigger**: Bollinger Band breakout with volume exceeding 20-period SMA by 1.5x.\n- **Risk Protocol**: Place Take Profit at 3% from entry, Stop Loss at 1% of entry (Risk-to-Reward ratio 3:1).\n- **Desks**: Quant-Desk-S1, FIPS 140-2 sandbox compliance locked.`;
          } else {
            reply = `**QuantVault AI System:**\n\nGeneral query handled: "${promptText}". Implied equity risk remains within typical corridors. Open brackets are recommended on all high-beta perps. (Enter your Gemini API Key in Settings to enable live LLM intelligence).`;
          }
          setChatHistory((prev) => [...prev, { role: 'model', text: reply }]);
          setCopilotLoading(false);
        }, 1000);
        return;
      }
    } catch (err: any) {
      setChatHistory((prev) => [...prev, { role: 'model', text: `**Error:** ${err?.message || 'Failed to connect to model service'}. Please check settings.` }]);
    }
    setCopilotLoading(false);
  };

  // Export news/calendar system data to JSON payload
  const handleExportData = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      source: 'QuantVault Institutional Research Terminal v4.2.0',
      feed: { news, events, sentiments }
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `QuantVault_Research_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const filteredNews = filterTech ? news.filter(n => n.category === 'TECH') : news;

  return (
    <div className="pt-12 p-3 grid grid-cols-12 gap-2 h-[calc(100vh-3rem)] overflow-hidden bg-surface-dim">
      
      {/* 1. Left Column: Market News Aggregator (col-span-4) */}
      <section className="col-span-12 lg:col-span-4 flex flex-col h-full overflow-hidden border border-outline-variant rounded-md bg-surface-container">
        <div className="px-3 py-2 border-b border-outline-variant flex justify-between items-center bg-surface-container-high select-none">
          <span className="font-sans text-[10px] font-bold text-primary uppercase tracking-wider">
            Market News Aggregator
          </span>
          <div className="flex gap-2">
            <Filter
              onClick={() => setFilterTech(!filterTech)}
              className={`w-3.5 h-3.5 cursor-pointer hover:text-primary ${filterTech ? 'text-primary' : 'text-on-surface-variant'}`}
            />
            <RefreshCw
              onClick={handleRefreshNews}
              className="w-3.5 h-3.5 text-on-surface-variant hover:text-primary cursor-pointer"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 custom-scrollbar select-none">
          {filteredNews.map((item) => {
            const isBearish = item.sentiment === 'BEARISH';
            const isBullish = item.sentiment === 'BULLISH';
            const statusColor = isBearish 
              ? 'text-[#FB923C]' 
              : isBullish 
                ? 'text-primary' 
                : 'text-on-surface-variant';

            return (
              <div key={item.id} className="p-3 hover:bg-surface-container-highest/30 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1 text-[9px]">
                  <span className="font-mono px-1.5 py-0.5 bg-surface-container-high text-primary font-bold rounded">
                    {item.category}
                  </span>
                  <span className="font-mono text-outline">{item.time}</span>
                </div>
                <h3 className="font-sans text-[11px] font-bold text-on-surface leading-snug mb-2 hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
                      <div
                        style={{ width: `${item.score}%` }}
                        className={`absolute left-0 top-0 h-full ${isBearish ? 'bg-[#FB923C]' : 'bg-[#adc6ff]'}`}
                      ></div>
                    </div>
                    <span className={`font-mono text-[9px] font-bold tracking-wider ${statusColor}`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-outline ml-auto">VOL: {item.volume}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Center Column: Asset Correlation Analysis & Sentiment Grid (col-span-5) */}
      <section className="col-span-12 lg:col-span-5 flex flex-col gap-2 h-full overflow-hidden">
        
        {/* Comparative Trend Analysis Bar chart */}
        <div className="bg-surface-container border border-outline-variant rounded-md h-[63%] flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-outline-variant flex justify-between items-center bg-surface-container-high select-none">
            <span className="font-sans text-[10px] font-bold text-primary uppercase tracking-wider">
              Asset Correlation & Trend Analysis
            </span>
            <div className="flex gap-1 font-mono text-[9px] font-bold bg-surface-container rounded p-0.5 border border-outline-variant/30">
              <span className="px-1.5 py-0.5 border border-outline-variant px-2 rounded cursor-pointer hover:bg-surface-variant">1H</span>
              <span className="px-1.5 py-0.5 bg-primary text-on-primary font-extrabold rounded cursor-pointer">1D</span>
              <span className="px-1.5 py-0.5 border border-outline-variant px-2 rounded cursor-pointer hover:bg-surface-variant">1W</span>
            </div>
          </div>

          <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
            {/* Custom Bar layout matching mockup */}
            <div className="flex-1 border border-outline-variant bg-surface-container-lowest rounded p-4 flex items-end justify-around relative overflow-hidden select-none">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="h-full w-full" style={{
                  backgroundImage: 'radial-gradient(circle, #8c909f 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}></div>
              </div>

              {/* Group Bar 1 - NVDA */}
              <div className="flex flex-col items-center w-16 relative z-10">
                <div className="w-8 h-24 bg-primary-container/20 border-t-2 border-primary-container relative rounded-t-sm flex justify-center">
                  <div className="absolute -top-5 font-mono text-[10px] text-primary font-bold">+4.2%</div>
                </div>
                <span className="font-sans text-[10px] font-bold text-on-surface-variant mt-2 uppercase tracking-wider">NVDA</span>
              </div>

              {/* Group Bar 2 - AAPL */}
              <div className="flex flex-col items-center w-16 relative z-10">
                <div className="w-8 h-12 bg-primary/20 border-t-2 border-[#adc6ff] relative rounded-t-sm flex justify-center">
                  <div className="absolute -top-5 font-mono text-[10px] text-[#adc6ff] font-bold">+1.8%</div>
                </div>
                <span className="font-sans text-[10px] font-bold text-on-surface-variant mt-2 uppercase tracking-wider">AAPL</span>
              </div>

              {/* Group Bar 3 - MSFT (Negative downward) */}
              <div className="flex flex-col items-center w-16 relative z-10">
                <div className="w-8 h-8 bg-error/20 border-b-2 border-[#ffb4ab] relative rounded-b-sm flex justify-center transform translate-y-8">
                  <div className="absolute -bottom-5 font-mono text-[10px] text-[#ffb4ab] font-bold">-0.9%</div>
                </div>
                <span className="font-sans text-[10px] font-bold text-on-surface-variant mt-10 uppercase tracking-wider">MSFT</span>
              </div>
            </div>

            {/* Custom status indicator row */}
            <div className="mt-2 h-9 border-t border-outline-variant/30 pt-2 flex items-center justify-between text-[10px] font-mono select-none">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-primary-container rounded-sm"></div>
                  <span className="text-on-surface-variant uppercase font-semibold">CORR: 0.82</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-[#adc6ff] rounded-sm"></div>
                  <span className="text-on-surface-variant uppercase font-semibold">CORR: 0.54</span>
                </div>
              </div>
              <span className="text-outline">SIGMA COEFFICIENT: 2.1</span>
            </div>
          </div>
        </div>

        {/* Sentiment Matrix & AI Copilot Tabbed Panel */}
        <div className="bg-surface-container border border-outline-variant rounded-md flex-1 flex flex-col overflow-hidden min-h-[160px]">
          <div className="px-2 py-1.5 border-b border-outline-variant bg-surface-container-high flex justify-between items-center select-none">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`pb-0.5 text-xs font-bold font-sans cursor-pointer transition-all border-b-2 ${
                  activeTab === 'matrix' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent'
                }`}
              >
                Sentiment Matrix
              </button>
              <button
                onClick={() => setActiveTab('copilot')}
                className={`pb-0.5 text-xs font-bold font-sans cursor-pointer transition-all border-b-2 flex items-center gap-1 ${
                  activeTab === 'copilot' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                AI Copilot
              </button>
            </div>
            <span className="font-mono text-[9px] text-outline uppercase">QV-SECURE-NODE</span>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden p-2">
            {activeTab === 'matrix' ? (
              <div className="grid grid-cols-4 grid-rows-2 gap-1.5 flex-1 select-none">
                {sentiments.map((s) => {
                  const pos = s.score >= 0;
                  return (
                    <div
                      key={s.symbol}
                      onClick={() => handleAskCopilot(`Analyze market sentiment and pivot parameters for ${s.symbol}`)}
                      className={`border flex flex-col items-center justify-center p-1 rounded-sm transition-all hover:brightness-110 cursor-pointer ${
                        pos 
                          ? 'bg-primary/25 border-primary/20 hover:bg-primary/30' 
                          : 'bg-error/25 border-error/20 hover:bg-error/30'
                      }`}
                      title="Click to query AI Copilot for this ticker"
                    >
                      <span className="font-sans text-[10px] text-on-surface font-extrabold tracking-wider">{s.symbol}</span>
                      <span className={`font-mono text-[11px] font-bold ${pos ? 'text-primary' : 'text-[#FB923C]'}`}>
                        {pos ? '+' : ''}{s.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Log history */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-2 p-1.5 bg-surface-container-lowest/40 rounded border border-outline-variant/20 custom-scrollbar">
                  {chatHistory.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] rounded p-2 text-xs leading-relaxed ${
                        chat.role === 'user'
                          ? 'bg-primary-container text-on-primary-container ml-auto rounded-tr-none'
                          : 'bg-surface-container-high text-on-surface mr-auto rounded-tl-none border border-outline-variant/30'
                      }`}
                    >
                      <span className="font-sans font-bold text-[9px] text-outline mb-0.5 uppercase tracking-wide">
                        {chat.role === 'user' ? 'You (Trader)' : 'QuantVault Copilot'}
                      </span>
                      <p className="font-mono whitespace-pre-line text-[10px]">{chat.text}</p>
                    </div>
                  ))}
                  {copilotLoading && (
                    <div className="bg-surface-container-high text-on-surface mr-auto rounded p-2 text-xs border border-outline-variant/30 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                      <span className="font-mono text-[10px] text-outline">Generating AI Insights...</span>
                    </div>
                  )}
                </div>

                {/* Preconfigured prompt chips */}
                <div className="flex gap-1.5 mb-1.5 overflow-x-auto select-none pb-0.5">
                  {['Analyze NVDA', 'Analyze AAPL', 'Momentum Strategy'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleAskCopilot(chip)}
                      className="px-2 py-0.5 text-[9px] bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-bold rounded border border-outline-variant/30 cursor-pointer whitespace-nowrap"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Question Input bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskCopilot(copilotInput);
                  }}
                  className="flex gap-1.5 items-center"
                >
                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    placeholder={geminiApiKey ? "Ask Gemini anything..." : "Ask Copilot (Offline mode)..."}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 font-sans text-xs text-on-surface outline-none focus:border-primary placeholder-outline-variant"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-on-primary p-1.5 rounded hover:brightness-110 active:opacity-85 cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Right Column: Economic Calendar (col-span-3) */}
      <section className="col-span-12 lg:col-span-3 flex flex-col h-full overflow-hidden border border-outline-variant rounded-md bg-surface-container">
        <div className="px-3 py-2 border-b border-outline-variant bg-surface-container-high flex justify-between items-center select-none">
          <span className="font-sans text-[10px] font-bold text-primary uppercase tracking-wider">
            Economic Calendar
          </span>
          <Calendar className="w-4 h-4 text-on-surface-variant" />
        </div>

        <div className="flex-1 overflow-y-auto divide-y-2 divide-outline-variant/30 custom-scrollbar select-none">
          {events.map((e) => {
            const isHigh = e.impact === 'HIGH';
            const isMid = e.impact === 'MID';
            return (
              <div
                key={e.id}
                className={`p-3 relative ${isHigh ? 'border-b border-[#FB923C]/50 bg-[#FB923C]/5' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-mono text-[10px] font-bold ${isHigh ? 'text-[#FB923C]' : 'text-on-surface-variant'}`}>
                    {e.time}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((star, i) => {
                      const active = isHigh || (isMid && i < 2) || (!isHigh && !isMid && i === 0);
                      return (
                        <span
                          key={star}
                          className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#FB923C]' : 'bg-surface-container-highest'}`}
                        ></span>
                      );
                    })}
                  </div>
                </div>
                <h4 className="font-sans text-[11px] font-extrabold text-on-surface leading-tight mb-2">
                  {e.title}
                </h4>
                {e.actual && e.actual !== 'HAWKISH' && e.actual !== '--' ? (
                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                    <div>
                      <span className="block text-[8px] text-outline uppercase tracking-wider">ACTUAL</span>
                      <span className="font-bold text-[#FB923C]">{e.actual}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-outline uppercase tracking-wider">FORECAST</span>
                      <span>{e.forecast}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-outline uppercase tracking-wider">PREV</span>
                      <span>{e.prev}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-on-surface-variant leading-snug italic">
                    {e.title.includes('FOMC') ? 'High probability of hawkish tone concerning balance sheet tapering.' : 'Awaiting publication indices data release.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Export actions */}
        <div className="p-2 border-t border-outline-variant bg-surface-container-low">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-1.5 rounded-sm font-sans font-bold text-[10px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data (JSON)
          </button>
        </div>
      </section>
    </div>
  );
}
