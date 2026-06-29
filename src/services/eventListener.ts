import { rpc, xdr, scValToNative } from 'stellar-sdk';
import { useStore } from '../store/useStore';
import { ESCROW_CONTRACT_ID } from '../config/contracts';

class SorobanEventListener {
  private isPolling = false;
  private lastLedger = 0;
  private timeoutId: any = null;
  private pollInterval = 5000;
  private consecutiveFailures = 0;

  async start() {
    if (this.isPolling) return;
    this.isPolling = true;
    this.consecutiveFailures = 0;
    this.pollInterval = 5000;

    try {
      const server = new rpc.Server('https://soroban-testnet.stellar.org');
      const latest = await server.getLatestLedger();
      this.lastLedger = latest.sequence;
      console.log(`Starting Soroban event listener at ledger ${this.lastLedger}`);

      this.scheduleNextPoll(server);
    } catch (err) {
      console.error('Failed to initialize Soroban event listener. Retrying in 10s:', err);
      this.isPolling = false;
      this.timeoutId = setTimeout(() => this.start(), 10000);
    }
  }

  stop() {
    this.isPolling = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private scheduleNextPoll(server: rpc.Server) {
    if (!this.isPolling) return;

    this.timeoutId = setTimeout(async () => {
      try {
        const eventsResponse = await server.getEvents({
          startLedger: this.lastLedger,
          filters: [
            {
              type: 'contract',
              contractIds: [ESCROW_CONTRACT_ID]
            }
          ],
          limit: 50
        });

        this.consecutiveFailures = 0;
        this.pollInterval = 5000;

        if (eventsResponse.events && eventsResponse.events.length > 0) {
          let maxLedger = this.lastLedger;

          for (const event of eventsResponse.events) {
            if (event.ledger > maxLedger) {
              maxLedger = event.ledger;
            }

            this.processEvent(event);
          }

          // Move the pointer to next ledger
          this.lastLedger = maxLedger + 1;
        }
      } catch (err) {
        this.consecutiveFailures++;
        this.pollInterval = Math.min(60000, Math.round(this.pollInterval * 1.5));
        console.warn(`Error polling Soroban events (consecutive failures: ${this.consecutiveFailures}). Retrying in ${this.pollInterval}ms:`, err);
      } finally {
        this.scheduleNextPoll(server);
      }
    }, this.pollInterval);
  }

  private processEvent(event: any) {
    try {
      const parsedTopics = event.topic.map((t: any) => this.parseScVal(t));
      const parsedValue = this.parseScVal(event.value);

      if (!parsedTopics || parsedTopics.length === 0) return;

      const eventName = parsedTopics[0];
      const projectIdBig = parsedTopics[1];
      if (typeof eventName !== 'string' || projectIdBig === undefined) return;

      const projectIdStr = `proj-${projectIdBig.toString()}`;
      const store = useStore.getState();

      const projectExists = store.projects.some(p => p.id === projectIdStr);

      switch (eventName) {
        case 'project_created': {
          if (!projectExists) {
            store.addNotification(`New project created on-chain: ID ${projectIdBig.toString()}`);
            store.syncBalance();
          }
          break;
        }

        case 'escrow_funded': {
          store.addNotification(`Project ${projectIdStr} has been successfully funded on-chain.`);
          store.syncBalance();
          break;
        }

        case 'milestone_submitted': {
          const idx = Number(parsedValue[0]);
          
          useStore.setState((state) => {
            const projects = state.projects.map(p => {
              if (p.id !== projectIdStr) return p;
              const milestones = p.milestones.map((m, mIdx) => {
                if (mIdx !== idx) return m;
                return { ...m, status: 'submitted' as const };
              });
              return { ...p, milestones };
            });
            return { projects };
          });
          
          store.addNotification(`Milestone ${idx + 1} submitted for Project ${projectIdStr}.`);
          break;
        }

        case 'milestone_approved': {
          const idx = Number(parsedValue[0]);
          
          useStore.setState((state) => {
            const projects = state.projects.map(p => {
              if (p.id !== projectIdStr) return p;
              const milestones = p.milestones.map((m, mIdx) => {
                if (mIdx !== idx) return m;
                return { ...m, status: 'approved' as const };
              });
              
              const allApproved = milestones.every(m => m.status === 'approved');
              return {
                ...p,
                milestones,
                status: allApproved ? 'completed' as const : p.status
              };
            });
            return { projects };
          });

          store.addNotification(`Milestone ${idx + 1} approved for Project ${projectIdStr}.`);
          store.syncBalance();
          break;
        }

        case 'milestone_rejected': {
          const idx = Number(parsedValue[0]);
          
          useStore.setState((state) => {
            const projects = state.projects.map(p => {
              if (p.id !== projectIdStr) return p;
              const milestones = p.milestones.map((m, mIdx) => {
                if (mIdx !== idx) return m;
                return { ...m, status: 'active' as const };
              });
              return { ...p, milestones };
            });
            return { projects };
          });

          store.addNotification(`Milestone ${idx + 1} rejected for Project ${projectIdStr}.`);
          break;
        }

        case 'funds_released': {
          const amount = Number(parsedValue[2]);

          useStore.setState((state) => {
            const projects = state.projects.map(p => {
              if (p.id !== projectIdStr) return p;
              return {
                ...p,
                lockedEscrow: Math.max(0, p.lockedEscrow - amount),
                releasedFunds: p.releasedFunds + amount
              };
            });
            return { projects };
          });
          store.syncBalance();
          break;
        }

        case 'refund_issued': {
          useStore.setState((state) => {
            const projects = state.projects.map(p => {
              if (p.id !== projectIdStr) return p;
              return {
                ...p,
                lockedEscrow: 0,
                status: 'completed' as const
              };
            });
            return { projects };
          });
          store.addNotification(`Refund issued for Project ${projectIdStr}.`);
          store.syncBalance();
          break;
        }

        case 'project_cancelled': {
          useStore.setState((state) => {
            const projects = state.projects.map(p => {
              if (p.id !== projectIdStr) return p;
              return {
                ...p,
                lockedEscrow: 0,
                status: 'cancelled' as const
              };
            });
            return { projects };
          });
          store.addNotification(`Project ${projectIdStr} has been cancelled on-chain.`);
          store.syncBalance();
          break;
        }
      }
    } catch (err) {
      console.warn('Failed to process Soroban event:', err);
    }
  }

  private parseScVal(val: any): any {
    if (!val) return null;
    try {
      if (typeof val === 'string') {
        const parsed = xdr.ScVal.fromXDR(val, 'base64');
        return scValToNative(parsed);
      }
      return scValToNative(val);
    } catch (err) {
      try {
        return scValToNative(val);
      } catch (err2) {
        return val;
      }
    }
  }
}

export const sorobanEventListener = new SorobanEventListener();
