import React, { useEffect, useState } from 'react';
import { useLocation, Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  Wallet, 
  Shield, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { WatchWalletChanges } from '@stellar/freighter-api';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { 
    theme, 
    txStatus, 
    resetTxStatus, 
    walletConnected, 
    walletAddress, 
    connectWallet 
  } = useStore();
  const [copied, setCopied] = useState(false);

  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/projects') || 
                      location.pathname.startsWith('/contracts') || 
                      location.pathname.startsWith('/wallet') || 
                      location.pathname.startsWith('/profile') || 
                      location.pathname.startsWith('/settings');

  useEffect(() => {
    // Sync theme with HTML root class
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (walletConnected) {
      try {
        const watcher = new WatchWalletChanges();
        watcher.watch(async (params) => {
          if (params.address && params.address !== walletAddress) {
            toast.info(`Freighter account switched: ${params.address.slice(0, 4)}...${params.address.slice(-4)}`);
            await connectWallet();
          }
        });
        return () => {
          watcher.stop();
        };
      } catch (err) {
        console.warn('Freighter Watcher could not be initialized:', err);
      }
    }
  }, [walletConnected, walletAddress, connectWallet]);

  const copyTx = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mobileNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/projects/create', label: 'Create', icon: PlusCircle },
    { to: '/contracts', label: 'Contracts', icon: Shield },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />
      
      {isDashboard ? (
        <div className="flex flex-1 relative">
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
            <Outlet />
          </main>
          
          {/* Mobile Bottom Navigation Bar */}
          <nav 
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#d4c5b3]/95 dark:bg-[#171514]/95 backdrop-blur-md border-t border-border-app px-2 py-2 flex justify-around items-center shadow-lg"
            aria-label="Mobile Navigation"
          >
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/projects/create'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg transition-all min-h-[44px] min-w-[44px] justify-center ${
                    isActive
                      ? 'text-accent-brand font-bold scale-105'
                      : 'text-text-muted hover:text-accent-brand'
                  }`
                }
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[9px] tracking-tight">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      ) : (
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      )}

      {/* Real-time Stellar / Soroban Transaction Progress Modal */}
      <AnimatePresence>
        {txStatus.active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#171514]/75 backdrop-blur-sm"
              onClick={txStatus.step === 'confirmed' || txStatus.step === 'failed' ? resetTxStatus : undefined}
            />

            {/* Content Card */}
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-[#24211f] border border-[#39332d] p-6 rounded-2xl shadow-2xl space-y-6 text-center"
            >
              {/* Animated Progress Indicator */}
              <div className="flex justify-center">
                {txStatus.step === 'confirmed' ? (
                  <div className="h-16 w-16 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                ) : txStatus.step === 'failed' ? (
                  <div className="h-16 w-16 bg-[#D9534F]/10 text-[#D9534F] rounded-full flex items-center justify-center">
                    <XCircle className="h-10 w-10" />
                  </div>
                ) : (
                  <div className="relative h-16 w-16">
                    <Loader2 className="h-16 w-16 text-[#ac5c2c] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase font-bold text-[#bca464] font-mono">
                      TX
                    </div>
                  </div>
                )}
              </div>

              {/* Status messages */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-[#f5efe7] uppercase tracking-wider">
                  {txStatus.step === 'preparing' && 'Preparing Escrow payload'}
                  {txStatus.step === 'signing' && 'Awaiting Wallet Signature'}
                  {txStatus.step === 'submitting' && 'Submitting to Stellar Testnet'}
                  {txStatus.step === 'confirming' && 'Confirming on Soroban Ledger'}
                  {txStatus.step === 'confirmed' && 'Transaction Confirmed!'}
                  {txStatus.step === 'failed' && 'Transaction Failed'}
                </h3>
                <p className="text-xs text-text-dark/70 leading-relaxed font-sans px-4">
                  {txStatus.message}
                </p>
                {txStatus.error && (
                  <div className="space-y-2 text-left">
                    <p className="text-[11px] text-[#D9534F] bg-[#D9534F]/10 p-3 rounded-lg border border-[#D9534F]/25 font-mono break-words">
                      Error: {txStatus.error}
                    </p>
                    {txStatus.error.toLowerCase().includes('locked') && (
                      <p className="text-[11.5px] text-[#bca464] font-sans bg-[#bca464]/5 p-2.5 rounded-lg border border-[#bca464]/20 leading-normal">
                        💡 <strong>Troubleshooting tip:</strong> Please open the Freighter browser extension, enter your password to unlock it, and verify that you have a Stellar account active.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Transaction success details */}
              {txStatus.step === 'confirmed' && txStatus.txHash && (
                <div className="bg-[#171514]/65 border border-[#39332d] p-4 rounded-xl space-y-3 text-left text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9894ac]">Tx Hash:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#f5efe7] truncate max-w-[150px]">{txStatus.txHash}</span>
                      <button
                        onClick={() => copyTx(txStatus.txHash)}
                        className="p-1 hover:bg-[#39332d] rounded text-[#ac5c2c] transition-colors"
                        aria-label="Copy hash"
                      >
                        {copied ? <Check className="h-3 w-3 text-[#4CAF50]" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9894ac]">Timebounds:</span>
                    <span className="text-[#f5efe7]">Confirmed ({txStatus.confirmedTime.split(' ')[1]})</span>
                  </div>
                  <div className="pt-2 border-t border-[#39332d] flex justify-center">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txStatus.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#ac5c2c] hover:underline font-sans font-bold"
                    >
                      <span>View on Stellar Expert</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Controls */}
              {(txStatus.step === 'confirmed' || txStatus.step === 'failed') && (
                <button
                  onClick={resetTxStatus}
                  className="w-full py-2.5 bg-[#5d240a] hover:bg-[#ac5c2c] text-[#f5efe7] text-xs font-bold rounded-lg transition-all"
                >
                  Close Window
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
