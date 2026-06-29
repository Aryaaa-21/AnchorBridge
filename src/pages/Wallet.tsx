import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Wallet as WalletIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const Wallet: React.FC = () => {
  const { 
    walletConnected, 
    walletAddress, 
    walletBalance, 
    connectWallet, 
    disconnectWallet, 
    transactions,
    projects
  } = useStore();

  const [copied, setCopied] = useState(false);

  // Compute stats
  const activeProjectsCount = projects.filter(p => p.status === 'active' || p.status === 'disputed').length;
  const lockedEscrowSum = projects.reduce((sum, p) => sum + p.lockedEscrow, 0);
  const releasedEscrowSum = projects.reduce((sum, p) => sum + p.releasedFunds, 0);

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Address copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Header */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-app pb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-primary-brand dark:text-text-dark tracking-tight">
            Wallet & Assets
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your keys, balances, and inspect Soroban smart contract transactions.
          </p>
        </div>
        <div>
          <button
            onClick={walletConnected ? handleDisconnect : handleConnect}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer min-h-[44px] ${
              walletConnected
                ? 'border-error-brand text-error-brand hover:bg-error-brand/5'
                : 'bg-primary-brand text-text-dark border-primary-brand hover:opacity-95'
            }`}
            aria-label={walletConnected ? "Disconnect Stellar wallet" : "Connect Freighter wallet"}
          >
            <WalletIcon className="h-4.5 w-4.5" aria-hidden="true" />
            <span>{walletConnected ? 'Disconnect Wallet' : 'Connect Freighter'}</span>
          </button>
        </div>
      </motion.div>

      {walletConnected ? (
        <>
          {/* Top Panel: Balance Card & Address Display */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Balance Card */}
            <div className="lg:col-span-2 p-6 rounded-xl border border-border-app glass-panel flex flex-col justify-between h-44 shadow-sm">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Stellar Account Balance</span>
                <h2 className="text-3xl md:text-4xl font-black text-primary-brand dark:text-text-dark font-mono mt-1">
                  {walletBalance.toLocaleString()} <span className="text-lg font-normal">XLM</span>
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t border-border-app/40 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success-brand animate-pulse" aria-hidden="true" />
                  <span className="font-semibold text-text-main">Connected to Stellar Testnet (Freighter)</span>
                </div>
                <div className="font-mono text-text-muted text-[10px]">
                  Base fee: 100 stroops (~0.00001 XLM)
                </div>
              </div>
            </div>

            {/* Address & Copy Card */}
            <div className="p-6 rounded-xl border border-border-app glass-panel flex flex-col justify-between h-44 shadow-sm">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Wallet Credentials</span>
                <div className="mt-2.5 p-3 bg-bg-app border border-border-app rounded-lg">
                  <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">PUBLIC KEY</span>
                  <p className="font-mono text-xs text-text-main truncate mt-1">{walletAddress}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-border-app bg-surface-app hover:bg-border-app/10 rounded-lg text-xs font-bold text-text-main transition-colors cursor-pointer min-h-[44px]"
                  aria-label="Copy public address to clipboard"
                >
                  {copied ? <Check className="h-4 w-4 text-success-brand" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy Key'}</span>
                </button>
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-border-app bg-surface-app hover:bg-border-app/10 rounded-lg text-xs font-bold text-text-main transition-colors min-h-[44px]"
                  aria-label="View account on Stellar Expert explorer"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span>Explorer</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            <div className="p-4 rounded-lg bg-border-app/10 border border-border-app/20 text-xs shadow-sm">
              <span className="text-[9px] text-text-muted block font-semibold uppercase">Locked in Escrow Contracts</span>
              <span className="text-lg font-mono font-bold text-text-main block mt-1">{lockedEscrowSum.toLocaleString()} XLM</span>
              <span className="text-[10px] text-text-muted mt-0.5 block">Locked in {activeProjectsCount} Soroban agreements</span>
            </div>

            <div className="p-4 rounded-lg bg-border-app/10 border border-border-app/20 text-xs shadow-sm">
              <span className="text-[9px] text-text-muted block font-semibold uppercase">Total Funds Released</span>
              <span className="text-lg font-mono font-bold text-success-brand block mt-1">{releasedEscrowSum.toLocaleString()} XLM</span>
              <span className="text-[10px] text-text-muted mt-0.5 block">Transferred directly upon approval</span>
            </div>

            <div className="p-4 rounded-lg bg-border-app/10 border border-border-app/20 text-xs shadow-sm">
              <span className="text-[9px] text-text-muted block font-semibold uppercase">Platform Fee Savings</span>
              <span className="text-lg font-mono font-bold text-accent-brand block mt-1">{(releasedEscrowSum * 0.045).toLocaleString()} XLM</span>
              <span className="text-[10px] text-text-muted mt-0.5 block">Calculated at standard 5% middleman rates</span>
            </div>
          </motion.div>

          {/* Transaction History Section */}
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-xl border border-border-app glass-panel space-y-6 shadow-sm"
          >
            <div>
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Soroban Ledger History</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Audit log of decentralized deposits, releases, and refund events</p>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-border-app text-text-muted pb-3">
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Tx Hash</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Type</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Budget Tranche / Project</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Amount</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Ledger Status</th>
                    <th className="pb-3 text-center text-[10px] font-semibold uppercase tracking-wider">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-app/30">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-border-app/10 transition-colors">
                      <td className="py-4 font-mono text-[10px] max-w-[120px] truncate text-text-muted pr-3" title={tx.txHash}>
                        {tx.txHash}
                      </td>
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-1.5">
                          {tx.type === 'deposit' ? (
                            <span className="p-1 rounded bg-accent-brand/10 text-accent-brand">
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                          ) : (
                            <span className="p-1 rounded bg-success-brand/10 text-success-brand">
                              <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                          )}
                          <span className="font-bold text-text-main uppercase text-[10px]">{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-3">
                        <span className="font-semibold text-text-main block">{tx.projectTitle}</span>
                        <span className="text-[10px] text-text-muted">Ledger Date: {tx.date}</span>
                      </td>
                      <td className="py-4 font-mono font-bold text-text-main pr-3">
                        {tx.amount.toLocaleString()} {tx.token}
                      </td>
                      <td className="py-4 pr-3">
                        <span className="inline-flex items-center gap-1 text-success-brand font-bold uppercase text-[9px] bg-success-brand/10 px-2 py-0.5 rounded">
                          Success
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-1.5 rounded-md hover:bg-border-app text-accent-brand transition-all min-h-[36px] min-w-[36px] items-center justify-center"
                          aria-label={`View transaction ${tx.txHash} on Stellar Explorer`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      ) : (
        // Wallet Disconnected View
        <motion.div 
          variants={itemVariants}
          className="p-12 text-center border border-border-app glass-panel rounded-xl space-y-6 max-w-xl mx-auto my-12 shadow-sm"
        >
          <div className="h-16 w-16 rounded-full bg-accent-brand/10 text-accent-brand flex items-center justify-center mx-auto" aria-hidden="true">
            <WalletIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main uppercase tracking-wider">Freighter Wallet Disconnected</h2>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Connect your Freighter extension wallet to read your native XLM balances, inspect active smart escrow positions, and release milestone funds.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-primary-brand text-text-dark font-bold text-xs rounded-lg hover:opacity-95 shadow active:scale-98 transition-all flex items-center gap-2 mx-auto cursor-pointer min-h-[44px]"
            aria-label="Connect Freighter browser extension wallet"
          >
            <WalletIcon className="h-4.5 w-4.5" aria-hidden="true" />
            <span>Connect Freighter Wallet</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
