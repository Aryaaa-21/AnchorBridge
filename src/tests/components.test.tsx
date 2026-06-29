import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { Wallet } from '../pages/Wallet';
import { SmartContract } from '../pages/SmartContract';
import { CreateProject } from '../pages/CreateProject';
import { Profile } from '../pages/Profile';
import { useStore } from '../store/useStore';

if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() { }
    };
  };
}

describe('React Page Component Tests', () => {
  it('renders Landing page content correctly', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
    expect(screen.getByText(/Trustless Milestone Escrow on Stellar/i)).toBeInTheDocument();
    expect(screen.getByText(/Securing freelance collaboration/i)).toBeInTheDocument();
  });

  it('renders Wallet page disconnected state by default', () => {
    useStore.setState({ walletConnected: false });
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );
    expect(screen.getByText(/Freighter Wallet Disconnected/i)).toBeInTheDocument();
  });

  it('renders Wallet page connected state details', () => {
    useStore.setState({
      walletConnected: true,
      walletAddress: 'GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP',
      walletBalance: 12500,
      projects: [],
      transactions: []
    });
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );
    expect(screen.getByText(/12,500/i)).toBeInTheDocument();
    expect(screen.getByText(/Connected to Stellar Testnet/i)).toBeInTheDocument();
  });

  it('renders SmartContract telemetry and registry specifications', () => {
    render(
      <MemoryRouter>
        <SmartContract />
      </MemoryRouter>
    );
    expect(screen.getByText(/Soroban smart contract telemetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time telemetry and ledger auditing/i)).toBeInTheDocument();
  });

  it('renders CreateProject wizard headers', () => {
    render(
      <MemoryRouter>
        <CreateProject />
      </MemoryRouter>
    );
    expect(screen.getByText(/Initialize Trustless Escrow/i)).toBeInTheDocument();
  });

  it('renders Profile page details and statistics', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    expect(screen.getByText(/Member Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Review reputation score/i)).toBeInTheDocument();
  });
});
