import { create } from 'zustand';
import type { Project, Transaction } from '../utils/mockData';
import { INITIAL_PROJECTS, INITIAL_TRANSACTIONS } from '../utils/mockData';
import { stellarService } from '../services/stellar';
import { toast } from 'sonner';
import { ESCROW_CONTRACT_ID } from '../config/contracts';

export interface User {
  name: string;
  role: 'client' | 'freelancer';
  address: string;
}

export interface Notification {
  id: string;
  text: string;
  date: string;
  read: boolean;
}

export interface TxStatus {
  active: boolean;
  step: 'idle' | 'preparing' | 'signing' | 'submitting' | 'confirming' | 'confirmed' | 'failed';
  message: string;
  txHash: string;
  confirmedTime: string;
  error?: string;
}

interface StateStore {
  projects: Project[];
  transactions: Transaction[];
  theme: 'light' | 'dark';
  walletConnected: boolean;
  walletAddress: string;
  walletBalance: number;
  walletSequence: string;
  walletNetwork: string;
  user: User | null;
  notifications: Notification[];
  txStatus: TxStatus;
  
  setTheme: (theme: 'light' | 'dark') => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  syncBalance: () => Promise<void>;
  login: (name: string, role: 'client' | 'freelancer', address?: string) => Promise<void>;
  logout: () => void;
  resetTxStatus: () => void;
  addProject: (project: Omit<Project, 'id' | 'status' | 'activityFeed' | 'comments' | 'deliverables' | 'releasedFunds' | 'lockedEscrow'>) => Promise<string>;
  submitMilestone: (projectId: string, milestoneId: string, submissionText: string, files?: { name: string, url: string, type: string }[]) => Promise<void>;
  approveMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  rejectMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  disputeMilestone: (projectId: string, milestoneId: string, reason: string) => Promise<void>;
  refundClient: (projectId: string) => Promise<void>;
  cancelProject: (projectId: string) => Promise<void>;
  addComment: (projectId: string, author: string, content: string) => void;
  addNotification: (text: string) => void;
  markNotificationsRead: () => void;
}

