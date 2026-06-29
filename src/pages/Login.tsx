import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Wallet, ShieldCheck, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error('Please fill in all credentials.');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(username, role);
      setIsLoading(false);
      toast.success(`Welcome back, ${username}!`);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Login failed. Connect Freighter Wallet.');
    }
  };

  const handleWalletLogin = async () => {
    setIsLoading(true);
    try {
      await login(role === 'freelancer' ? 'Bob the Builder' : 'Alice Labs', role);
      setIsLoading(false);
      toast.success('Freighter Wallet Auth Successful!');
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Freighter Login failed.');
    }
  };

  const fillDemo = (demoType: 'client' | 'freelancer') => {
    setRole(demoType);
    if (demoType === 'client') {
      setUsername('Alice Labs');
      setEmail('alice@labs.io');
      setPassword('••••••••••••');
    } else {
      setUsername('Bob the Builder');
      setEmail('bob@builder.co');
      setPassword('••••••••••••');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-6 bg-bg-app relative">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-brand/5 dark:bg-primary-brand/5 blur-[100px] pointer-events-none" aria-hidden="true" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md glass-panel rounded-xl border border-border-app p-8 shadow-xl relative z-10"
      >
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-primary-brand text-text-dark items-center justify-center mb-3" aria-hidden="true">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-primary-brand dark:text-text-dark">Access AnchorBridge</h2>
          <p className="text-xs text-text-muted mt-1">Connect your workspace and escrows</p>
        </div>

        {/* Role Tab Selector */}
        <div className="flex rounded-lg bg-border-app/20 p-1 mb-6" role="tablist" aria-label="Sign in role selection">
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

        {/* Passsword login Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="loginUsername" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Full Name / Organization
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <User className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="loginUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                placeholder="e.g. Alice Labs"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="loginEmail" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="loginEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="loginPassword" className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                Password
              </label>
              <a href="#" className="text-[10px] text-accent-brand font-bold hover:underline min-h-[32px] inline-flex items-center">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-12 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                placeholder="••••••••••••"
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

          {/* Remember me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4.5 w-4.5 text-accent-brand border-border-app rounded focus:ring-accent-brand cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-text-main cursor-pointer select-none">
              Remember me on this browser
            </label>
          </div>

          {/* Standard Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary-brand text-text-dark font-bold rounded-lg shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? 'Processing...' : 'Sign In with Password'}
          </button>
        </form>

        <div className="relative flex py-4 items-center" aria-hidden="true">
          <div className="flex-grow border-t border-border-app"></div>
          <span className="flex-shrink mx-4 text-[10px] text-text-muted font-bold uppercase tracking-wider">Or Login via Web3</span>
          <div className="flex-grow border-t border-border-app"></div>
        </div>

        {/* Web3 Freighter Wallet Login */}
        <button
          type="button"
          onClick={handleWalletLogin}
          disabled={isLoading}
          className="w-full h-12 border border-accent-brand text-accent-brand hover:bg-accent-brand/5 font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          aria-label="Connect and authenticate Freighter Wallet"
        >
          <Wallet className="h-4 w-4" aria-hidden="true" />
          <span>{isLoading ? 'Connecting Wallet...' : 'Authenticate Freighter Wallet'}</span>
        </button>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-4 border-t border-border-app/30 text-center">
          <span className="text-[10px] text-text-muted block mb-2 font-semibold">FAST ACCESS DEMO SANDBOX:</span>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => fillDemo('client')}
              className="px-3 py-2 bg-border-app/30 hover:bg-border-app/50 text-[10px] font-bold rounded text-text-main transition-all cursor-pointer min-h-[36px]"
            >
              Load Demo Client
            </button>
            <button
              onClick={() => fillDemo('freelancer')}
              className="px-3 py-2 bg-border-app/30 hover:bg-border-app/50 text-[10px] font-bold rounded text-text-main transition-all cursor-pointer min-h-[36px]"
            >
              Load Demo Freelancer
            </button>
          </div>
        </div>

        {/* Register Redirect */}
        <p className="text-center text-xs text-text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-brand font-bold hover:underline min-h-[32px] inline-flex items-center">
            Register Workspace
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
