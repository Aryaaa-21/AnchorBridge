import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ESCROW_CONTRACT_ID } from '../config/contracts';
import { 
  ArrowLeft, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Paperclip, 
  Send, 
  ExternalLink,
  FileText,
  Lock,
  MessageSquare,
  History,
  Info,
  Shield,
  Activity,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    projects, 
    transactions,
    user, 
    submitMilestone, 
    approveMilestone, 
    rejectMilestone,
    disputeMilestone, 
    refundClient,
    cancelProject,
    addComment 
  } = useStore();

  const project = projects.find(p => p.id === id);

  // Modal/Form states
  const [activeTab, setActiveTab] = useState<'milestones' | 'activity' | 'comments' | 'deliverables' | 'contract'>('milestones');
  const [commentText, setCommentText] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  
  // Dialog Open States
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [copiedContractId, setCopiedContractId] = useState(false);

  if (!project) {
    return (
      <div className="p-12 text-center rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4 animate-fade-in max-w-lg mx-auto mt-12">
        <AlertCircle className="h-12 w-12 mx-auto text-error-brand opacity-80" aria-hidden="true" />
        <h2 className="text-sm font-bold text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider">Contract Not Found</h2>
        <p className="text-xs text-text-muted">The requested project contract does not exist or has been removed.</p>
        <Link 
          to="/projects" 
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-[#ac5c2c] hover:underline min-h-[44px]"
        >
          Go back to projects
        </Link>
      </div>
    );
  }

  // Check roles
  const isClient = user ? user.address === project.client : true; // Default true for sandbox demo mode
  const isFreelancer = user ? user.address === project.freelancer : true;

  const getProgressPercent = () => {
    if (project.milestones.length === 0) return 0;
    const approved = project.milestones.filter(m => m.status === 'approved').length;
    return Math.round((approved / project.milestones.length) * 100);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const author = user ? user.name : 'Sandbox Member';
    addComment(project.id, author, commentText.trim());
    setCommentText('');
    toast.success('Comment added.');
  };

  const handleSubmitMilestoneWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId || !submissionText.trim()) return;

    // Add mock files
    const mockFiles = [
      { name: 'Deliverable_Build.zip', url: 'https://ipfs.io/ipfs/QmExample...', type: 'zip' },
      { name: 'Documentation_v1.0.md', url: '#', type: 'readme' }
    ];

    submitMilestone(project.id, selectedMilestoneId, submissionText.trim(), mockFiles);
    
    // Close modal
    setShowSubmitModal(false);
    setSelectedMilestoneId(null);
    setSubmissionText('');
  };

  const handleOpenSubmitModal = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setShowSubmitModal(true);
  };

  const handleOpenDisputeModal = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setShowDisputeModal(true);
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId || !disputeReason.trim()) return;

    disputeMilestone(project.id, selectedMilestoneId, disputeReason.trim());
    
    setShowDisputeModal(false);
    setSelectedMilestoneId(null);
    setDisputeReason('');
  };

  const handleApproveMilestone = (milestoneId: string) => {
    approveMilestone(project.id, milestoneId);
  };

  const copyContractId = () => {
    navigator.clipboard.writeText(ESCROW_CONTRACT_ID);
    setCopiedContractId(true);
    toast.success('Contract Address copied!');
    setTimeout(() => setCopiedContractId(false), 2000);
  };

  // Filter transactions for this project
  const projectTransactions = transactions.filter(t => t.projectTitle === project.title);

  // Escrow Lifecycle Steps
  const lifecycleSteps = [
    { key: 'deposit', label: 'Deposit Funds' },
    { key: 'locked', label: 'Soroban Escrow Locked' },
    { key: 'submit', label: 'Milestone Complete' },
    { key: 'approval', label: 'Client Approves' },
    { key: 'release', label: 'Released Funds' },
    { key: 'confirmed', label: 'Tx Confirmed' }
  ];

  // Determine current active index in lifecycle
  let activeLifecycleIdx = 0;
  if (project.status === 'completed') {
    activeLifecycleIdx = 5;
  } else if (project.milestones.some(m => m.status === 'submitted')) {
    activeLifecycleIdx = 3;
  } else if (project.milestones.some(m => m.status === 'approved')) {
    activeLifecycleIdx = 4;
  } else if (project.status === 'active') {
    activeLifecycleIdx = 1;
  } else if (project.status === 'disputed') {
    activeLifecycleIdx = 2; // Locked in arbitration
  }

  const tabItems = [
    { id: 'milestones', label: 'Milestones', count: project.milestones.length, icon: Lock },
    { id: 'contract', label: 'Smart Contract', count: 1, icon: Shield },
    { id: 'deliverables', label: 'Deliverables', count: project.deliverables.length, icon: Paperclip },
    { id: 'comments', label: 'Comments', count: project.comments.length, icon: MessageSquare },
    { id: 'activity', label: 'Audit Log', count: project.activityFeed.length, icon: History }
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <Link 
        to="/projects" 
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-[#ac5c2c] transition-colors min-h-[44px]"
        aria-label="Back to contracts list"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to Projects</span>
      </Link>

      {/* Hero Header Section */}
      <div className="bg-white/40 dark:bg-[#24211f] border border-[#5d240a]/15 dark:border-[#39332d] rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#ac5c2c] bg-[#ac5c2c]/10 px-2.5 py-0.5 rounded">
                {project.category}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                project.status === 'active' 
                  ? 'bg-[#ac5c2c]/10 text-[#ac5c2c]' 
                  : project.status === 'completed' 
                  ? 'bg-[#4CAF50]/10 text-[#4CAF50]'
                  : 'bg-[#D9534F]/10 text-[#D9534F]'
              }`}>
                {project.status}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#5d240a] dark:text-[#f5efe7] tracking-tight leading-tight">
              {project.title}
            </h1>
            <p className="text-[10px] text-text-muted mt-1 font-mono flex items-center gap-2">
              <span>Contract Escrow ID: {project.id}</span>
              <span>•</span>
              <span className="text-[#ac5c2c] hover:underline cursor-pointer flex items-center gap-1" onClick={copyContractId}>
                <span>{copiedContractId ? 'Copied Address!' : 'Copy Soroban Address'}</span>
                <Copy className="h-2.5 w-2.5" />
              </span>
            </p>
          </div>

          {/* Quick budget breakdown */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[9px] text-text-muted block font-semibold uppercase">Total Escrow</span>
              <span className="font-mono font-bold text-base text-[#5d240a] dark:text-[#f5efe7]">{project.totalEscrow.toLocaleString()} XLM</span>
            </div>
            <div className="h-8 w-[1px] bg-[#5d240a]/15 dark:bg-[#39332d]" aria-hidden="true" />
            <div className="text-right">
              <span className="text-[9px] text-text-muted block font-semibold uppercase">Locked in Escrow</span>
              <span className="font-mono font-bold text-base text-[#ac5c2c]">{project.lockedEscrow.toLocaleString()} XLM</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-main leading-relaxed max-w-4xl border-t border-[#5d240a]/10 dark:border-[#39332d]/40 pt-4">
          {project.description}
        </p>

        {/* Client & Freelancer Address Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#5d240a]/10 dark:border-[#39332d]/40 pt-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#5d240a]/5 dark:bg-[#171514]/40 border border-[#5d240a]/10 dark:border-[#39332d]/50">
            <User className="h-5 w-5 text-[#ac5c2c] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="text-[9px] text-text-muted block font-semibold uppercase">Client (Depositor)</span>
              <p className="font-bold text-text-main truncate" title={project.clientName}>{project.clientName}</p>
              <p className="text-[9px] text-text-muted font-mono truncate">{project.client}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#5d240a]/5 dark:bg-[#171514]/40 border border-[#5d240a]/10 dark:border-[#39332d]/50">
            <User className="h-5 w-5 text-[#bca464] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="text-[9px] text-text-muted block font-semibold uppercase">Freelancer (Receiver)</span>
              <p className="font-bold text-text-main truncate" title={project.freelancerName}>{project.freelancerName}</p>
              <p className="text-[9px] text-text-muted font-mono truncate">{project.freelancer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE ESCROW VISUALIZATION */}
      <div className="bg-white/40 dark:bg-[#24211f] border border-[#5d240a]/15 dark:border-[#39332d] rounded-xl p-6">
        <h3 className="text-xs font-black text-[#5d240a] dark:text-[#f5efe7] uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-[#ac5c2c]" />
          <span>Soroban Smart Contract Escrow Lifecycle</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center relative">
          {lifecycleSteps.map((step, idx) => {
            const isCompleted = idx <= activeLifecycleIdx;
            const isActive = idx === activeLifecycleIdx;
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#ac5c2c] text-[#f5efe7]' 
                    : 'bg-[#d4c5b3] dark:bg-[#171514] text-text-muted border border-[#5d240a]/15 dark:border-[#39332d]'
                } ${isActive ? 'ring-4 ring-[#ac5c2c]/30 scale-110' : ''}`}>
                  {idx + 1}
                </div>
                <span className={`text-[10px] font-bold mt-2.5 block leading-tight ${
                  isActive ? 'text-[#ac5c2c]' : isCompleted ? 'text-text-main' : 'text-text-muted'
                }`}>{step.label}</span>
              </div>
            );
          })}
          {/* Connector Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#5d240a]/10 dark:bg-[#39332d] -z-0 hidden md:block" />
        </div>
      </div>

      {/* Progress & Tabs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 cols: Main tabs content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Navigation header */}
          <div className="flex border-b border-[#5d240a]/15 dark:border-[#39332d] gap-4 overflow-x-auto" role="tablist" aria-label="Project Details navigation">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap min-h-[40px] flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-[#ac5c2c] text-[#ac5c2c]'
                    : 'border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{tab.label}</span> 
                <span className="text-[9px] opacity-75">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* TAB Content Wrapper */}
          <div className="outline-none" role="tabpanel" id={`tabpanel-${activeTab}`}>
            <AnimatePresence mode="wait">
              {activeTab === 'milestones' && (
                <motion.div 
                  key="milestones-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {project.milestones.map((m, index) => (
                    <div 
                      key={m.id}
                      className={`p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] relative flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                        m.status === 'active' 
                          ? 'ring-1 ring-[#ac5c2c]/40 border-[#ac5c2c]/40' 
                          : m.status === 'approved' 
                          ? 'bg-[#4CAF50]/5 border-[#4CAF50]/20'
                          : m.status === 'disputed'
                          ? 'bg-[#D9534F]/5 border-[#D9534F]/20'
                          : 'opacity-85'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#ac5c2c] font-mono uppercase">Tranche #{index + 1}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              m.status === 'approved' 
                                ? 'bg-[#4CAF50]/10 text-[#4CAF50]' 
                                : m.status === 'submitted' 
                                ? 'bg-[#bca464]/10 text-[#bca464]'
                                : m.status === 'disputed'
                                ? 'bg-[#D9534F]/10 text-[#D9534F]'
                                : m.status === 'active'
                                ? 'bg-[#ac5c2c]/10 text-[#ac5c2c]'
                                : 'bg-[#9894ac]/15 text-[#9894ac]'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-text-main mt-1.5">{m.title}</h3>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">{m.description}</p>
                          <span className="text-[10px] text-text-muted block mt-2 font-mono">Target Date: {m.dueDate}</span>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[10px] text-text-muted block font-semibold uppercase">Escrow Amount</span>
                          <span className="font-mono font-bold text-sm text-text-main">{m.amount.toLocaleString()} XLM</span>
                        </div>
                      </div>

                      {/* Submission Note */}
                      {m.submissionText && (
                        <div className="mb-4 p-4 rounded-lg bg-[#5d240a]/5 dark:bg-[#171514]/40 border border-[#5d240a]/10 dark:border-[#39332d]/45 text-xs">
                          <span className="text-[9px] text-text-muted block font-bold uppercase mb-1">Freelancer Submission Note</span>
                          <p className="text-text-main italic">"{m.submissionText}"</p>
                        </div>
                      )}

                      {/* Dispute Reason */}
                      {m.disputeReason && (
                        <div className="mb-4 p-4 rounded-lg bg-[#D9534F]/5 border border-[#D9534F]/20 text-xs">
                          <span className="text-[9px] text-[#D9534F] block font-bold uppercase mb-1">Dispute Arbitration Details</span>
                          <p className="text-text-main italic">"{m.disputeReason}"</p>
                        </div>
                      )}

                      {/* Action Buttons based on states */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-[#5d240a]/10 dark:border-[#39332d]/30">
                        {/* Freelancer triggers */}
                        {isFreelancer && m.status === 'active' && (
                          <button
                            onClick={() => handleOpenSubmitModal(m.id)}
                            className="px-4 py-2 bg-[#5d240a] text-[#f5efe7] hover:bg-[#ac5c2c] text-xs font-bold rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[40px]"
                            aria-label={`Submit deliverables for milestone ${m.title}`}
                          >
                            Submit Deliverables
                          </button>
                        )}

                        {/* Client triggers */}
                        {isClient && m.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleOpenDisputeModal(m.id)}
                              className="px-4 py-2 border border-[#D9534F] text-[#D9534F] hover:bg-[#D9534F]/5 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px]"
                              aria-label={`Dispute payout for milestone ${m.title}`}
                            >
                              Dispute Release
                            </button>
                            <button
                              onClick={() => {
                                rejectMilestone(project.id, m.id)
                                  .then(() => toast.success('Milestone rejected. Worker notified.'))
                                  .catch((err) => toast.error(err.message || 'Reject failed.'));
                              }}
                              className="px-4 py-2 border border-[#ac5c2c] text-[#ac5c2c] hover:bg-[#ac5c2c]/5 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px]"
                              aria-label={`Reject milestone submission for ${m.title}`}
                            >
                              Reject & Redo
                            </button>
                            <button
                              onClick={() => handleApproveMilestone(m.id)}
                              className="px-4 py-2 bg-[#4CAF50] hover:opacity-95 text-[#f5efe7] text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px]"
                              aria-label={`Approve and release funds for milestone ${m.title}`}
                            >
                              Approve & Release Funds
                            </button>
                          </>
                        )}

                        {m.status === 'approved' && (
                          <div className="flex items-center gap-1.5 text-xs text-[#4CAF50] font-bold py-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Funds Released Successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'contract' && (
                <motion.div
                  key="contract-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-xs"
                >
                  <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Soroban Telemetry Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-text-muted">Smart Contract Type: <span className="font-mono font-bold text-text-main">soroban::escrow::milestone</span></p>
                        <p className="text-text-muted">Contract ID: <span className="font-mono font-bold text-text-main truncate max-w-[150px] inline-block" title={ESCROW_CONTRACT_ID}>{ESCROW_CONTRACT_ID}</span></p>
                        <p className="text-text-muted">Compiler Version: <span className="font-mono font-bold text-text-main">rs-soroban-sdk-v21.6.0</span></p>
                        <p className="text-text-muted">Storage Footprint: <span className="font-mono font-bold text-text-main">0.024 MB (Persistent)</span></p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-text-muted">WASM Hash: <span className="font-mono font-bold text-text-main truncate max-w-[150px] inline-block" title="cbfca0445974f9c3c144bc28769fd68be57b506b92e182fb62915a0fed4686c8">cbfca0445974f9c3c144bc28769fd68be57b506b92e182fb62915a0fed4686c8</span></p>
                        <p className="text-text-muted">Total Calls Executed: <span className="font-mono font-bold text-text-main">{project.activityFeed.length + 3}</span></p>
                        <p className="text-text-muted">Stellar Explorer: <a href={`https://stellar.expert/explorer/testnet/contract/${ESCROW_CONTRACT_ID}`} target="_blank" rel="noreferrer" className="text-[#ac5c2c] hover:underline font-bold inline-flex items-center gap-1">View on Stellar Expert <ExternalLink className="h-3 w-3" /></a></p>
                      </div>
                    </div>

                    {isClient && project.status !== 'completed' && project.status !== 'cancelled' && (
                      <div className="border-t border-[#5d240a]/10 dark:border-[#39332d]/40 pt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this project escrow? This will return all locked funds.')) {
                              cancelProject(project.id)
                                .then(() => toast.success('Project escrow cancelled. Funds returned.'))
                                .catch((err) => toast.error(err.message || 'Cancellation failed.'));
                            }
                          }}
                          className="px-4 py-2 border border-[#D9534F] text-[#D9534F] hover:bg-[#D9534F]/5 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px]"
                        >
                          Cancel Project Escrow
                        </button>
                        {project.status === 'disputed' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to trigger a client refund for this disputed project?')) {
                                refundClient(project.id)
                                  .then(() => toast.success('Escrow funds refunded to client.'))
                                  .catch((err) => toast.error(err.message || 'Refund failed.'));
                              }
                            }}
                            className="px-4 py-2 bg-[#D9534F] hover:opacity-95 text-[#f5efe7] text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px]"
                          >
                            Refund Client (Dispute Settlement)
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Transaction feed */}
                  <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f]">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">Project Ledger Transactions</h3>
                    {projectTransactions.length === 0 ? (
                      <p className="text-text-muted text-center py-4">No transactions matched this project.</p>
                    ) : (
                      <div className="space-y-3 font-mono">
                        {projectTransactions.map((tx) => (
                          <div key={tx.id} className="p-3 rounded-lg bg-bg-app border border-[#5d240a]/10 dark:border-[#39332d]/60 flex items-center justify-between text-[11px]">
                            <div>
                              <p className="font-sans font-bold text-[#ac5c2c] uppercase">{tx.type}</p>
                              <p className="text-[10px] text-text-muted font-mono flex items-center gap-1.5">
                                <span className="truncate max-w-[120px]" title={tx.txHash}>{tx.txHash}</span>
                                <a
                                  href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#ac5c2c] hover:underline"
                                  title="View on Stellar Expert"
                                >
                                  <ExternalLink className="h-3 w-3 inline" />
                                </a>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-text-main">{tx.amount.toLocaleString()} XLM</span>
                              <p className="text-[9px] text-text-muted font-sans">{tx.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'deliverables' && (
                <motion.div 
                  key="deliverables-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {project.deliverables.length === 0 ? (
                    <div className="p-8 text-center rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/20 dark:bg-[#24211f]/60 flex flex-col items-center justify-center gap-2">
                      <Paperclip className="h-8 w-8 text-text-muted opacity-50" aria-hidden="true" />
                      <p className="text-xs text-text-muted">No deliverables uploaded yet.</p>
                    </div>
                  ) : (
                    project.deliverables.map((del) => (
                      <div key={del.id} className="p-4 rounded-lg bg-[#5d240a]/5 dark:bg-[#24211f]/80 border border-[#5d240a]/10 dark:border-[#39332d] flex items-center justify-between text-xs hover:border-[#ac5c2c]/40 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded bg-[#ac5c2c]/10 text-[#ac5c2c] flex items-center justify-center shrink-0">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-text-main truncate block">{del.name}</span>
                            <span className="text-[10px] text-text-muted block uppercase font-mono">{del.type} • {del.date}</span>
                          </div>
                        </div>
                        <a
                          href={del.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-border-app rounded-md text-[#ac5c2c] flex items-center gap-1 transition-colors min-h-[44px]"
                          aria-label={`Open deliverable document: ${del.name}`}
                        >
                          <span className="text-[10px] font-bold">Open</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'comments' && (
                <motion.div 
                  key="comments-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2" role="log">
                    {project.comments.length === 0 ? (
                      <p className="text-xs text-text-muted py-8 text-center">No discussion notes yet. Leave a note below.</p>
                    ) : (
                      project.comments.map((c) => (
                        <div key={c.id} className="p-4 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-[#ac5c2c] text-[#f5efe7] flex items-center justify-center font-bold text-[10px]" aria-hidden="true">
                                {c.avatar}
                              </div>
                              <span className="font-bold text-text-main">{c.author}</span>
                            </div>
                            <span className="text-[9px] text-text-muted font-mono">{c.date}</span>
                          </div>
                          <p className="text-text-muted leading-relaxed pl-8">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat comment form */}
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 h-11 px-4 rounded-lg bg-bg-app border border-[#5d240a]/15 dark:border-[#39332d] text-xs transition-all focus:ring-1 focus:ring-[#ac5c2c]"
                      placeholder="Ask a question or post updates..."
                      aria-label="Write a comment note"
                      required
                    />
                    <button
                      type="submit"
                      className="h-11 px-4 bg-[#5d240a] text-[#f5efe7] hover:bg-[#ac5c2c] font-bold rounded-lg hover:opacity-95 transition-all flex items-center justify-center cursor-pointer min-w-[44px]"
                      aria-label="Send comment"
                    >
                      <Send className="h-4.5 w-4.5" aria-hidden="true" />
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div 
                  key="activity-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 font-mono text-xs"
                >
                  {project.activityFeed.map((act) => (
                    <div key={act.id} className="p-4 rounded-lg bg-white/20 dark:bg-[#24211f]/60 border border-[#5d240a]/10 dark:border-[#39332d]/40 flex justify-between gap-4">
                      <div>
                        <span className="font-bold text-text-main">{act.action}</span>
                        <p className="text-[10px] text-text-muted mt-0.5">{act.user} - {act.details}</p>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono shrink-0">{act.date}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right col: Side stats, progress ring, budget summary */}
        <div className="space-y-6">
          {/* Progress Ring Card */}
          <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] text-center shadow-sm">
            <h2 className="text-xs font-bold text-text-main uppercase tracking-wider mb-6">Milestone Progress</h2>
            
            {/* Visual Progress ring */}
            <div className="relative h-28 w-28 mx-auto mb-4 flex items-center justify-center" aria-label={`Overall progress of ${getProgressPercent()}%`}>
              <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
                <circle cx="56" cy="56" r="46" stroke="var(--border)" strokeWidth="6" fill="transparent" opacity="0.2" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  stroke="#ac5c2c" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - getProgressPercent() / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-text-main font-mono">{getProgressPercent()}%</span>
                <span className="text-[8px] text-text-muted uppercase tracking-wider font-semibold">Approved</span>
              </div>
            </div>

            <p className="text-xs text-text-muted mt-2 px-2">
              {project.milestones.filter(m => m.status === 'approved').length} of {project.milestones.length} milestones approved and released.
            </p>
          </div>

          {/* Escrow Details Vault Metrics */}
          <div className="p-6 rounded-xl border border-[#5d240a]/15 dark:border-[#39332d] bg-white/40 dark:bg-[#24211f] space-y-4 text-xs shadow-sm">
            <h2 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-[#ac5c2c]" aria-hidden="true" />
              <span>Soroban Vault Summary</span>
            </h2>
            
            <div className="space-y-2.5 divide-y divide-[#5d240a]/10 dark:divide-[#39332d]/40">
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted">Status</span>
                <span className="font-bold text-text-main uppercase tracking-wider">{project.status}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted">Escrow Balance</span>
                <span className="font-mono font-bold text-text-main">{project.totalEscrow.toLocaleString()} XLM</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted">Funds Released</span>
                <span className="font-mono font-bold text-[#4CAF50]">{project.releasedFunds.toLocaleString()} XLM</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted">Gas Reserve (Soroban)</span>
                <span className="font-mono text-text-muted">0.05 XLM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOG MODAL 1: Submit Work */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitModal(false)}
              className="fixed inset-0 bg-[#171514]/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md glass-panel border border-[#5d240a]/15 dark:border-[#39332d] rounded-xl p-6 shadow-2xl space-y-4 text-left relative z-10"
              role="dialog"
              aria-labelledby="submit-modal-title"
              aria-describedby="submit-modal-desc"
            >
              <div>
                <h3 id="submit-modal-title" className="text-sm font-bold text-text-main uppercase tracking-wider">Submit Milestone Deliverables</h3>
                <p id="submit-modal-desc" className="text-[11px] text-text-muted mt-1">Provide details of work complete. This will notify the client for approval.</p>
              </div>

              <form onSubmit={handleSubmitMilestoneWork} className="space-y-4">
                <div>
                  <label htmlFor="submissionText" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Submission Note / Github Commit Url</label>
                  <textarea
                    id="submissionText"
                    required
                    rows={4}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full p-3 rounded-lg bg-bg-app border border-[#5d240a]/15 dark:border-[#39332d] text-xs focus:ring-1 focus:ring-[#ac5c2c] resize-none"
                    placeholder="Explain completed work details, reference IPFS or Github commits..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 text-xs font-bold text-text-main hover:bg-[#5d240a]/5 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5d240a] text-[#f5efe7] text-xs font-bold rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[44px]"
                  >
                    Submit for Payout
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL 2: Open Dispute */}
      <AnimatePresence>
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisputeModal(false)}
              className="fixed inset-0 bg-[#171514]/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md glass-panel border border-[#5d240a]/15 dark:border-[#39332d] rounded-xl p-6 shadow-2xl space-y-4 text-left relative z-10"
              role="dialog"
              aria-labelledby="dispute-modal-title"
              aria-describedby="dispute-modal-desc"
            >
              <div>
                <h3 id="dispute-modal-title" className="text-sm font-bold text-text-main uppercase tracking-wider">Open Dispute Case</h3>
                <p id="dispute-modal-desc" className="text-[11px] text-text-muted mt-1">This will lock the milestone funds in arbitration and notify stakeholders.</p>
              </div>

              <form onSubmit={handleDisputeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="disputeReason" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Reason for Dispute</label>
                  <textarea
                    id="disputeReason"
                    required
                    rows={4}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full p-3 rounded-lg bg-bg-app border border-[#5d240a]/15 dark:border-[#39332d] text-xs focus:ring-1 focus:ring-[#ac5c2c] resize-none"
                    placeholder="Explain why work does not meet specifications..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="px-4 py-2 text-xs font-bold text-text-main hover:bg-[#5d240a]/5 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D9534F] text-[#f5efe7] text-xs font-bold rounded-lg hover:opacity-95 shadow active:scale-98 transition-all cursor-pointer min-h-[44px]"
                  >
                    Open Dispute Case
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
