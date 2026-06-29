import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Sun, Moon, Bell, LogOut, Wallet, Menu, X, ArrowRight, FolderKanban, PlusCircle, UserCircle, Settings as SettingsIcon, LayoutDashboard, Shield } from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    theme, 
    setTheme, 
    walletConnected, 
    walletAddress, 
    walletBalance, 
    connectWallet, 
    disconnectWallet, 
    user, 
    logout, 
    notifications,
    markNotificationsRead
  } = useStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/projects') || 
                      location.pathname.startsWith('/contracts') || 
                      location.pathname.startsWith('/wallet') || 
                      location.pathname.startsWith('/profile') || 
                      location.pathname.startsWith('/settings');

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleWalletClick = () => {
    if (walletConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-border-app transition-colors duration-300">
      <div className="mx-auto max-width px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="AnchorBridge Home">
            <div className="text-primary-brand dark:text-text-dark transition-colors duration-300">
              <Logo className="h-9 w-9 group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xl tracking-tight text-primary-brand dark:text-text-dark">
                AnchorBridge
              </span>
              <span className="font-mono text-[10px] text-accent-brand uppercase tracking-widest -mt-1 font-semibold">
                Soroban Escrow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isDashboard ? (
              // Landing Page Nav Links
              <div className="flex items-center gap-6 text-sm font-medium">
                <a href="#features" className="text-text-main hover:text-accent-brand transition-colors">Features</a>
                <a href="#workflow" className="text-text-main hover:text-accent-brand transition-colors">Workflow</a>
                <a href="#stats" className="text-text-main hover:text-accent-brand transition-colors">Stats</a>
                <a href="#faq" className="text-text-main hover:text-accent-brand transition-colors">FAQ</a>
              </div>
            ) : (
              // Dashboard Nav Links (shortcuts)
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link to="/dashboard" className="text-text-main hover:text-accent-brand transition-colors">Dashboard</Link>
                <Link to="/projects" className="text-text-main hover:text-accent-brand transition-colors">Projects</Link>
                <Link to="/contracts" className="text-text-main hover:text-accent-brand transition-colors">Contract</Link>
                <Link to="/wallet" className="text-text-main hover:text-accent-brand transition-colors">Wallet</Link>
              </div>
            )}

            <div className="h-4 w-[1px] bg-border-app" />

            {/* Utility Buttons */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-md hover:bg-border-app text-text-main transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle Theme"
                title="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5 text-highlight-brand" />
                )}
              </button>

              {/* Notification Bell */}
              {user && (
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      if (!notifOpen) markNotificationsRead();
                    }}
                    className="p-2.5 rounded-md hover:bg-border-app text-text-main transition-all relative cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={`Open notifications dropdown. ${unreadCount} unread`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error-brand animate-pulse" />
                    )}
                  </button>

                  {/* Notifications Dropdown with Framer Motion */}
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-80 glass-panel border border-border-app rounded-lg shadow-xl py-2 px-3 text-left z-50"
                      >
                        <div className="flex items-center justify-between border-b border-border-app pb-2 mb-2">
                          <span className="font-semibold text-xs uppercase tracking-wider text-text-muted">Notifications</span>
                          <span 
                            className="text-[10px] text-accent-brand cursor-pointer hover:underline" 
                            onClick={() => {
                              markNotificationsRead();
                              setNotifOpen(false);
                            }}
                          >
                            Mark all read
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {notifications.length === 0 ? (
                            <div className="text-center py-4 text-xs text-text-muted">No new notifications.</div>
                          ) : (
                            notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                className={`p-2 rounded text-xs transition-colors ${notif.read ? 'opacity-70' : 'bg-accent-brand/5 border-l-2 border-accent-brand'}`}
                              >
                                <p className="text-text-main font-medium">{notif.text}</p>
                                <span className="text-[9px] text-text-muted block mt-1">{notif.date}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Wallet Status */}
              <button
                onClick={handleWalletClick}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer min-h-[44px] ${
                  walletConnected 
                    ? 'bg-transparent border-accent-brand text-accent-brand hover:bg-accent-brand/5' 
                    : 'bg-primary-brand text-text-dark border-primary-brand hover:opacity-90'
                }`}
                aria-label={walletConnected ? `Wallet connected: ${formatAddress(walletAddress)}` : 'Connect Freighter Wallet'}
              >
                <Wallet className="h-4 w-4" />
                {walletConnected ? (
                  <div className="text-left font-mono">
                    <span>{formatAddress(walletAddress)}</span>
                    <span className="hidden lg:inline ml-2 text-text-muted font-sans font-medium">({walletBalance.toLocaleString()} XLM)</span>
                  </div>
                ) : (
                  <span>Connect Freighter</span>
                )}
              </button>

              {/* User Session Profile */}
              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-border-app">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-text-main">{user.name}</span>
                    <span className="text-[10px] text-accent-brand uppercase tracking-wider font-semibold">{user.role}</span>
                  </div>
                  <Link 
                    to="/profile" 
                    className="h-8.5 w-8.5 rounded-full bg-accent-brand text-text-dark flex items-center justify-center font-bold text-sm shadow-sm hover:ring-2 hover:ring-accent-brand/40 transition-all min-h-[34px] min-w-[34px]"
                    aria-label="View user profile"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-2 rounded-md hover:bg-error-brand/10 text-text-muted hover:text-error-brand transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/login" 
                    className="text-xs font-semibold text-text-main hover:text-accent-brand transition-colors min-h-[44px] flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center gap-1 bg-accent-brand hover:opacity-90 text-text-dark text-xs font-semibold px-4 py-2.5 rounded-lg transition-all min-h-[44px]"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-text-main hover:bg-border-app min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-highlight-brand" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-text-main hover:bg-border-app cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden w-full glass-panel border-t border-border-app px-6 py-4 space-y-4 overflow-hidden"
          >
            {!isDashboard ? (
              <div className="flex flex-col gap-3 text-sm font-semibold">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 block">Features</a>
                <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 block">Workflow</a>
                <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 block">Stats</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 block">FAQ</a>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-sm font-semibold">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 flex items-center gap-2">
                  <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
                </Link>
                <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 flex items-center gap-2">
                  <FolderKanban className="h-4.5 w-4.5" /> Projects
                </Link>
                <Link to="/projects/create" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 flex items-center gap-2">
                  <PlusCircle className="h-4.5 w-4.5" /> Create Escrow
                </Link>
                <Link to="/contracts" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5" /> Smart Contract
                </Link>
                <Link to="/wallet" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 flex items-center gap-2">
                  <Wallet className="h-4.5 w-4.5" /> Wallet
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 flex items-center gap-2">
                  <UserCircle className="h-4.5 w-4.5" /> My Profile
                </Link>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="text-text-main hover:text-accent-brand py-1.5 flex items-center gap-2">
                  <SettingsIcon className="h-4.5 w-4.5" /> Settings
                </Link>
              </div>
            )}

            <div className="h-[1px] bg-border-app w-full" />

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  handleWalletClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold rounded-lg bg-primary-brand text-text-dark min-h-[44px]"
              >
                <Wallet className="h-4 w-4" />
                {walletConnected ? `Connected: ${formatAddress(walletAddress)}` : 'Connect Freighter Wallet'}
              </button>

              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-md bg-border-app/20">
                    <div className="h-8 w-8 rounded-full bg-accent-brand text-text-dark flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-main">{user.name}</p>
                      <p className="text-[9px] text-accent-brand uppercase font-semibold">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold border border-error-brand text-error-brand rounded-lg hover:bg-error-brand/5 transition-all min-h-[44px]"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold border border-border-app rounded-lg text-text-main min-h-[44px] flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold bg-accent-brand text-text-dark rounded-lg min-h-[44px] flex items-center justify-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
