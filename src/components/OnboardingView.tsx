import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, KeyRound, Globe, Compass, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onBackToLogin: () => void;
  onOnboardingComplete: (firmName: string, name: string) => void;
}

export default function OnboardingView({ onBackToLogin, onOnboardingComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Institutional info
  const [firmName, setFirmName] = useState('');
  const [firmType, setFirmType] = useState('Hedge Fund');
  const [tradingVol, setTradingVol] = useState('$100M - $500M');
  const [regulatoryID, setRegulatoryID] = useState('');

  // Step 2: User personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Trader');
  const [phone, setPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleContinue = () => {
    if (step === 1) {
      if (!firmName || !regulatoryID) {
        alert('Please populate the Institutional Name and Regulatory Identifier.');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      alert('Kindly fill in all the primary contact credentials.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        onOnboardingComplete(firmName, `${firstName} ${lastName}`);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-lowest text-on-surface select-none">
      {/* Dynamic Stepper Header */}
      <header className="h-14 bg-surface border-b border-[#334155]/30 flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="font-sans font-extrabold text-on-primary text-xs">QV</span>
          </div>
          <span className="font-sans text-sm font-bold tracking-tight text-primary">QuantVault Gateway</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-on-surface-variant/80">SDK: v4.2.0-PROD</span>
          <button
            onClick={onBackToLogin}
            className="text-primary font-bold hover:underline cursor-pointer uppercase text-[10px] tracking-wider"
          >
            Cancel Onboarding
          </button>
        </div>
      </header>

      {/* Main onboarding canvas split */}
      <main className="flex-grow flex items-stretch">
        
        {/* Left Side: Institutional value props list (col-span-12 or flex-1) */}
        <section className="hidden lg:flex lg:w-2/5 bg-surface-low border-r border-[#334155]/20 flex-col p-8 justify-between relative overflow-hidden">
          <div className="absolute inset-0 grid-mesh opacity-10 pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] font-mono text-[#adc6ff] font-bold uppercase tracking-widest mb-1">
                Verified Onboarding Protocol
              </p>
              <h2 className="font-sans text-xl font-bold text-on-surface">
                Access Tier-1 Liquidity
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-on-surface">Unified Clearing Desk</h4>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">
                    Cohesively trade equities, spot digital assets, forex rates, and futures with standard settlement ledgers.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-on-surface">Military cryptographic security</h4>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">
                    Leverage localized secure enclaves, end-to-end telemetry encryption, and strict multi-signature auth schemes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-on-surface">Advanced Compliance Auditor</h4>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">
                    Real time compliance diagnostics, FIPS standard verification logs, and instantly exportable CSV files.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container p-3 border border-outline-variant rounded select-none relative z-10">
            <div className="flex justify-between items-center text-[10px] mb-2 font-mono border-b border-outline-variant/30 pb-1.5">
              <span className="text-primary font-bold">NODE OVERWATCH</span>
              <span className="text-on-surface-variant">ACTIVE</span>
            </div>
            <div className="space-y-1.5 text-[10px] font-mono text-on-surface-variant">
              <div className="flex justify-between"><span>SECURE REGION:</span><span className="text-on-surface">US-EAST-D1 (PROD)</span></div>
              <div className="flex justify-between"><span>LATENCY POOL:</span><span className="text-primary font-bold">12ms • ZERO LOSS</span></div>
              <div className="flex justify-between"><span>CRYPTO CIPHER:</span><span className="text-on-surface">AES_256_GCM</span></div>
            </div>
          </div>
        </section>

        {/* Right Side: Form Wizard canvas (col-span-12 or flex-1) */}
        <section className="w-full lg:w-3/5 bg-surface flex items-center justify-center p-6">
          <div className="w-full max-w-[420px]">
            {showSuccess ? (
              <div className="bg-surface-lowest p-8 border border-primary/20 rounded-md text-center py-12 flex flex-col items-center gap-4 animate-scaleUp">
                <CheckCircle2 className="w-12 h-12 text-primary animate-bounce" />
                <h3 className="font-sans text-xl font-extrabold text-on-surface">Cryptographic credentials verified</h3>
                <p className="font-mono text-on-surface-variant text-xs leading-relaxed">
                  Establishing terminal connection for <span className="text-primary font-bold">{firmName}</span>. Proceeding to Secure Sandbox...
                </p>
                <div className="w-24 h-1.5 bg-surface-variant rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary animate-subtle-pulse w-full"></div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-lowest p-6 rounded-md border border-outline-variant/20 shadow-2xl">
                {/* Stepper badge heading */}
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30 mb-5">
                  <span className="font-sans text-[10px] font-extrabold text-primary uppercase tracking-widest">
                    Step {step} of 2
                  </span>
                  <span className="text-[11px] font-sans font-bold text-on-surface-variant">
                    {step === 1 ? 'Institutional Details' : 'Primary Contact Credentials'}
                  </span>
                </div>

                {step === 1 ? (
                  /* STEP 1: INSTITUTIONAL ENROLLMENT FORM */
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                        INSTITUTIONAL NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        placeholder="e.g. Citadel Capital, Point72"
                        className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface placeholder-outline-variant outline-none focus:border-primary font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                          ORGANISATION TYPE
                        </label>
                        <select
                          value={firmType}
                          onChange={(e) => setFirmType(e.target.value)}
                          className="bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none"
                        >
                          <option>Hedge Fund</option>
                          <option>Family Office</option>
                          <option>Prop Desk</option>
                          <option>Crypto Venture</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                          AVERAGE ANNUAL VOLUME
                        </label>
                        <select
                          value={tradingVol}
                          onChange={(e) => setTradingVol(e.target.value)}
                          className="bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none"
                        >
                          <option>&lt; $50M</option>
                          <option>$50M - $100M</option>
                          <option>$100M - $500M</option>
                          <option>$500M+</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                        REGULATORY LEI / SEC IDENTIFIER
                      </label>
                      <input
                        type="text"
                        required
                        value={regulatoryID}
                        onChange={(e) => setRegulatoryID(e.target.value)}
                        placeholder="e.g. 549300INFMSZXPBY73 or SEC-998"
                        className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface placeholder-outline-variant outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={onBackToLogin}
                        className="flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase text-outline hover:text-on-surface transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back To Login
                      </button>
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="bg-primary hover:brightness-110 px-4 py-2 rounded font-sans font-bold text-[10px] uppercase tracking-wider text-on-primary flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        Continue Onboarding
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: PRIMARY USER CONTACT DETAILS */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                          FIRST NAME
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface placeholder-outline-variant outline-none focus:border-primary font-sans"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                          LAST NAME
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface placeholder-outline-variant outline-none focus:border-primary font-sans"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                        JOB TITLE / TRADING DESK ROLE
                      </label>
                      <select
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option>Senior Trader</option>
                        <option>Quant Researcher</option>
                        <option>Chief Risk Officer (CRO)</option>
                        <option>Portfolio Manager</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                        SECURE WORK PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 0192-384"
                        className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-xs text-on-surface placeholder-outline-variant outline-none focus:border-primary font-sans"
                      />
                    </div>

                    <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase text-outline hover:text-on-surface transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Previous Step
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary-container hover:brightness-110 px-4 py-2 rounded font-sans font-bold text-[10px] uppercase tracking-wider text-on-primary-container flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>PROCESSING PORTAL...</span>
                          </>
                        ) : (
                          <>
                            <span>Enforce Compliance</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Compliance regulatory footer */}
      <footer className="bg-surface-container-lowest border-t border-[#334155]/20 py-2.5 px-6 text-[10px] text-center font-sans text-on-surface-variant/60 leading-none">
        QUANTVAULT INC • DISCLOSURE: Sandbox clearing simulation nodes represent no legal commitment. All rights reserved.
      </footer>
    </div>
  );
}
