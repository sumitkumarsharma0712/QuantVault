import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Check, ArrowRight, ShieldAlert, KeyRound, RefreshCw } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
  onRequestAccess: () => void;
}

export default function LoginView({ onLoginSuccess, onRequestAccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);

    // Simulate cryptographic authorization verification loop
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(email);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-lowest text-on-surface select-none">
      <main className="flex-grow flex items-stretch h-full">
        {/* Visual Section (Left Column) - High fidelity digital rendering */}
        <section className="hidden lg:flex lg:w-1/2 relative bg-surface-lowest items-center justify-center border-r border-[#334155]/30 overflow-hidden">
          {/* Background matrix grid dot lights */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#424754 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>

          <div className="relative z-10 w-4/5 h-4/5 flex flex-col items-center justify-center">
            {/* Absolute central blue atmospheric glow */}
            <div className="absolute inset-x-0 mx-auto w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-subtle-pulse"></div>

            {/* Translucent glass textured globe node */}
            <div className="relative group flex justify-center items-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS3aStjn90ULHbll5eHEgM9WICUg1x-SX8lk7DLMqg-pQMhGfFWwlx5surHeMhepE-qgFDAVU8blpOhrjOHkmcwnxonPjG8nSEHU51gJrOI2t4ON1dMWxq7B-hso59PtoW6LT6qF9ZQF2w9DDip3RnvLG-AGIFWb9uWiX8B7v6E8sL3uI6ogNKvApQP2ca24Fv_SOjWgEqACFlomVGaoKsDCryT79bgiUyiquo-XdWWkHEAJe5G4_iOv2JKm2dt-bFA2gTVDSACjk"
                alt="Cryptographic Node Visual"
                className="w-full max-w-sm object-contain mix-blend-lighten opacity-80 transition-transform duration-700 ease-out hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-8 text-center">
              <h2 className="font-sans text-2xl font-extrabold text-primary tracking-tight leading-none uppercase">
                QuantVault
              </h2>
              <p className="font-mono text-outline text-[10px] mt-2 tracking-[0.2em] uppercase opacity-75">
                Institutional Terminal v4.2.0
              </p>
            </div>
          </div>
        </section>

        {/* Login Form Section (Right Column) */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-surface relative">
          <div className="w-full max-w-[380px] flex flex-col bg-surface-lowest/40 p-6 rounded-lg border border-outline-variant/20 shadow-2xl backdrop-blur-sm">
            {/* Brand header on small screens */}
            <div className="lg:hidden mb-6 flex items-center gap-2 select-none justify-center">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                <span className="font-sans font-extrabold text-on-primary text-sm">QV</span>
              </div>
              <span className="font-sans text-lg font-bold text-primary tracking-tight">QuantVault</span>
            </div>

            <div className="mb-6 text-center lg:text-left">
              <h1 className="font-sans text-xl font-bold text-on-surface mb-1">Institutional Access</h1>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Secure authenticated gateway for verified partners.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Institutional Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="email-input">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@firm.com"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md pl-10 pr-3 py-2 text-xs text-on-surface placeholder-outline-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                  />
                </div>
              </div>

              {/* Security password Key field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password-input">
                    Security Key
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Access credentials recovery initialized. Secure verification link sent to workspace admin.')}
                    className="text-primary hover:text-primary-container transition-colors font-sans text-[9px] uppercase font-bold tracking-wider cursor-pointer"
                  >
                    Forgot Credentials?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md pl-10 pr-10 py-2 text-xs text-on-surface placeholder-outline-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* remember security box lock */}
              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  type="checkbox"
                  id="remember-switch"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-surface-container-low border-outline-variant text-primary focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="remember-switch" className="text-[10px] text-on-surface-variant cursor-pointer">
                  Remember this cryptographic terminal for 30 days
                </label>
              </div>

              {/* Action buttons */}
              <div className="mt-2 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-on-primary-container font-sans font-extrabold text-xs py-2.5 rounded-md hover:brightness-110 active:opacity-90 tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-primary-container/20 shadow-md h-9"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-on-primary-container" />
                      <span>SECURE AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN SECURELY</span>
                      <ArrowRight className="w-3.5 h-3.5 inline" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-on-surface-variant/40">
                  <div className="h-px flex-grow bg-outline-variant/30"></div>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-outline">New institutional partners</span>
                  <div className="h-px flex-grow bg-outline-variant/30"></div>
                </div>

                <button
                  type="button"
                  onClick={onRequestAccess}
                  className="w-full flex items-center justify-center border border-outline-variant text-on-surface font-sans font-bold text-xs py-2.5 rounded-md hover:bg-surface-container-highest transition-colors group cursor-pointer"
                >
                  <span>Request Gateway Onboarding</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {/* Cryptographic Compliance Badges */}
            <div className="mt-8 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-60 transition-opacity">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-center text-outline">FIPS 140-2</span>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-60 transition-opacity">
                <KeyRound className="w-4 h-4 text-primary" />
                <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-center text-outline">AES-256 Bit</span>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-60 transition-opacity">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-center text-outline">SOC2 Type II</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global corporate footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-3 px-6 flex flex-col md:flex-row justify-between items-center gap-2 z-10 text-[10px] font-sans">
        <div className="flex gap-4">
          <a onClick={() => alert('Corporate privacy logs protocol details shown.')} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Privacy Policy</a>
          <a onClick={() => alert('Institutional service protocol shown.')} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Terms of Service</a>
          <a onClick={() => alert('Global cybersecurity framework disclosure.')} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Security Disclosure</a>
          <a onClick={() => alert('Regulatory licensing and compliance directory.')} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Compliance</a>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant/60">Institutional Infrastructure by</span>
          <span className="font-mono font-bold text-primary tracking-wider uppercase">Zaalima Development Pvt. Ltd</span>
        </div>
      </footer>
    </div>
  );
}
