import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Sun, Moon, Bell, Shield, User, Wallet, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'wallet' | 'notifications' | 'security'>('profile');
  
  // Settings Form State
  const [profileName, setProfileName] = useState('Sandbox User');
  const [profileEmail, setProfileEmail] = useState('user@sandbox.io');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyLedger, setNotifyLedger] = useState(true);
  const [notifyDispute, setNotifyDispute] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Workspace settings updated successfully.');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
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
        className="border-b border-border-app pb-6"
      >
        <h1 className="text-2xl font-black text-primary-brand dark:text-text-dark tracking-tight">
          System Settings
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Configure profile details, wallet linkages, and event subscription rules.
        </p>
      </motion.div>

      {/* Main Grid: Sidebar settings tabs & content panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Settings Left Navigation */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-1 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0"
          role="tablist"
          aria-label="Settings categories"
        >
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'wallet', label: 'Wallet & Network', icon: Wallet },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security & Auth', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeSubTab === tab.id}
              aria-controls={`settings-panel-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                activeSubTab === tab.id
                  ? 'bg-primary-brand text-text-dark'
                  : 'text-text-main hover:bg-border-app/20'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Settings Right Content Form */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-3 glass-panel border border-border-app rounded-xl p-6 md:p-8 shadow-sm"
        >
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            <AnimatePresence mode="wait">
              {/* SUB TAB 1: Profile Settings */}
              {activeSubTab === 'profile' && (
                <motion.div 
                  key="profile-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  id="settings-panel-profile"
                  role="tabpanel"
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Profile Workspace</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label htmlFor="profileName" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Full Name / Org</label>
                      <input
                        id="profileName"
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-1 focus:ring-accent-brand"
                      />
                    </div>
                    <div>
                      <label htmlFor="profileEmail" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Email Address</label>
                      <input
                        id="profileEmail"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-1 focus:ring-accent-brand"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label htmlFor="profileBio" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Profile Biography</label>
                    <textarea
                      id="profileBio"
                      rows={3}
                      className="w-full p-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-1 focus:ring-accent-brand resize-none"
                      placeholder="Short description about your organization or developer credentials..."
                    />
                  </div>
                </motion.div>
              )}

              {/* SUB TAB 2: Wallet & Network */}
              {activeSubTab === 'wallet' && (
                <motion.div 
                  key="wallet-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  id="settings-panel-wallet"
                  role="tabpanel"
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Stellar Network Configuration</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label htmlFor="defaultNetwork" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Default Ledger Network</label>
                      <select id="defaultNetwork" className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-1 focus:ring-accent-brand cursor-pointer">
                        <option>Stellar Testnet (Standard)</option>
                        <option>Stellar Futurenet (WASM Sandbox)</option>
                        <option>Stellar Mainnet (Production Locked)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="preferredExplorer" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Preferred Ledger Explorer</label>
                      <select id="preferredExplorer" className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-1 focus:ring-accent-brand cursor-pointer">
                        <option>StellarExpert Explorer</option>
                        <option>Lumos Explorer</option>
                        <option>Stellar.org Laboratory</option>
                      </select>
                    </div>
                  </div>

                  {/* Theme config shortcut */}
                  <div className="pt-4 border-t border-border-app/30 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Display Customization</span>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-lg cursor-pointer transition-all min-h-[44px] ${
                          theme === 'light'
                            ? 'border-accent-brand text-accent-brand bg-accent-brand/5'
                            : 'border-border-app text-text-main hover:bg-border-app/10'
                        }`}
                        aria-label="Set light parchment theme"
                      >
                        <Sun className="h-4 w-4" aria-hidden="true" />
                        <span>Light Parchment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-lg cursor-pointer transition-all min-h-[44px] ${
                          theme === 'dark'
                            ? 'border-accent-brand text-accent-brand bg-accent-brand/5'
                            : 'border-border-app text-text-main hover:bg-border-app/10'
                        }`}
                        aria-label="Set obsidian earth dark theme"
                      >
                        <Moon className="h-4 w-4" aria-hidden="true" />
                        <span>Obsidian Earth</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SUB TAB 3: Notifications settings */}
              {activeSubTab === 'notifications' && (
                <motion.div 
                  key="notifications-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  id="settings-panel-notifications"
                  role="tabpanel"
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Notification Preferences</h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center">
                      <input
                        id="notify-email"
                        type="checkbox"
                        checked={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.checked)}
                        className="h-4.5 w-4.5 text-accent-brand border-border-app rounded focus:ring-accent-brand cursor-pointer"
                      />
                      <label htmlFor="notify-email" className="ml-2 block text-text-main cursor-pointer select-none">
                        Send email receipt for completed and released milestones.
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="notify-ledger"
                        type="checkbox"
                        checked={notifyLedger}
                        onChange={(e) => setNotifyLedger(e.target.checked)}
                        className="h-4.5 w-4.5 text-accent-brand border-border-app rounded focus:ring-accent-brand cursor-pointer"
                      />
                      <label htmlFor="notify-ledger" className="ml-2 block text-text-main cursor-pointer select-none">
                        Receive ledger push notifications on Freighter wallet events.
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="notify-dispute"
                        type="checkbox"
                        checked={notifyDispute}
                        onChange={(e) => setNotifyDispute(e.target.checked)}
                        className="h-4.5 w-4.5 text-accent-brand border-border-app rounded focus:ring-accent-brand cursor-pointer"
                      />
                      <label htmlFor="notify-dispute" className="ml-2 block text-text-main cursor-pointer select-none">
                        Notify immediately via all channels when a milestone enters a dispute.
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SUB TAB 4: Security settings */}
              {activeSubTab === 'security' && (
                <motion.div 
                  key="security-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  id="settings-panel-security"
                  role="tabpanel"
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Security credentials</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label htmlFor="newPassword" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">New Password</label>
                      <input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-1 focus:ring-accent-brand"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-1 focus:ring-accent-brand"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Save Button */}
            <div className="flex justify-end pt-4 border-t border-border-app/40">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-primary-brand text-text-dark font-bold text-xs px-5 py-2.5 rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[44px]"
                aria-label="Save settings modifications"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};
