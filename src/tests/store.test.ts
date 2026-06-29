import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store/useStore';

// Mock the stellarService calls
vi.mock('../services/stellar', () => {
  return {
    stellarService: {
      connect: vi.fn().mockResolvedValue('GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP'),
      checkNetwork: vi.fn().mockResolvedValue('TESTNET'),
      getAccountDetails: vi.fn().mockResolvedValue({ balance: 12000, sequence: '1234' }),
      submitTransaction: vi.fn().mockResolvedValue({ txHash: 'abc', confirmedTime: '2026-06-29 02:00' }),
      invokeSorobanContract: vi.fn().mockResolvedValue({ txHash: 'def', confirmedTime: '2026-06-29 02:05', returnValue: 42n }),
      queryContract: vi.fn().mockResolvedValue(null)
    }
  };
});

describe('Zustand State Store Tests', () => {
  beforeEach(() => {
    // Reset store state before each test if needed
    useStore.setState({
      theme: 'light',
      walletConnected: false,
      walletAddress: '',
      walletBalance: 0,
      user: null,
      notifications: [],
      txStatus: { active: false, step: 'idle', message: '', txHash: '', confirmedTime: '' }
    });
  });

  it('should initialize with correct default state', () => {
    const state = useStore.getState();
    expect(state.theme).toBe('light');
    expect(state.walletConnected).toBe(false);
    expect(state.walletAddress).toBe('');
    expect(state.walletBalance).toBe(0);
    expect(state.user).toBeNull();
  });

  it('should toggle theme and persist in localStorage', () => {
    const store = useStore.getState();
    store.setTheme('dark');
    expect(useStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    store.setTheme('light');
    expect(useStore.getState().theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should handle login and update credentials', async () => {
    const store = useStore.getState();
    await store.login('Alice Client', 'client', 'GDV2UXR6RY2BKV33F3WLZ343S7H3L2D4E5Z6Y7B8C9D0E1F2G3H4I5');
    
    const updatedState = useStore.getState();
    expect(updatedState.walletConnected).toBe(true);
    expect(updatedState.user?.name).toBe('Alice Client');
    expect(updatedState.user?.role).toBe('client');
    expect(updatedState.walletAddress).toBe('GDV2UXR6RY2BKV33F3WLZ343S7H3L2D4E5Z6Y7B8C9D0E1F2G3H4I5');
  });

  it('should clear credentials on logout', async () => {
    const store = useStore.getState();
    await store.login('Bob Builder', 'freelancer', 'GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP');
    
    store.logout();
    const loggedOutState = useStore.getState();
    expect(loggedOutState.user).toBeNull();
    expect(loggedOutState.walletConnected).toBe(false);
    expect(loggedOutState.walletAddress).toBe('');
  });

  it('should manage custom notifications correctly', () => {
    const store = useStore.getState();
    store.addNotification('Test notification text');
    
    let state = useStore.getState();
    expect(state.notifications.length).toBe(1);
    expect(state.notifications[0].text).toBe('Test notification text');
    expect(state.notifications[0].read).toBe(false);

    store.markNotificationsRead();
    state = useStore.getState();
    expect(state.notifications[0].read).toBe(true);
  });

  it('should support resetting txStatus state', () => {
    useStore.setState({
      txStatus: { active: true, step: 'signing', message: 'Signing...', txHash: 'h', confirmedTime: 't' }
    });

    const store = useStore.getState();
    store.resetTxStatus();

    const state = useStore.getState();
    expect(state.txStatus.active).toBe(false);
    expect(state.txStatus.step).toBe('idle');
    expect(state.txStatus.message).toBe('');
  });
});
