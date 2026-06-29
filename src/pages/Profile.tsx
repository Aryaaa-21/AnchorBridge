import React from 'react';
import { useStore } from '../store/useStore';
import { Shield, Award, CheckCircle, Star, DollarSign, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, projects } = useStore();

  const name = user ? user.name : 'Sandbox User';
  const role = user ? user.role : 'client';
  const address = user ? user.address : 'GDA7...ALIC';

  // Compute metrics
  const completedProjects = projects.filter(p => p.status === 'completed');
  const activeProjects = projects.filter(p => p.status === 'active');
  const totalVolume = projects.reduce((sum, p) => sum + p.totalEscrow, 0);

  const badges = [
    { name: 'Soroban Pioneer', desc: 'Signed first Soroban milestone contract.', icon: Shield, color: 'text-accent-brand bg-accent-brand/10' },
    { name: 'Milestone Veteran', desc: 'Successfully released 5+ escrow tranches.', icon: Award, color: 'text-highlight-brand bg-highlight-brand/10' },
    { name: 'Verified Account', desc: 'Freighter wallet address bound & audited.', icon: CheckCircle, color: 'text-success-brand bg-success-brand/10' }
  ];

  const reviews = [
    { author: 'Alice Labs Corp', rating: 5, comment: 'Exceptional communication and clean Soroban contract deploys. Releasing funds was seamless.', date: '2026-06-22' },
    { author: 'SaaS Anchor Inc', rating: 5, comment: 'Highly professional, completed all database schemas on schedule. Recommend Bob for custom bridge works.', date: '2026-05-18' }
  ];

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
          Member Profile
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review reputation score, credentials, and historically completed escrows.
        </p>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Reputation Details */}
        <motion.div 
          variants={itemVariants}
          className="space-y-6"
        >
          <div className="p-6 rounded-xl border border-border-app glass-panel text-center space-y-4 shadow-sm">
            {/* Avatar circle */}
            <div className="h-20 w-20 rounded-full bg-accent-brand text-text-dark text-3xl font-black flex items-center justify-center mx-auto shadow-md" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="text-lg font-black text-primary-brand dark:text-text-dark">{name}</h2>
              <span className="text-[10px] font-bold text-accent-brand uppercase tracking-wider bg-accent-brand/10 px-2.5 py-0.5 rounded mt-1.5 inline-block">
                {role}
              </span>
            </div>

            <div className="pt-4 border-t border-border-app/40 space-y-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-text-muted">Account Address</span>
                <span className="font-mono text-text-main truncate max-w-[150px]" title={address}>{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Member Since</span>
                <span className="font-semibold text-text-main">June 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Reputation Score</span>
                <div className="flex items-center gap-1 text-success-brand font-bold">
                  <Star className="h-3.5 w-3.5 fill-success-brand" aria-hidden="true" />
                  <span>99.4% (Tier 1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics stats */}
          <div className="p-6 rounded-xl border border-border-app glass-panel space-y-4 text-xs shadow-sm">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Escrow Volume summary</h3>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded bg-border-app/10 border border-border-app/20">
                <FolderKanban className="h-5 w-5 mx-auto text-accent-brand mb-1.5" aria-hidden="true" />
                <span className="text-[9px] text-text-muted uppercase block font-semibold">Active Escrows</span>
                <span className="text-sm font-bold text-text-main font-mono">{activeProjects.length}</span>
              </div>
              <div className="p-3 rounded bg-border-app/10 border border-border-app/20">
                <CheckCircle className="h-5 w-5 mx-auto text-success-brand mb-1.5" aria-hidden="true" />
                <span className="text-[9px] text-text-muted uppercase block font-semibold">Completed</span>
                <span className="text-sm font-bold text-text-main font-mono">{completedProjects.length}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-border-app/10 border border-border-app/20 text-center">
              <DollarSign className="h-5 w-5 mx-auto text-highlight-brand mb-1.5" aria-hidden="true" />
              <span className="text-[9px] text-text-muted uppercase block font-semibold">Accumulated Value</span>
              <span className="text-sm font-bold text-text-main font-mono">{totalVolume.toLocaleString()} XLM</span>
            </div>
          </div>
        </motion.div>

        {/* Right 2 Columns: Badges & Reviews */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 space-y-6"
        >
          {/* Achievements / Badges */}
          <div className="p-6 rounded-xl border border-border-app glass-panel space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Verified Badges & Status</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {badges.map((b, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-bg-app border border-border-app space-y-2 hover:border-accent-brand/40 transition-colors duration-200">
                  <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${b.color}`} aria-hidden="true">
                    <b.icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-text-main">{b.name}</h4>
                  <p className="text-[10px] text-text-muted leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Reviews (For Freelancers/Clients feedback) */}
          <div className="p-6 rounded-xl border border-border-app glass-panel space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Member Reviews & Feedback</h3>
            
            <div className="space-y-4">
              {reviews.map((r, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-bg-app border border-border-app space-y-2 text-xs hover:border-accent-brand/40 transition-colors duration-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-main">{r.author}</span>
                    <span className="text-[10px] text-text-muted font-mono">{r.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 text-success-brand" aria-label={`Rating: ${r.rating} out of 5 stars`}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-success-brand text-success-brand" aria-hidden="true" />
                    ))}
                  </div>

                  <p className="text-text-muted italic leading-relaxed pt-1">
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