export const useStore = create<StateStore>((set, get) => ({
  projects: INITIAL_PROJECTS,
  transactions: INITIAL_TRANSACTIONS,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  walletConnected: false,
  walletAddress: '',
  walletBalance: 0,
  walletSequence: '0',
  walletNetwork: 'UNKNOWN',
  user: null,
  notifications: [
    {
      id: 'notif-1',
      text: 'Milestone 2 for Oracle Bridge is awaiting your review.',
      date: '2026-06-25 18:42',
      read: false
    },
    {
      id: 'notif-2',
      text: 'Dispute opened on DeFi Yield Aggregator project.',
      date: '2026-06-24 10:22',
      read: true
    }
  ],
  txStatus: {
    active: false,
    step: 'idle',
    message: '',
    txHash: '',
    confirmedTime: ''
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    set({ theme });
  },

  connectWallet: async () => {
    try {
      set({
        txStatus: { active: true, step: 'preparing', message: 'Connecting Freighter Wallet...', txHash: '', confirmedTime: '' }
      });
      
      const address = await stellarService.connect();
      const network = await stellarService.checkNetwork();
      const details = await stellarService.getAccountDetails(address);

      set({
        walletConnected: true,
        walletAddress: address,
        walletBalance: details.balance,
        walletSequence: details.sequence,
        walletNetwork: network,
        txStatus: { active: false, step: 'idle', message: '', txHash: '', confirmedTime: '' }
      });
      
      get().addNotification('Freighter Wallet connected successfully!');
      toast.success('Freighter Wallet connected!');
    } catch (err: any) {
      set({
        txStatus: { 
          active: true, 
          step: 'failed', 
          message: 'Wallet connection failed.', 
          txHash: '', 
          confirmedTime: '', 
          error: err.message || 'Unknown error' 
        }
      });
      get().addNotification(`Wallet connection failed: ${err.message}`);
    }
  },

  disconnectWallet: () => {
    set({
      walletConnected: false,
      walletAddress: '',
      walletBalance: 0,
      walletSequence: '0',
      walletNetwork: 'UNKNOWN',
      user: null
    });
    get().addNotification('Wallet disconnected.');
    toast.info('Wallet disconnected.');
  },

  syncBalance: async () => {
    const address = get().walletAddress;
    if (!address) return;
    try {
      const details = await stellarService.getAccountDetails(address);
      set({
        walletBalance: details.balance,
        walletSequence: details.sequence
      });
    } catch (err) {
      console.error('Failed to sync wallet balance:', err);
    }
  },

  login: async (name, role, address) => {
    try {
      set({
        txStatus: { active: true, step: 'preparing', message: 'Logging in with Freighter...', txHash: '', confirmedTime: '' }
      });

      const userAddress = address || await stellarService.connect();
      const network = await stellarService.checkNetwork();
      const details = await stellarService.getAccountDetails(userAddress);

      set({
        user: { name, role, address: userAddress },
        walletConnected: true,
        walletAddress: userAddress,
        walletBalance: details.balance,
        walletSequence: details.sequence,
        walletNetwork: network,
        txStatus: { active: false, step: 'idle', message: '', txHash: '', confirmedTime: '' }
      });

      get().addNotification(`Logged in as ${name} (${role === 'freelancer' ? 'Freelancer' : 'Client'})`);
      toast.success(`Logged in as ${name}`);
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Freighter Login failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
    }
  },

  logout: () => {
    set({ user: null, walletConnected: false, walletAddress: '', walletBalance: 0 });
    get().addNotification('Logged out.');
  },

  resetTxStatus: () => {
    set({
      txStatus: { active: false, step: 'idle', message: '', txHash: '', confirmedTime: '' }
    });
  },

  addProject: async (newProj) => {
    const activeAddress = get().walletAddress;
    if (!activeAddress) {
      throw new Error('Please connect your Freighter Wallet first.');
    }

    try {
      // Step 1: Create Project contract entry
      set((state) => ({
        txStatus: {
          ...state.txStatus,
          active: true,
          step: 'preparing',
          message: `Step 1/${2 + newProj.milestones.length}: Creating project on-chain...`
        }
      }));

      const createResult = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'create_project',
        [
          activeAddress,
          newProj.freelancer,
          newProj.title,
          newProj.description,
          BigInt(newProj.totalEscrow),
          newProj.milestones.length
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          
          set((state) => ({
            txStatus: {
              ...state.txStatus,
              step: stepName,
              message: `Step 1/${2 + newProj.milestones.length}: Creating project (${statusStep})`
            }
          }));
        }
      );

      const onChainId = createResult.returnValue;
      if (onChainId === undefined) {
        throw new Error('Failed to retrieve project ID from transaction return value.');
      }

      const onChainIdStr = onChainId.toString();

      // Step 2: Create each milestone on-chain
      for (let i = 0; i < newProj.milestones.length; i++) {
        const m = newProj.milestones[i];
        const stepNum = i + 2;
        const totalSteps = 2 + newProj.milestones.length;
        
        set((state) => ({
          txStatus: {
            ...state.txStatus,
            step: 'preparing',
            message: `Step ${stepNum}/${totalSteps}: Creating milestone "${m.title}"...`
          }
        }));

        const dueDateSeconds = BigInt(Math.floor(new Date(m.dueDate).getTime() / 1000));

        await stellarService.invokeSorobanContract(
          activeAddress,
          ESCROW_CONTRACT_ID,
          'create_milestone',
          [
            activeAddress,
            BigInt(onChainIdStr),
            i,
            m.title,
            BigInt(m.amount),
            dueDateSeconds
          ],
          (statusStep) => {
            let stepName: TxStatus['step'] = 'preparing';
            if (statusStep.includes('Signature')) stepName = 'signing';
            if (statusStep.includes('Submitting')) stepName = 'submitting';
            if (statusStep.includes('Confirmation')) stepName = 'confirming';
            
            set((state) => ({
              txStatus: {
                ...state.txStatus,
                step: stepName,
                message: `Step ${stepNum}/${totalSteps}: Creating milestone "${m.title}" (${statusStep})`
              }
            }));
          }
        );
      }

      // Step 3: Fund the project on-chain (lock escrow funds)
      const fundStepNum = 2 + newProj.milestones.length;
      set((state) => ({
        txStatus: {
          ...state.txStatus,
          step: 'preparing',
          message: `Step ${fundStepNum}/${fundStepNum}: Funding project escrow vault...`
        }
      }));

      const fundResult = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'fund_project',
        [
          activeAddress,
          BigInt(onChainIdStr)
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          
          set((state) => ({
            txStatus: {
              ...state.txStatus,
              step: stepName,
              message: `Step ${fundStepNum}/${fundStepNum}: Funding project escrow (${statusStep})`
            }
          }));
        }
      );

      const id = `proj-${onChainIdStr}`;
      const newProject: Project = {
        ...newProj,
        id,
        status: 'active',
        lockedEscrow: newProj.totalEscrow,
        releasedFunds: 0,
        activityFeed: [
          {
            id: `act-${Date.now()}-1`,
            date: fundResult.confirmedTime,
            action: 'Project Created',
            user: newProj.clientName,
            details: `Escrow contract initialized with ${newProj.totalEscrow.toLocaleString()} XLM. Tx: ${fundResult.txHash.slice(0, 8)}...`
          }
        ],
        comments: [],
        deliverables: []
      };

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        projectTitle: newProj.title,
        amount: newProj.totalEscrow,
        token: 'XLM',
        date: fundResult.confirmedTime,
        txHash: fundResult.txHash,
        status: 'success',
        from: activeAddress,
        to: 'AnchorBridge Escrow Vault'
      };

      set((state) => ({
        projects: [newProject, ...state.projects],
        transactions: [newTx, ...state.transactions],
        txStatus: {
          active: true,
          step: 'confirmed',
          message: 'Project created and escrow funds locked successfully!',
          txHash: fundResult.txHash,
          confirmedTime: fundResult.confirmedTime
        }
      }));

      await get().syncBalance();
      get().addNotification(`Project "${newProj.title}" successfully created and escrowed.`);
      return id;
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Escrow lock failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
      throw err;
    }
  },

  submitMilestone: async (projectId, milestoneId, submissionText, files) => {
    const activeAddress = get().walletAddress;
    if (!activeAddress) {
      throw new Error('Please connect your Freighter Wallet first.');
    }

    try {
      const onChainProjectId = BigInt(projectId.replace('proj-', ''));
      const milestoneIdx = parseInt(milestoneId.split('-').pop() || '0');

      const result = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'submit_milestone',
        [
          activeAddress,
          onChainProjectId,
          milestoneIdx,
          submissionText
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          if (statusStep.includes('Confirmed')) stepName = 'confirmed';
          if (statusStep.includes('Failed')) stepName = 'failed';

          set((state) => ({
            txStatus: {
              ...state.txStatus,
              active: true,
              step: stepName,
              message: `Soroban Contract Invoke: ${statusStep}`
            }
          }));
        }
      );

      set((state) => {
        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== projectId) return proj;
          
          const updatedMilestones = proj.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            return {
              ...m,
              status: 'submitted' as const,
              submissionText
            };
          });

          const newActivity = {
            id: `act-${Date.now()}`,
            date: result.confirmedTime,
            action: 'Milestone Submitted',
            user: proj.freelancerName,
            details: `Milestone "${proj.milestones.find(m => m.id === milestoneId)?.title}" submitted. Tx: ${result.txHash.slice(0, 8)}...`
          };

          const newDeliverables = files ? [
            ...proj.deliverables,
            ...files.map((f, index) => ({
              id: `del-${Date.now()}-${index}`,
              name: f.name,
              url: f.url || '#',
              type: f.type || 'file',
              date: result.confirmedTime
            }))
          ] : proj.deliverables;

          return {
            ...proj,
            milestones: updatedMilestones,
            activityFeed: [newActivity, ...proj.activityFeed],
            deliverables: newDeliverables
          };
        });

        return { 
          projects: updatedProjects,
          txStatus: {
            active: true,
            step: 'confirmed',
            message: 'Milestone deliverables submitted successfully!',
            txHash: result.txHash,
            confirmedTime: result.confirmedTime
          }
        };
      });

      await get().syncBalance();
      get().addNotification('Milestone successfully submitted.');
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Submission failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
      throw err;
    }
  },

  approveMilestone: async (projectId, milestoneId) => {
    const activeAddress = get().walletAddress;
    if (!activeAddress) {
      throw new Error('Please connect your Freighter Wallet.');
    }

    try {
      const onChainProjectId = BigInt(projectId.replace('proj-', ''));
      const milestoneIdx = parseInt(milestoneId.split('-').pop() || '0');

      const result = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'approve_milestone',
        [
          activeAddress,
          onChainProjectId,
          milestoneIdx
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          if (statusStep.includes('Confirmed')) stepName = 'confirmed';
          if (statusStep.includes('Failed')) stepName = 'failed';

          set((state) => ({
            txStatus: {
              ...state.txStatus,
              active: true,
              step: stepName,
              message: `Soroban Escrow Release: ${statusStep}`
            }
          }));
        }
      );

      let releasedAmt = 0;
      let pTitle = '';
      let fAddress = '';

      set((state) => {
        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== projectId) return proj;
          
          pTitle = proj.title;
          fAddress = proj.freelancer;

          const updatedMilestones = proj.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            releasedAmt = m.amount;
            return {
              ...m,
              status: 'approved' as const
            };
          });

          const isAllApproved = updatedMilestones.every(m => m.status === 'approved');

          const newActivity = {
            id: `act-${Date.now()}`,
            date: result.confirmedTime,
            action: 'Milestone Approved & Released',
            user: proj.clientName,
            details: `${releasedAmt.toLocaleString()} XLM released. Tx: ${result.txHash.slice(0, 8)}...`
          };

          return {
            ...proj,
            milestones: updatedMilestones,
            lockedEscrow: proj.lockedEscrow - releasedAmt,
            releasedFunds: proj.releasedFunds + releasedAmt,
            status: isAllApproved ? 'completed' as const : proj.status,
            activityFeed: [newActivity, ...proj.activityFeed]
          };
        });

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'release',
          projectTitle: pTitle,
          amount: releasedAmt,
          token: 'XLM',
          date: result.confirmedTime,
          txHash: result.txHash,
          status: 'success',
          from: 'AnchorBridge Escrow Vault',
          to: fAddress
        };

        return {
          projects: updatedProjects,
          transactions: [newTx, ...state.transactions],
          txStatus: {
            active: true,
            step: 'confirmed',
            message: 'Milestone payment released successfully!',
            txHash: result.txHash,
            confirmedTime: result.confirmedTime
          }
        };
      });

      await get().syncBalance();
      get().addNotification('Milestone approved. Escrow funds released.');
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Approval failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
      throw err;
    }
  },

  rejectMilestone: async (projectId, milestoneId) => {
    const activeAddress = get().walletAddress;
    if (!activeAddress) {
      throw new Error('Please connect your Freighter Wallet.');
    }

    try {
      const onChainProjectId = BigInt(projectId.replace('proj-', ''));
      const milestoneIdx = parseInt(milestoneId.split('-').pop() || '0');

      const result = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'reject_milestone',
        [
          activeAddress,
          onChainProjectId,
          milestoneIdx
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          if (statusStep.includes('Confirmed')) stepName = 'confirmed';
          if (statusStep.includes('Failed')) stepName = 'failed';

          set((state) => ({
            txStatus: {
              ...state.txStatus,
              active: true,
              step: stepName,
              message: `Soroban Escrow Reject: ${statusStep}`
            }
          }));
        }
      );

      set((state) => {
        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== projectId) return proj;

          const updatedMilestones = proj.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            return {
              ...m,
              status: 'active' as const // reset back to active/pending work state
            };
          });

          const newActivity = {
            id: `act-${Date.now()}`,
            date: result.confirmedTime,
            action: 'Milestone Rejected',
            user: proj.clientName,
            details: `Milestone submission rejected by client. Tx: ${result.txHash.slice(0, 8)}...`
          };

          return {
            ...proj,
            milestones: updatedMilestones,
            activityFeed: [newActivity, ...proj.activityFeed]
          };
        });

        return {
          projects: updatedProjects,
          txStatus: {
            active: true,
            step: 'confirmed',
            message: 'Milestone submission rejected.',
            txHash: result.txHash,
            confirmedTime: result.confirmedTime
          }
        };
      });

      get().addNotification('Milestone submission rejected by client.');
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Reject failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
      throw err;
    }
  },

  disputeMilestone: async (projectId, milestoneId, reason) => {
    const activeAddress = get().walletAddress;
    if (!activeAddress) {
      throw new Error('Please connect your Freighter Wallet.');
    }

    try {
      const onChainProjectId = BigInt(projectId.replace('proj-', ''));
      const milestoneIdx = parseInt(milestoneId.split('-').pop() || '0');

      const result = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'dispute_milestone',
        [
          activeAddress,
          onChainProjectId,
          milestoneIdx,
          reason
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          if (statusStep.includes('Confirmed')) stepName = 'confirmed';
          if (statusStep.includes('Failed')) stepName = 'failed';

          set((state) => ({
            txStatus: {
              ...state.txStatus,
              active: true,
              step: stepName,
              message: `Soroban Escrow Dispute: ${statusStep}`
            }
          }));
        }
      );

      set((state) => {
        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== projectId) return proj;

          const updatedMilestones = proj.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            return {
              ...m,
              status: 'disputed' as const,
              disputeReason: reason
            };
          });

          const newActivity = {
            id: `act-${Date.now()}`,
            date: result.confirmedTime,
            action: 'Dispute Raised',
            user: proj.clientName,
            details: `Dispute opened. Tx: ${result.txHash.slice(0, 8)}...`
          };

          return {
            ...proj,
            milestones: updatedMilestones,
            status: 'disputed' as const,
            activityFeed: [newActivity, ...proj.activityFeed]
          };
        });

        return { 
          projects: updatedProjects,
          txStatus: {
            active: true,
            step: 'confirmed',
            message: 'Milestone dispute opened and funds locked.',
            txHash: result.txHash,
            confirmedTime: result.confirmedTime
          }
        };
      });

      await get().syncBalance();
      get().addNotification('Dispute opened. Milestone funds locked.');
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Dispute failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
      throw err;
    }
  },

  refundClient: async (projectId) => {
    const activeAddress = get().walletAddress;
    if (!activeAddress) {
      throw new Error('Please connect your Freighter Wallet.');
    }

    try {
      const onChainProjectId = BigInt(projectId.replace('proj-', ''));

      const result = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'refund_client',
        [
          activeAddress,
          onChainProjectId
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          if (statusStep.includes('Confirmed')) stepName = 'confirmed';
          if (statusStep.includes('Failed')) stepName = 'failed';

          set((state) => ({
            txStatus: {
              ...state.txStatus,
              active: true,
              step: stepName,
              message: `Soroban Escrow Refund: ${statusStep}`
            }
          }));
        }
      );

      let refundAmt = 0;
      let pTitle = '';

      set((state) => {
        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== projectId) return proj;

          pTitle = proj.title;
          refundAmt = proj.lockedEscrow;

          const newActivity = {
            id: `act-${Date.now()}`,
            date: result.confirmedTime,
            action: 'Client Refunded',
            user: proj.clientName,
            details: `${refundAmt.toLocaleString()} XLM refunded to client. Tx: ${result.txHash.slice(0, 8)}...`
          };

          return {
            ...proj,
            lockedEscrow: 0,
            status: 'completed' as const,
            activityFeed: [newActivity, ...proj.activityFeed]
          };
        });

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'dispute_refund',
          projectTitle: pTitle,
          amount: refundAmt,
          token: 'XLM',
          date: result.confirmedTime,
          txHash: result.txHash,
          status: 'success',
          from: 'AnchorBridge Escrow Vault',
          to: activeAddress
        };

        return {
          projects: updatedProjects,
          transactions: [newTx, ...state.transactions],
          txStatus: {
            active: true,
            step: 'confirmed',
            message: 'Escrow funds successfully refunded to your wallet!',
            txHash: result.txHash,
            confirmedTime: result.confirmedTime
          }
        };
      });

      await get().syncBalance();
      get().addNotification('Escrow funds successfully refunded.');
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Refund failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
      throw err;
    }
  },

  cancelProject: async (projectId) => {
    const activeAddress = get().walletAddress;
    if (!activeAddress) {
      throw new Error('Please connect your Freighter Wallet.');
    }

    try {
      const onChainProjectId = BigInt(projectId.replace('proj-', ''));

      const result = await stellarService.invokeSorobanContract(
        activeAddress,
        ESCROW_CONTRACT_ID,
        'cancel_project',
        [
          activeAddress,
          onChainProjectId
        ],
        (statusStep) => {
          let stepName: TxStatus['step'] = 'preparing';
          if (statusStep.includes('Signature')) stepName = 'signing';
          if (statusStep.includes('Submitting')) stepName = 'submitting';
          if (statusStep.includes('Confirmation')) stepName = 'confirming';
          if (statusStep.includes('Confirmed')) stepName = 'confirmed';
          if (statusStep.includes('Failed')) stepName = 'failed';

          set((state) => ({
            txStatus: {
              ...state.txStatus,
              active: true,
              step: stepName,
              message: `Soroban Escrow Cancellation: ${statusStep}`
            }
          }));
        }
      );

      let refundAmt = 0;
      let pTitle = '';

      set((state) => {
        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== projectId) return proj;

          pTitle = proj.title;
          refundAmt = proj.lockedEscrow;

          const newActivity = {
            id: `act-${Date.now()}`,
            date: result.confirmedTime,
            action: 'Project Cancelled',
            user: proj.clientName,
            details: `Project cancelled. Locked escrow returned to client. Tx: ${result.txHash.slice(0, 8)}...`
          };

          return {
            ...proj,
            lockedEscrow: 0,
            status: 'cancelled' as const,
            activityFeed: [newActivity, ...proj.activityFeed]
          };
        });

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'dispute_refund',
          projectTitle: pTitle,
          amount: refundAmt,
          token: 'XLM',
          date: result.confirmedTime,
          txHash: result.txHash,
          status: 'success',
          from: 'AnchorBridge Escrow Vault',
          to: activeAddress
        };

        return {
          projects: updatedProjects,
          transactions: [newTx, ...state.transactions],
          txStatus: {
            active: true,
            step: 'confirmed',
            message: 'Project cancelled successfully.',
            txHash: result.txHash,
            confirmedTime: result.confirmedTime
          }
        };
      });

      await get().syncBalance();
      get().addNotification('Project cancelled. Escrow refunded.');
    } catch (err: any) {
      set({
        txStatus: {
          active: true,
          step: 'failed',
          message: 'Cancellation failed.',
          txHash: '',
          confirmedTime: '',
          error: err.message
        }
      });
      throw err;
    }
  },

  addComment: (projectId, author, content) => {
    set((state) => {
      const updatedProjects = state.projects.map((proj) => {
        if (proj.id !== projectId) return proj;

        const newComment = {
          id: `c-${Date.now()}`,
          author,
          content,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          avatar: author.substring(0, 1).toUpperCase()
        };

        return {
          ...proj,
          comments: [...proj.comments, newComment]
        };
      });

      return { projects: updatedProjects };
    });
  },

  addNotification: (text) => {
    set((state) => ({
      notifications: [
        {
          id: `notif-${Date.now()}`,
          text,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          read: false
        },
        ...state.notifications
      ]
    }));
  },

  markNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }));
  }
}));
