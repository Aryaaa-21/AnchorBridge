import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Wallet, 
  Lock, 
  Check, 
  Layers, 
  ShieldAlert 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MilestoneInput {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user, walletConnected, walletAddress, walletBalance, addProject, txStatus } = useStore();

  const [step, setStep] = useState(1);
  
  // Step 1 State: Project Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Smart Contracts');
  const [freelancerAddr, setFreelancerAddr] = useState('GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP');
  const [freelancerName, setFreelancerName] = useState('Bob Developer');
  const [dueDate, setDueDate] = useState('2026-08-30');

  // Step 2 State: Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: 'Milestone 1: Design & Spec', description: 'Technical design document and schema definitions.', amount: 15000, dueDate: '2026-07-20' },
  ]);

  // Step 4 State: Escrow Deposit Simulation
  const [isDeploying, setIsDeploying] = useState(false);

  // Prefill client address if wallet connected
  const clientAddr = walletAddress || 'GDA7...ALIC';
  const clientName = user?.name || 'Alice Labs';

  const addMilestoneRow = () => {
    setMilestones([
      ...milestones,
      { title: '', description: '', amount: 0, dueDate: '' }
    ]);
  };

  const removeMilestoneRow = (index: number) => {
    if (milestones.length === 1) {
      toast.warning('Contracts must contain at least one milestone.');
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneInput, value: any) => {
    const updated = [...milestones];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    setMilestones(updated);
  };

  const totalEscrow = milestones.reduce((sum, m) => sum + m.amount, 0);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !freelancerAddr || !freelancerName) {
      toast.error('Please fill in all project details.');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasEmpty = milestones.some(m => !m.title || !m.description || m.amount <= 0 || !m.dueDate);
    if (hasEmpty) {
      toast.error('Please fill out all milestone fields with amounts greater than zero.');
      return;
    }
    setStep(3);
  };

  const handleEscrowDeposit = async () => {
    if (!walletConnected) {
      toast.error('Please connect your Freighter Wallet to sign this transaction.');
      return;
    }
    if (walletBalance < totalEscrow) {
      toast.error('Insufficient XLM balance to fund this escrow contract.');
      return;
    }

    setIsDeploying(true);

    try {
      // Actually create project in Zustand store (performs all on-chain operations)
      const projectId = await addProject({
        title,
        description,
        client: clientAddr,
        clientName,
        freelancer: freelancerAddr,
        freelancerName,
        totalEscrow,
        dueDate,
        category,
        milestones: milestones.map((m, i) => ({
          id: `m-${Date.now()}-${i}`,
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate,
          status: i === 0 ? 'active' : 'pending' // first milestone active by default
        }))
      });

      toast.success('Escrow contract deployed and funded on Soroban!');
      setIsDeploying(false);
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      setIsDeploying(false);
      toast.error(err.message || 'On-chain escrow deployment failed.');
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Milestones' },
    { num: 3, label: 'Review' },
    { num: 4, label: 'Deposit' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Wizard Header */}
      <div className="border-b border-border-app pb-6">
        <h1 className="text-2xl font-black text-primary-brand dark:text-text-dark tracking-tight uppercase">
          Initialize Trustless Escrow
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Lock contract deliverables to automated Soroban smart payouts.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between px-2 sm:px-6">
        {stepsHeader.map((s, idx) => {
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          return (
            <React.Fragment key={s.num}>
              {idx > 0 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300 ${isCompleted ? 'bg-primary-brand' : 'bg-muted-brand/30'}`} />
              )}
              <div className="flex flex-col items-center">
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-highlight-brand bg-highlight-brand/10 text-highlight-brand shadow-sm shadow-highlight-brand/20' 
                      : isCompleted 
                      ? 'border-primary-brand bg-primary-brand text-text-dark'
                      : 'border-muted-brand/40 bg-transparent text-text-muted'
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? <Check className="h-4.5 w-4.5" /> : s.num}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${
                  isActive ? 'text-highlight-brand' : isCompleted ? 'text-primary-brand' : 'text-text-muted'
                }`}>
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Containers */}
      <div className="glass-panel border border-border-app rounded-xl p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Project Info */}
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleStep1Submit} 
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="projectTitle" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Project Contract Title</label>
                  <input
                    id="projectTitle"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                    placeholder="e.g. Price Feed Integration for Liquidity Vaults"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="projectScope" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Detailed Scope of Work</label>
                  <textarea
                    id="projectScope"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all resize-none"
                    placeholder="Describe key deliverable conditions, auditing guidelines, and overall goals of the project..."
                  />
                </div>

                <div>
                  <label htmlFor="projectCategory" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Project Category</label>
                  <select
                    id="projectCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all cursor-pointer"
                  >
                    <option>Smart Contracts</option>
                    <option>DeFi Protocols</option>
                    <option>DApps/Frontend</option>
                    <option>Security Audit</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="projectDueDate" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Target Completion Date</label>
                  <input
                    id="projectDueDate"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="freelancerName" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Freelancer Workspace Name</label>
                  <input
                    id="freelancerName"
                    type="text"
                    required
                    value={freelancerName}
                    onChange={(e) => setFreelancerName(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all"
                    placeholder="e.g. Bob Developer"
                  />
                </div>

                <div>
                  <label htmlFor="freelancerAddr" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Freelancer Stellar Address</label>
                  <input
                    id="freelancerAddr"
                    type="text"
                    required
                    value={freelancerAddr}
                    onChange={(e) => setFreelancerAddr(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-bg-app border border-border-app text-xs focus:ring-2 focus:ring-accent-brand focus:border-accent-brand transition-all font-mono"
                    placeholder="GBOB..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-app/40">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary-brand text-text-dark font-bold text-xs px-6 py-3 rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Configure Milestones</span>
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: Milestones Configuration */}
          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleStep2Submit} 
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Payment Milestones Tranches</label>
                  <button
                    type="button"
                    onClick={addMilestoneRow}
                    className="flex items-center gap-1 text-[10px] font-bold text-accent-brand uppercase tracking-wider hover:underline min-h-[44px] px-2"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                {milestones.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-lg bg-border-app/10 border border-border-app/30 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeMilestoneRow(idx)}
                      className="absolute top-4 right-4 text-text-muted hover:text-error-brand transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={`Delete milestone ${idx + 1}`}
                    >
                      <Trash2 className="h-4.5 w-4.5" aria-hidden="true" />
                    </button>

                    <div className="text-[10px] font-bold text-accent-brand uppercase">Tranche #{idx + 1}</div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="md:col-span-2">
                        <label htmlFor={`m-title-${idx}`} className="sr-only">Milestone Title</label>
                        <input
                          id={`m-title-${idx}`}
                          type="text"
                          required
                          value={m.title}
                          onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                          className="w-full h-11 px-3 rounded bg-bg-app border border-border-app focus:ring-1 focus:ring-accent-brand transition-all"
                          placeholder="Milestone Title (e.g. Database Setup)"
                        />
                      </div>
                      <div>
                        <label htmlFor={`m-date-${idx}`} className="sr-only">Milestone Target Date</label>
                        <input
                          id={`m-date-${idx}`}
                          type="date"
                          required
                          value={m.dueDate}
                          onChange={(e) => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                          className="w-full h-11 px-3 rounded bg-bg-app border border-border-app focus:ring-1 focus:ring-accent-brand transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor={`m-desc-${idx}`} className="sr-only">Milestone Description</label>
                        <input
                          id={`m-desc-${idx}`}
                          type="text"
                          required
                          value={m.description}
                          onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                          className="w-full h-11 px-3 rounded bg-bg-app border border-border-app focus:ring-1 focus:ring-accent-brand transition-all"
                          placeholder="Milestone Description (e.g. Technical build specs)"
                        />
                      </div>
                      <div>
                        <div className="relative">
                          <label htmlFor={`m-amount-${idx}`} className="sr-only">Milestone Amount</label>
                          <input
                            id={`m-amount-${idx}`}
                            type="number"
                            required
                            value={m.amount || ''}
                            onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                            className="w-full h-11 pl-3 pr-12 rounded bg-bg-app border border-border-app focus:ring-1 focus:ring-accent-brand transition-all font-mono"
                            placeholder="Amount"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-text-muted" aria-hidden="true">XLM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border-app/40">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-text-main text-xs font-bold px-4 py-2 hover:bg-border-app/20 rounded-lg transition-all min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[9px] text-text-muted block font-semibold uppercase">Total Escrow Budget</span>
                    <span className="font-mono font-bold text-sm text-primary-brand dark:text-text-dark">{totalEscrow.toLocaleString()} XLM</span>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-primary-brand text-text-dark font-bold text-xs px-6 py-3 rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[44px]"
                  >
                    <span>Review Terms</span>
                    <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* STEP 3: Review Page */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">Review Smart Contract Terms</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-border-app/10 p-5 rounded-lg border border-border-app/30 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">Project Title</span>
                    <span className="font-bold text-text-main">{title}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">Category</span>
                    <span className="font-semibold text-text-main">{category}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">Scope</span>
                    <span className="text-text-muted line-clamp-3 leading-relaxed">{description}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">Client Address (Depositor)</span>
                    <span className="font-mono text-text-main">{clientAddr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">Freelancer Address (Recipient)</span>
                    <span className="font-mono text-text-main">{freelancerAddr} ({freelancerName})</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">Target Date</span>
                    <span className="font-semibold text-text-main">{dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Milestones tranches summary</span>
                <div className="divide-y divide-border-app/20 border border-border-app/30 rounded-lg overflow-hidden text-xs">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-bg-app hover:bg-border-app/5 transition-colors">
                      <div>
                        <p className="font-bold text-text-main">{m.title}</p>
                        <p className="text-[10px] text-text-muted">{m.description} • Due {m.dueDate}</p>
                      </div>
                      <span className="font-mono font-bold text-accent-brand">{m.amount.toLocaleString()} XLM</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total balance warning */}
              <div className="flex items-center gap-3 p-4 bg-highlight-brand/10 border border-highlight-brand/20 rounded-lg text-xs text-text-main">
                <ShieldAlert className="h-5 w-5 text-highlight-brand shrink-0" aria-hidden="true" />
                <p className="leading-relaxed">
                  By pressing deposit, you agree to lock <span className="font-bold">{totalEscrow.toLocaleString()} XLM</span> in a trustless Soroban smart contract. Funds are governed strictly by client-release or mutual-dispute keys.
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border-app/40">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-text-main text-xs font-bold px-4 py-2 hover:bg-border-app/20 rounded-lg transition-all min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-primary-brand text-text-dark font-bold text-xs px-6 py-3 rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Proceed to Deposit</span>
                  <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Deposit Escrow */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 text-center py-6"
            >
              {!isDeploying ? (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="h-16 w-16 rounded-full bg-accent-brand/10 border-2 border-accent-brand text-accent-brand flex items-center justify-center mx-auto animate-pulse" aria-hidden="true">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main uppercase tracking-wider">Fund Soroban Escrow Contract</h3>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      Review the payment details. Clicking the button below will trigger a transaction signature request via Freighter extension.
                    </p>
                  </div>

                  <div className="p-4 bg-border-app/10 rounded-lg border border-border-app/30 divide-y divide-border-app/20 text-xs">
                    <div className="flex justify-between py-2">
                      <span className="text-text-muted">Total Escrow Funds</span>
                      <span className="font-mono font-bold text-text-main">{totalEscrow.toLocaleString()} XLM</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-text-muted">Gas Fees (Soroban Network)</span>
                      <span className="font-mono text-success-brand">~0.00018 XLM</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                      <span className="text-text-main">Final Payable Amount</span>
                      <span className="font-mono text-primary-brand dark:text-text-dark">{(totalEscrow + 0.00018).toLocaleString()} XLM</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border border-border-app rounded-lg text-xs font-bold text-text-main hover:bg-border-app/10 transition-colors min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEscrowDeposit}
                      className="flex items-center gap-2 bg-primary-brand text-text-dark font-bold text-xs px-6 py-3 rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[44px]"
                    >
                      <span>Sign & Deploy Contract</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : (
                // Real Soroban Deployment & Funding Progress
                <div className="space-y-6 max-w-sm mx-auto">
                  <div className="flex items-center justify-center">
                    <div className="relative h-20 w-20">
                      {/* Spinner */}
                      <div className="absolute inset-0 rounded-full border-4 border-border-app/30" aria-hidden="true" />
                      <div className={`absolute inset-0 rounded-full border-4 border-t-accent-brand border-r-transparent border-b-transparent border-l-transparent ${txStatus.step !== 'failed' ? 'animate-spin' : ''}`} aria-hidden="true" />
                      <div className="absolute inset-0 flex items-center justify-center text-accent-brand" aria-hidden="true">
                        <Layers className="h-8 w-8" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-wider text-center">
                      {txStatus.step === 'failed' ? 'Transaction Failed' : 'Soroban On-Chain Escrow'}
                    </h3>
                    <p className={`text-xs text-center px-4 leading-relaxed font-semibold ${txStatus.step === 'failed' ? 'text-error-brand' : 'text-primary-brand dark:text-text-dark animate-pulse'}`}>
                      {txStatus.message || 'Processing on-chain operations... Please approve signatures in Freighter.'}
                    </p>

                    {txStatus.step === 'failed' && (
                      <div className="pt-4 flex justify-center gap-3">
                        <button
                          onClick={() => setIsDeploying(false)}
                          className="px-4 py-2 bg-primary-brand text-text-dark text-xs font-bold rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[40px]"
                        >
                          Retry Deposit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
