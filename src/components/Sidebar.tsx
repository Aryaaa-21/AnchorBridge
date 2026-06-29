import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, PlusCircle, Wallet, UserCircle, Settings, HelpCircle, Shield } from 'lucide-react';
export const Sidebar: React.FC = () => {


  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/projects/create', label: 'Create Escrow', icon: PlusCircle },
    { to: '/contracts', label: 'Smart Contract', icon: Shield },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-border-app glass-panel h-[calc(100vh-73px)] sticky top-[73px] transition-colors duration-300">
      {/* Sidebar Nav Items */}
      <div className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/projects/create' ? false : true}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-lg transition-all group ${
                isActive
                  ? 'bg-primary-brand text-text-dark shadow-md shadow-primary-brand/10'
                  : 'text-text-main hover:bg-border-app/20 hover:text-accent-brand'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Sidebar Footer Support Card */}
      <div className="p-4 border-t border-border-app">
        <div className="p-4 rounded-xl bg-border-app/10 border border-border-app/20 text-center">
          <HelpCircle className="h-5 w-5 mx-auto text-accent-brand mb-2" />
          <h4 className="text-xs font-bold text-text-main mb-1">Need Assistance?</h4>
          <p className="text-[10px] text-text-muted leading-relaxed mb-3">
            Read our docs or connect with our support agents.
          </p>
          <a
            href="#faq"
            className="inline-block w-full py-2 text-[10px] font-bold text-text-dark bg-accent-brand rounded-lg hover:opacity-90 transition-all"
          >
            Documentation
          </a>
        </div>
      </div>
    </aside>
  );
};
