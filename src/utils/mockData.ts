export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'active' | 'submitted' | 'approved' | 'disputed';
  dueDate: string;
  submissionText?: string;
  disputeReason?: string;
}

export interface ActivityItem {
  id: string;
  date: string;
  action: string;
  user: string;
  details?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  avatar?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  url: string;
  type: string;
  date: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  client: string;
  clientName: string;
  freelancer: string;
  freelancerName: string;
  totalEscrow: number;
  lockedEscrow: number;
  releasedFunds: number;
  status: 'active' | 'completed' | 'disputed' | 'draft' | 'cancelled';
  dueDate: string;
  category: string;
  milestones: Milestone[];
  activityFeed: ActivityItem[];
  comments: Comment[];
  deliverables: Deliverable[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'release' | 'dispute_refund' | 'dispute_payout';
  projectTitle: string;
  amount: number;
  token: string;
  date: string;
  txHash: string;
  status: 'success' | 'pending' | 'failed';
  from: string;
  to: string;
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Oracle Bridge Soroban Integration',
    description: 'Build a secure oracle connector contract on Soroban to fetch real-world asset price feeds for AnchorBridge liquidity vaults. Includes testing and auditing.',
    client: 'GDA7...ALIC',
    clientName: 'Alice Labs Corp',
    freelancer: 'GBOB...BUILDER',
    freelancerName: 'Bob the Builder',
    totalEscrow: 50000,
    lockedEscrow: 35000,
    releasedFunds: 15000,
    status: 'active',
    dueDate: '2026-08-15',
    category: 'Smart Contracts',
    milestones: [
      {
        id: 'm-1-1',
        title: 'Design Smart Contract Architecture & Spec',
        description: 'Complete architecture diagram and specification document for the oracle contract, signed by both parties.',
        amount: 15000,
        status: 'approved',
        dueDate: '2026-07-05',
        submissionText: 'Here is the approved spec document detailing the data ingestion architecture and contract interfaces.'
      },
      {
        id: 'm-1-2',
        title: 'Deploy Soroban Price Feed Contracts to Testnet',
        description: 'Deploy working contracts to Stellar Testnet (Futurenet) and configure the oracle node feeds.',
        amount: 20000,
        status: 'submitted',
        dueDate: '2026-07-25',
        submissionText: 'The contract has been successfully compiled and deployed to Futurenet. Tx Hash: 8fa76b2c... Price feeds are live and updating every 10 seconds.'
      },
      {
        id: 'm-1-3',
        title: 'Security Audit & Frontend Integration',
        description: 'Resolve audit vulnerabilities and hook up frontend charts to the smart contract getter functions.',
        amount: 15000,
        status: 'active',
        dueDate: '2026-08-15'
      }
    ],
    activityFeed: [
      {
        id: 'act-1-1',
        date: '2026-06-20 10:14',
        action: 'Project Created',
        user: 'Alice Labs Corp',
        details: 'Escrow contract initialized with 50,000 XLM.'
      },
      {
        id: 'act-1-2',
        date: '2026-06-21 14:32',
        action: 'Milestone 1 Submitted',
        user: 'Bob the Builder',
        details: 'Submitted design spec document.'
      },
      {
        id: 'act-1-3',
        date: '2026-06-22 09:15',
        action: 'Milestone 1 Approved & Released',
        user: 'Alice Labs Corp',
        details: '15,000 XLM released to Bob.'
      },
      {
        id: 'act-1-4',
        date: '2026-06-25 18:40',
        action: 'Milestone 2 Submitted',
        user: 'Bob the Builder',
        details: 'Soroban contract deployed on Testnet.'
      }
    ],
    comments: [
      {
        id: 'c-1-1',
        author: 'Alice Labs Corp',
        content: 'Thanks Bob! The specification is very clear. Releasing the first milestone funds now.',
        date: '2026-06-22 09:14',
        avatar: 'A'
      },
      {
        id: 'c-1-2',
        author: 'Bob the Builder',
        content: 'Awesome. I will begin working on the smart contract deployment now. Should have it ready on Testnet by next week.',
        date: '2026-06-22 11:30',
        avatar: 'B'
      }
    ],
    deliverables: [
      {
        id: 'd-1-1',
        name: 'AnchorBridge_Oracle_Spec_v1.0.pdf',
        url: '#',
        type: 'pdf',
        date: '2026-06-21 14:32'
      },
      {
        id: 'd-1-2',
        name: 'Soroban Price-feed contract codebase',
        url: 'https://github.com/anchorbridge/oracle-soroban',
        type: 'github',
        date: '2026-06-25 18:38'
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'DeFi Yield Aggregator Vaults',
    description: 'Implement smart yield routing strategy contracts connecting to XLM/USDC pools on Stellar DEX and automagic interest reinvestment.',
    client: 'GCH4...LUNA',
    clientName: 'Luna Finance',
    freelancer: 'GBOB...BUILDER',
    freelancerName: 'Bob the Builder',
    totalEscrow: 120000,
    lockedEscrow: 120000,
    releasedFunds: 0,
    status: 'disputed',
    dueDate: '2026-09-01',
    category: 'DeFi DeFi',
    milestones: [
      {
        id: 'm-2-1',
        title: 'Core Yield Strategy Contract Development',
        description: 'Complete and deploy yield routing smart contract to Futurenet.',
        amount: 50000,
        status: 'disputed',
        dueDate: '2026-07-10',
        submissionText: 'Deployed yield contract on Testnet. However, the client is raising a dispute claiming that routing calculations are missing some edge cases.',
        disputeReason: 'The calculation for the pool routing is missing the fee path calculations, leading to 1.5% slippage during tests, which is unacceptable for a high-volume vault. The code does not match the specifications.'
      },
      {
        id: 'm-2-2',
        title: 'Auto-Reinvestment Agent & Scheduler',
        description: 'Develop backend off-chain bot that automatically triggers the compounding function.',
        amount: 40000,
        status: 'pending',
        dueDate: '2026-08-01'
      },
      {
        id: 'm-2-3',
        title: 'Frontend Dashboard & Audit',
        description: 'Polished dashboard displaying APY charts and transaction audit history.',
        amount: 30000,
        status: 'pending',
        dueDate: '2026-09-01'
      }
    ],
    activityFeed: [
      {
        id: 'act-2-1',
        date: '2026-06-15 08:00',
        action: 'Project Created',
        user: 'Luna Finance',
        details: 'Escrow contract initialized with 120,000 XLM.'
      },
      {
        id: 'act-2-2',
        date: '2026-06-22 17:15',
        action: 'Milestone 1 Submitted',
        user: 'Bob the Builder',
        details: 'Submitted yield strategy contract code.'
      },
      {
        id: 'act-2-3',
        date: '2026-06-24 10:22',
        action: 'Dispute Raised',
        user: 'Luna Finance',
        details: 'Dispute raised on Milestone 1. Yield calculations cause 1.5% slippage.'
      }
    ],
    comments: [
      {
        id: 'c-2-1',
        author: 'Luna Finance',
        content: 'The contract has high slippage during high volume tests. We cannot release 50,000 XLM for code that loses user funds.',
        date: '2026-06-24 10:24',
        avatar: 'L'
      },
      {
        id: 'c-2-2',
        author: 'Bob the Builder',
        content: 'The spec did not state we had to handle pool depth fluctuations. I implemented the strategy exactly as outlined in page 4 of the spec. I will upload evidence showing it fits the requirements.',
        date: '2026-06-24 12:40',
        avatar: 'B'
      }
    ],
    deliverables: [
      {
        id: 'd-2-1',
        name: 'Yield_Vault_V1_Source.zip',
        url: '#',
        type: 'zip',
        date: '2026-06-22 17:15'
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Soroban NFT Fractionalization Protocol',
    description: 'Develop a smart contract protocol that locks Stellar NFTs and issues fractional ERC20-equivalent Stellar tokens, allowing community shared ownership.',
    client: 'GDAV...ART',
    clientName: 'ArtTech DAO',
    freelancer: 'GEVE...DEVELOPER',
    freelancerName: 'Eve Developer',
    totalEscrow: 35000,
    lockedEscrow: 0,
    releasedFunds: 35000,
    status: 'completed',
    dueDate: '2026-05-30',
    category: 'NFTs',
    milestones: [
      {
        id: 'm-3-1',
        title: 'Fractionalization Smart Contract',
        description: 'Core logic for locking NFTs and minting ERC20-like fractions.',
        amount: 20000,
        status: 'approved',
        dueDate: '2026-05-10',
        submissionText: 'The fractionalizer contract is complete and verified on the blockchain.'
      },
      {
        id: 'm-3-2',
        title: 'Redemption & Vault Re-assembly',
        description: 'Logic to buyout all fractions and redeem the NFT from the contract.',
        amount: 15000,
        status: 'approved',
        dueDate: '2026-05-30',
        submissionText: 'Redemption logic verified and security checked.'
      }
    ],
    activityFeed: [
      {
        id: 'act-3-1',
        date: '2026-05-01 09:00',
        action: 'Project Created',
        user: 'ArtTech DAO',
        details: 'Escrow initialized with 35,000 XLM.'
      },
      {
        id: 'act-3-2',
        date: '2026-05-09 18:22',
        action: 'Milestone 1 Approved & Released',
        user: 'ArtTech DAO',
        details: '20,000 XLM released to Eve Developer.'
      },
      {
        id: 'act-3-3',
        date: '2026-05-28 11:40',
        action: 'Milestone 2 Approved & Released',
        user: 'ArtTech DAO',
        details: '15,000 XLM released. Project Completed.'
      }
    ],
    comments: [
      {
        id: 'c-3-1',
        author: 'ArtTech DAO',
        content: 'Fabulous work, Eve! Smooth execution and clean tests.',
        date: '2026-05-28 11:42',
        avatar: 'A'
      }
    ],
    deliverables: [
      {
        id: 'd-3-1',
        name: 'fractionalizer-soroban-contracts',
        url: 'https://github.com/arttech/fractionalizer',
        type: 'github',
        date: '2026-05-09 12:00'
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'release',
    projectTitle: 'Oracle Bridge Soroban Integration',
    amount: 15000,
    token: 'XLM',
    date: '2026-06-22 09:15',
    txHash: 'cc2d3e1a6b0c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    status: 'success',
    from: 'GDA7...ALIC',
    to: 'GBOB...BUILDER'
  },
  {
    id: 'tx-2',
    type: 'deposit',
    projectTitle: 'Oracle Bridge Soroban Integration',
    amount: 50000,
    token: 'XLM',
    date: '2026-06-20 10:14',
    txHash: '12ef34cd56ab78ef9012cd34ab56ef789012cd34ab56ef789012cd34ab56ef78',
    status: 'success',
    from: 'GDA7...ALIC',
    to: 'AnchorBridge Escrow'
  },
  {
    id: 'tx-3',
    type: 'deposit',
    projectTitle: 'DeFi Yield Aggregator Vaults',
    amount: 120000,
    token: 'XLM',
    date: '2026-06-15 08:00',
    txHash: 'f4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
    status: 'success',
    from: 'GCH4...LUNA',
    to: 'AnchorBridge Escrow'
  },
  {
    id: 'tx-4',
    type: 'release',
    projectTitle: 'Soroban NFT Fractionalization Protocol',
    amount: 20000,
    token: 'XLM',
    date: '2026-05-09 18:22',
    txHash: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    status: 'success',
    from: 'GDAV...ART',
    to: 'GEVE...DEVELOPER'
  },
  {
    id: 'tx-5',
    type: 'release',
    projectTitle: 'Soroban NFT Fractionalization Protocol',
    amount: 15000,
    token: 'XLM',
    date: '2026-05-28 11:40',
    txHash: 'e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    status: 'success',
    from: 'GDAV...ART',
    to: 'GEVE...DEVELOPER'
  }
];
