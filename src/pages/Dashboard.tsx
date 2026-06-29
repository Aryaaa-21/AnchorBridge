import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  PlusCircle, 
  Wallet, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowRight,
  TrendingUp,
  FolderOpen,
  Activity,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, projects, transactions, walletBalance, walletConnected } = useStore();
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Filter projects by user role if logged in
  const userProjects = user 
    ? projects.filter(p => p.client === user.address || p.freelancer === user.address)
    : projects;

  const activeProjectsCount = userProjects.filter(p => p.status === 'active' || p.status === 'disputed').length;
  const completedProjectsCount = userProjects.filter(p => p.status === 'completed').length;
  const disputesCount = userProjects.filter(p => p.status === 'disputed').length;

  const lockedEscrowSum = userProjects.reduce((sum, p) => sum + p.lockedEscrow, 0);
  const releasedEscrowSum = userProjects.reduce((sum, p) => sum + p.releasedFunds, 0);
  
  // Pending is the remaining portion locked in active milestones
  const pendingEscrowSum = userProjects.reduce((sum, p) => {
    return sum + p.milestones.reduce((mSum, m) => {
      return mSum + (m.status !== 'approved' ? m.amount : 0);
    }, 0);
  }, 0);

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    toast.success('Transaction hash copied!');
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  // Generate chart data
  const chartData = [
    { name: 'Jan', Escrow: 10000, Released: 5000 },
    { name: 'Feb', Escrow: 25000, Released: 8000 },
    { name: 'Mar', Escrow: 45000, Released: 15000 },
    { name: 'Apr', Escrow: 55000, Released: 32000 },
    { name: 'May', Escrow: 85000, Released: 45000 },
    { name: 'Jun', Escrow: lockedEscrowSum || 155000, Released: releasedEscrowSum || 50000 },
  ];

  // Get active user's role-based welcome
  const displayName = user ? user.name : 'Sandbox Workspace';
  const displayRole = user ? user.role : 'Administrator';

  // Get all milestones needing action
  const upcomingMilestones = userProjects
    .flatMap(p => p.milestones.map(m => ({ ...m, projectTitle: p.title, projectId: p.id })))
    .filter(m => m.status === 'active' || m.status === 'submitted')
    .slice(0, 3);

  // Generate blockchain events feed based on activity logs
  const rawEvents = userProjects.flatMap(p => 
    p.activityFeed.map(act => {
      // Map descriptive action text to Soroban smart contract topics
      let topic = 'CONTRACT_EVENT';
      if (act.action.includes('Created')) topic = 'soroban::escrow::initialized';
      else if (act.action.includes('Submitted')) topic = 'soroban::escrow::milestone_submitted';
      else if (act.action.includes('Approved') || act.action.includes('Released')) topic = 'soroban::escrow::milestone_approved_released';
      else if (act.action.includes('Dispute')) topic = 'soroban::escrow::dispute_opened';
      else if (act.action.includes('Refund')) topic = 'soroban::escrow::refund_issued';
      else if (act.action.includes('Closed')) topic = 'soroban::escrow::contract_terminated';

      return {
        id: act.id,
        date: act.date,
        action: act.action,
        user: act.user,
        details: act.details,
        projectTitle: p.title,
        projectId: p.id,
        topic,
        contractId: `C${p.id.replace('proj-', 'A4F2')}...${p.client.slice(-4)}`
      };
    })
  );

  const contractEvents = rawEvents.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
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
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#5d240a]/15 dark:border-[#39332d] pb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#5d240a] dark:text-[#f5efe7] tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs text-[#2b1d16]/70 dark:text-[#9894ac] mt-1 flex items-center gap-2">
            <span>Running in <span className="font-bold text-[#ac5c2c] uppercase tracking-wider">{displayRole} Mode</span></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#4CAF50] animate-pulse" />
              <span className="font-mono text-[10px] font-bold">Stellar Testnet Sandboxed</span>
            </span>
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            to="/projects/create"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#5d240a] text-[#f5efe7] hover:bg-[#ac5c2c] text-xs font-bold px-4 py-2.5 rounded-lg hover:opacity-95 shadow-sm active:scale-98 transition-all min-h-[44px]"
            aria-label="Create new escrow contract"
          >
            <PlusCircle className="h-4.5 w-4.5" aria-hidden="true" />
            <span>New Escrow</span>
          </Link>
          {!walletConnected && (
            <button
              onClick={() => navigate('/wallet')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-[#ac5c2c] text-[#ac5c2c] hover:bg-[#ac5c2c]/5 text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer min-h-[44px]"
              aria-label="Connect Freighter wallet"
            >
              <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Summary Cards Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Wallet Balance */}
        <div className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col justify-between h-32 hover:border-[#ac5c2c]/30 transition-all duration-300">
          <div className="flex justify-between items-start text-[#2b1d16]/70 dark:text-[#9894ac]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Freighter Balance</span>
            <Wallet className="h-5 w-5 text-[#ac5c2c]" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <h2 className="text-xl md:text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">
              {walletConnected ? `${walletBalance.toLocaleString()}` : '0.00'} <span className="text-xs font-normal">XLM</span>
            </h2>
            <p className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 mt-1 font-mono">
              {walletConnected ? 'Stellar Account Connected' : 'Disconnected'}
            </p>
          </div>
        </div>

        {/* Escrow Locked */}
        <div className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col justify-between h-32 hover:border-[#bca464]/35 transition-all duration-300">
          <div className="flex justify-between items-start text-[#2b1d16]/70 dark:text-[#9894ac]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Escrow Locked</span>
            <Lock className="h-5 w-5 text-[#bca464]" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <h2 className="text-xl md:text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">
              {lockedEscrowSum.toLocaleString()} <span className="text-xs font-normal">XLM</span>
            </h2>
            <p className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 mt-1">
              Secured in {activeProjectsCount} Soroban escrows
            </p>
          </div>
        </div>

        {/* Released Funds */}
        <div className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col justify-between h-32 hover:border-[#4CAF50]/30 transition-all duration-300">
          <div className="flex justify-between items-start text-[#2b1d16]/70 dark:text-[#9894ac]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Released Funds</span>
            <CheckCircle className="h-5 w-5 text-[#4CAF50]" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <h2 className="text-xl md:text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">
              {releasedEscrowSum.toLocaleString()} <span className="text-xs font-normal">XLM</span>
            </h2>
            <p className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 mt-1">
              Auto-disbursed upon milestones
            </p>
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="p-5 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col justify-between h-32 hover:border-[#ac5c2c]/30 transition-all duration-300">
          <div className="flex justify-between items-start text-[#2b1d16]/70 dark:text-[#9894ac]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Release</span>
            <Activity className="h-5 w-5 text-[#ac5c2c]" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <h2 className="text-xl md:text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] font-mono">
              {pendingEscrowSum.toLocaleString()} <span className="text-xs font-normal">XLM</span>
            </h2>
            <p className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 mt-1">
              Locked in active milestone phases
            </p>
          </div>
        </div>
      </motion.div>

      {/* Operational & Soroban Performance Metrics */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="p-4 rounded-lg bg-white/20 dark:bg-[#24211f]/60 border border-[#5d240a]/10 dark:border-[#39332d]/40 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#5d240a]/10 dark:bg-[#f5efe7]/5 text-[#5d240a] dark:text-[#f5efe7] flex items-center justify-center font-bold font-mono text-sm">
            {activeProjectsCount}
          </div>
          <div>
            <span className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac] block uppercase tracking-wider font-bold">Active Projects</span>
            <span className="text-xs font-bold text-[#5d240a] dark:text-[#f5efe7]">Under Soroban Guard</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/20 dark:bg-[#24211f]/60 border border-[#5d240a]/10 dark:border-[#39332d]/40 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#5d240a]/10 dark:bg-[#f5efe7]/5 text-[#5d240a] dark:text-[#f5efe7] flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
          </div>
          <div>
            <span className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac] block uppercase tracking-wider font-bold">Completed Projects</span>
            <span className="text-xs font-bold text-[#5d240a] dark:text-[#f5efe7] font-mono">{completedProjectsCount} Fully Payout</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/20 dark:bg-[#24211f]/60 border border-[#5d240a]/10 dark:border-[#39332d]/40 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#5d240a]/10 dark:bg-[#f5efe7]/5 text-[#5d240a] dark:text-[#f5efe7] flex items-center justify-center">
            <AlertCircle className={`h-5 w-5 ${disputesCount > 0 ? 'text-[#E8A317]' : 'text-[#2b1d16]/40 dark:text-[#9894ac]/40'}`} />
          </div>
          <div>
            <span className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac] block uppercase tracking-wider font-bold">Open Disputes</span>
            <span className="text-xs font-bold text-[#5d240a] dark:text-[#f5efe7] font-mono">{disputesCount} in Arbitration</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/20 dark:bg-[#24211f]/60 border border-[#5d240a]/10 dark:border-[#39332d]/40 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#5d240a]/10 dark:bg-[#f5efe7]/5 text-[#5d240a] dark:text-[#f5efe7] flex items-center justify-center">
            <Clock className="h-5 w-5 text-[#bca464]" />
          </div>
          <div>
            <span className="text-[10px] text-[#2b1d16]/50 dark:text-[#9894ac] block uppercase tracking-wider font-bold">Success Stats</span>
            <span className="text-xs font-bold text-[#5d240a] dark:text-[#f5efe7] font-mono">14.2d Avg / 98.4% Rate</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Chart & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Escrow Volume Analytics</h3>
              <p className="text-[10px] text-[#2b1d16]/60 dark:text-[#9894ac] mt-0.5">Historical breakdown of locked vs released funds</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#4CAF50] bg-[#4CAF50]/10 px-2 py-1 rounded font-bold">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>+18.4%</span>
            </div>
          </div>
          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEscrow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ac5c2c" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ac5c2c" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bca464" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#bca464" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.1} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    backdropFilter: 'blur(8px)'
                  }} 
                />
                <Area type="monotone" dataKey="Escrow" stroke="#ac5c2c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEscrow)" />
                <Area type="monotone" dataKey="Released" stroke="#bca464" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReleased)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Action Panel */}
        <motion.div 
          variants={itemVariants}
          className="space-y-6"
        >
          {/* Action Needed */}
          <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
            <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-4">Milestones Pending Review</h3>
            <div className="space-y-3">
              {upcomingMilestones.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#2b1d16]/60 dark:text-[#9894ac] flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8 text-[#4CAF50] opacity-60" />
                  <span>No active milestones pending. All clear!</span>
                </div>
              ) : (
                upcomingMilestones.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg bg-white/10 dark:bg-[#171514]/40 border border-[#5d240a]/10 dark:border-[#39332d]/60 flex items-center justify-between text-xs hover:border-[#ac5c2c]/50 transition-colors">
                    <div>
                      <p className="font-bold text-text-main truncate max-w-[150px]">{m.title}</p>
                      <p className="text-[10px] text-text-muted truncate max-w-[150px]">{m.projectTitle}</p>
                    </div>
                    <Link
                      to={`/projects/${m.projectId}`}
                      className="p-2 rounded-md bg-border-app/20 text-[#ac5c2c] hover:bg-[#ac5c2c] hover:text-[#f5efe7] transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
                      aria-label={`View milestone details for ${m.title}`}
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System status details */}
          <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4">
            <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Soroban Network Performance</h3>
            <div className="grid grid-cols-2 gap-4 text-center font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#5d240a]/5 dark:bg-[#171514]/30 border border-[#5d240a]/10 dark:border-[#39332d]/40">
                <span className="text-[9px] text-[#2b1d16]/50 dark:text-[#9894ac] block font-sans font-semibold mb-1">AVG TRANSACTION FEE</span>
                <span className="font-bold text-[#4CAF50]">0.00010 XLM</span>
              </div>
              <div className="p-3 rounded-lg bg-[#5d240a]/5 dark:bg-[#171514]/30 border border-[#5d240a]/10 dark:border-[#39332d]/40">
                <span className="text-[9px] text-[#2b1d16]/50 dark:text-[#9894ac] block font-sans font-semibold mb-1">LEDGER CLOSING</span>
                <span className="font-bold text-[#ac5c2c]">4.8 seconds</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid: Escrow Projects & Real Transaction Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project List Overview */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Project Escrow status</h3>
              <p className="text-[10px] text-[#2b1d16]/60 dark:text-[#9894ac] mt-0.5 font-medium">Overview of live smart contract integrations</p>
            </div>
            <Link to="/projects" className="text-xs font-bold text-[#ac5c2c] hover:underline flex items-center gap-1 min-h-[32px]">
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {userProjects.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#5d240a]/20 rounded-xl flex flex-col items-center justify-center gap-3">
              <FolderOpen className="h-10 w-10 text-text-muted opacity-50" />
              <p className="text-xs text-text-muted font-medium">No projects deployed yet.</p>
              <Link to="/projects/create" className="px-4 py-2 bg-[#5d240a] text-text-dark text-xs font-bold rounded hover:opacity-90">
                Create First Escrow
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#5d240a]/15 dark:border-[#39332d] text-text-muted">
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Project Escrow</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Client / Freelancer</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Total Escrow</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5d240a]/10 dark:divide-[#39332d]/40">
                  {userProjects.slice(0, 3).map((p) => (
                    <tr key={p.id} className="hover:bg-[#5d240a]/5 dark:hover:bg-[#39332d]/25 transition-colors">
                      <td className="py-4 pr-3">
                        <Link to={`/projects/${p.id}`} className="font-bold text-[#5d240a] dark:text-[#f5efe7] hover:text-[#ac5c2c] block">
                          {p.title}
                        </Link>
                        <span className="text-[9px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 font-mono">
                          id: {p.id} • contract: C{p.id.replace('proj-', 'B7E8')}...{p.client.slice(-3)}
                        </span>
                      </td>
                      <td className="py-4 pr-3">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold text-text-main">Client: {p.clientName}</span>
                          <span className="text-[10px] text-text-muted">Freelancer: {p.freelancerName}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-3 font-mono font-bold text-text-main">
                        {p.totalEscrow.toLocaleString()} XLM
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          p.status === 'active' 
                            ? 'bg-[#ac5c2c]/10 text-[#ac5c2c]' 
                            : p.status === 'completed' 
                            ? 'bg-[#4CAF50]/10 text-[#4CAF50]'
                            : 'bg-[#D9534F]/10 text-[#D9534F]'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Recent Blockchain Live Event Feed */}
        <motion.div 
          variants={itemVariants}
          className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-4">Latest Contract Events</h3>
            <div className="space-y-4">
              {contractEvents.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-8">No live contract events triggered.</p>
              ) : (
                contractEvents.map((ev) => (
                  <div key={ev.id} className="relative pl-5 pb-3 border-l border-[#ac5c2c]/20 last:pb-0">
                    <div className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-[#ac5c2c]" />
                    <div className="text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[#ac5c2c] truncate text-[11px]">{ev.action}</span>
                        <span className="text-[8px] text-text-muted font-mono whitespace-nowrap">{ev.date.split(' ')[1]}</span>
                      </div>
                      <p className="text-[10px] text-text-muted font-mono leading-none mt-1 text-[#bca464] truncate">
                        topic: {ev.topic}
                      </p>
                      <p className="text-[10px] text-[#2b1d16] dark:text-[#f5efe7]/80 mt-1 leading-relaxed">
                        {ev.user} - {ev.details}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-[#5d240a]/10 dark:border-[#39332d]/40 mt-4 text-center">
            <span className="text-[9px] text-[#2b1d16]/50 dark:text-[#9894ac]/60 font-mono block">Soroban Event Stream ID: active_polling_node_1</span>
          </div>
        </motion.div>
      </div>

      {/* Ledger Transaction Log with hash copy and explorer links */}
      <motion.div 
        variants={itemVariants}
        className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Blockchain Ledger Transactions</h3>
            <p className="text-[10px] text-[#2b1d16]/60 dark:text-[#9894ac] mt-0.5">Real-time ledger entries for deposits, milestone payouts, and arbitrations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#5d240a]/15 dark:border-[#39332d] text-text-muted">
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">TX Hash</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Type</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Project</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">From / To</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5d240a]/10 dark:divide-[#39332d]/40 font-mono">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-[#5d240a]/5 dark:hover:bg-[#39332d]/25 transition-colors">
                  <td className="py-4 pr-3 max-w-[120px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[#5d240a] dark:text-[#f5efe7] truncate max-w-[80px]">
                        {tx.txHash}
                      </span>
                      <button
                        onClick={() => copyToClipboard(tx.txHash, tx.id)}
                        className="p-1 rounded hover:bg-[#ac5c2c]/10 text-text-muted hover:text-[#ac5c2c] transition-all cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                        aria-label="Copy transaction hash"
                      >
                        {copiedTxId === tx.id ? (
                          <CheckCircle className="h-3 w-3 text-[#4CAF50]" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 pr-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      tx.type === 'deposit' 
                        ? 'bg-[#ac5c2c]/10 text-[#ac5c2c]' 
                        : 'bg-[#4CAF50]/10 text-[#4CAF50]'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 pr-3 font-sans max-w-[150px] truncate">
                    <span className="font-bold text-text-main">{tx.projectTitle}</span>
                  </td>
                  <td className="py-4 pr-3 font-bold text-text-main text-[11px]">
                    {tx.amount.toLocaleString()} {tx.token}
                  </td>
                  <td className="py-4 pr-3 text-[10px] text-text-muted">
                    <div className="flex flex-col">
                      <span>from: {tx.from}</span>
                      <span>to: {tx.to}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-3 text-[10px] text-text-muted font-sans">
                    {tx.date}
                  </td>
                  <td className="py-4 text-right">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#ac5c2c] hover:underline font-sans font-bold"
                      aria-label="Open in Stellar Expert"
                    >
                      <span>Stellar.Expert</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
