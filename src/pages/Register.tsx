import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShieldCheck, Mail, Lock, User, Wallet, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();

  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddr, setWalletAddr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in required fields.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Simulate registering new account and logging in
      const defaultAddress = walletAddr || (role === 'freelancer' ? 'GBOB...BUILDER' : 'GDA7...ALIC');
      login(name, role, defaultAddress);
      setIsLoading(false);
      toast.success(`Account registered successfully! Welcome, ${name}!`);
      navigate('/dashboard');
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-6 bg-bg-app relative">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-brand/5 dark:bg-primary-brand/5 blur-[100px] pointer-events-none" aria-hidden="true" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md glass-panel rounded-xl border border-border-app p-8 shadow-xl relative z-10"
      >
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-primary-brand text-text-dark items-center justify-center mb-3" aria-hidden="true">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-primary-brand dark:text-text-dark">Create Workspace</h2>
          <p className="text-xs text-text-muted mt-1">Start using trustless escrow agreements</p>
        </div>

        {/* Role Tab Selector */}
        <div className="flex rounded-lg bg-border-app/20 p-1 mb-6" role="tablist" aria-label="Registration role selection">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'client'}
            onClick={() => setRole('client')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer min-h-[44px] ${
              role === 'client'
                ? 'bg-primary-brand text-text-dark shadow-sm'
                : 'text-text-main hover:text-accent-brand'
            }`}
          >
            I am a Client
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === 'freelancer'}
            onClick={() => setRole('freelancer')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer min-h-[44px] ${
              role === 'freelancer'
                ? 'bg-primary-brand text-text-dark shadow-sm'
                : 'text-text-main hover:text-accent-brand'
            }`}
          >
            I am a Freelancer
          </button>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="regName" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Workspace / Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <User className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="regName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                placeholder={role === 'client' ? 'e.g. Alice Labs Corp' : 'e.g. Bob the Builder'}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="regEmail" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="regEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                placeholder="you@domain.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="regPassword" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="regPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-12 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                placeholder="Choose a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-accent-brand cursor-pointer min-w-[44px] min-h-[44px] justify-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="regWallet" className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                Stellar Wallet Address <span className="text-text-muted text-[9px] lowercase font-normal">(optional)</span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="regWallet"
                type="text"
                value={walletAddr}
                onChange={(e) => setWalletAddr(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all font-mono"
                placeholder="G..."
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="h-4.5 w-4.5 mt-0.5 text-accent-brand border-border-app rounded focus:ring-accent-brand cursor-pointer"
              required
            />
            <label htmlFor="terms" className="ml-2 text-[10px] text-text-muted leading-relaxed cursor-pointer select-none">
              I agree to the AnchorBridge Terms of Service and escrow guidelines. I acknowledge escrow deposits are locked directly into smart contracts.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary-brand text-text-dark font-bold rounded-lg shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? 'Creating Workspace...' : 'Register Workspace'}
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-center text-xs text-text-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-accent-brand font-bold hover:underline min-h-[32px] inline-flex items-center">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
