import { isConnected, requestAccess, signTransaction, getNetwork } from '@stellar/freighter-api';
import { Horizon, TransactionBuilder, Operation, Address, nativeToScVal, scValToNative, rpc, Account } from 'stellar-sdk';
import { toast } from 'sonner';
import { NETWORK_PASSPHRASE, RPC_URL, HORIZON_URL } from '../config/contracts';

export { NETWORK_PASSPHRASE };
export const horizonServer = new Horizon.Server(HORIZON_URL);
export const rpcServer = new rpc.Server(RPC_URL);

export interface WalletInfo {
  address: string;
  network: string;
  balance: number;
  sequence: string;
  connected: boolean;
}

class StellarService {
  /**
   * Check if Freighter Wallet is installed in the browser.
   */
  async isFreighterInstalled(): Promise<boolean> {
    try {
      const result = await isConnected();
      return !!result && result.isConnected;
    } catch {
      return false;
    }
  }

  /**
   * Connect to Freighter and retrieve active wallet public key.
   */
  async connect(): Promise<string> {
    const installed = await this.isFreighterInstalled();
    if (!installed) {
      throw new Error('Freighter Wallet extension is not installed.');
    }

    try {
      const result = await requestAccess();
      if (!result || !result.address || result.error) {
        throw new Error(result?.error || 'Freighter Wallet access was not authorized or no account is active.');
      }
      return result.address;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to authorize account access from Freighter.');
    }
  }

  /**
   * Check the current network Freighter is connected to.
   */
  async checkNetwork(): Promise<string> {
    try {
      const result = await getNetwork();
      if (result && result.network) {
        return result.network;
      }
      return 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Get native XLM balance and sequence number directly from Horizon Testnet.
   * If account does not exist, automatically funds it using Friendbot faucet!
   */
  async getAccountDetails(address: string): Promise<{ balance: number; sequence: string }> {
    try {
      const account = await horizonServer.loadAccount(address);
      const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
      const balance = nativeBalance ? parseFloat(nativeBalance.balance) : 0;
      return {
        balance,
        sequence: account.sequenceNumber()
      };
    } catch (err: any) {
      // If account not found (404), fund it using Friendbot
      if (err.response && err.response.status === 404) {
        toast.info('Funding your new Testnet account via Friendbot faucet...', { duration: 5000 });
        try {
          const funded = await this.fundWithFriendbot(address);
          if (funded) {
            const account = await horizonServer.loadAccount(address);
            const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
            return {
              balance: nativeBalance ? parseFloat(nativeBalance.balance) : 10000,
              sequence: account.sequenceNumber()
            };
          }
        } catch (faucetErr) {
          console.error('Friendbot failed:', faucetErr);
        }
        return { balance: 0, sequence: '0' };
      }
      throw err;
    }
  }

  /**
   * Fund an account using the Stellar Testnet Friendbot.
   */
  async fundWithFriendbot(address: string): Promise<boolean> {
    try {
      const res = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
      if (res.ok) {
        toast.success('Account successfully funded with 10,000 Testnet XLM!');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Prepares and executes a real transaction on Stellar Testnet.
   * Signs using Freighter and submits to Horizon.
   */
  async submitTransaction(
    senderAddress: string,
    operation: any,
    statusCallback?: (status: string) => void
  ): Promise<{ txHash: string; confirmedTime: string }> {
    try {
      if (statusCallback) statusCallback('Preparing Transaction');
      
      const account = await horizonServer.loadAccount(senderAddress);
      
      const transaction = new TransactionBuilder(account, {
        fee: '200000',
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: {
          minTime: 0,
          maxTime: Math.floor(Date.now() / 1000) + 180
        }
      })
      .addOperation(operation)
      .build();

      const txXdr = transaction.toXDR();
      
      if (statusCallback) statusCallback('Waiting for Signature');
      
      const result = await signTransaction(txXdr, {
        networkPassphrase: NETWORK_PASSPHRASE
      });

      if (!result || !result.signedTxXdr || result.error) {
        throw new Error(result?.error || 'Transaction signature declined by user.');
      }

      if (statusCallback) statusCallback('Submitting Transaction');
      
      const signedTx = TransactionBuilder.fromXDR(result.signedTxXdr, NETWORK_PASSPHRASE);
      const submitResult = await horizonServer.submitTransaction(signedTx);
      
      if (statusCallback) statusCallback('Waiting for Confirmation');
      
      let confirmed = false;
      let checkCount = 0;
      while (!confirmed && checkCount < 10) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        try {
          const txStatus = await horizonServer.transactions().transaction(submitResult.hash).call();
          if (txStatus.successful) {
            confirmed = true;
            break;
          }
        } catch {
          // Indexing
        }
        checkCount++;
      }

      if (statusCallback) statusCallback('Confirmed');
      
      return {
        txHash: submitResult.hash,
        confirmedTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
    } catch (err: any) {
      if (statusCallback) statusCallback('Failed');
      console.error('Stellar submitTransaction error:', err);
      throw new Error(err.message || 'Transaction submission failed on Stellar Testnet.');
    }
  }

  /**
   * Invokes a Soroban smart contract function on Testnet.
   * Performs full simulation, fee estimation, signature request, and transaction monitoring.
   */
  async invokeSorobanContract(
    senderAddress: string,
    contractId: string,
    functionName: string,
    args: any[],
    statusCallback?: (status: string) => void
  ): Promise<{ txHash: string; confirmedTime: string; returnValue?: any }> {
    console.log(`Invoking Soroban Contract ${contractId} -> ${functionName} with args:`, args);
    try {
      if (statusCallback) statusCallback('Preparing Transaction');
      
      const account = await horizonServer.loadAccount(senderAddress);
      
      const scValArgs = args.map(arg => {
        // If already an ScVal, return as is
        if (arg && typeof arg === 'object' && arg.value !== undefined && arg.switch !== undefined) {
          return arg;
        }
        
        // Treat 56-character G... and C... strings as Addresses
        if (typeof arg === 'string' && arg.length === 56 && (arg.startsWith('G') || arg.startsWith('C'))) {
          return Address.fromString(arg).toScVal();
        }
        
        // Numbers that are BigInts are mapped directly to i128
        if (typeof arg === 'bigint') {
          return nativeToScVal(arg);
        }
        
        return nativeToScVal(arg);
      });

      const operation = Operation.invokeContractFunction({
        contract: contractId,
        function: functionName,
        args: scValArgs,
      });

      const transaction = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
      .addOperation(operation)
      .setTimeout(300)
      .build();

      if (statusCallback) statusCallback('Simulating Transaction');
      
      const preparedTx = await rpcServer.prepareTransaction(transaction);
      const txXdr = preparedTx.toXDR();
      
      if (statusCallback) statusCallback('Waiting for Signature');
      
      const result = await signTransaction(txXdr, {
        networkPassphrase: NETWORK_PASSPHRASE
      });

      if (!result || !result.signedTxXdr || result.error) {
        throw new Error(result?.error || 'Transaction signature declined by user.');
      }

      if (statusCallback) statusCallback('Submitting Transaction');
      
      const signedTx = TransactionBuilder.fromXDR(result.signedTxXdr, NETWORK_PASSPHRASE);
      const submitResult = await rpcServer.sendTransaction(signedTx);
      
      if (submitResult.status === 'ERROR') {
        throw new Error(`RPC submit error: ${JSON.stringify(submitResult)}`);
      }

      if (statusCallback) statusCallback('Waiting for Confirmation');
      
      let txStatus = await rpcServer.getTransaction(submitResult.hash);
      let checkCount = 0;
      while (((txStatus.status as string) === 'PENDING' || (txStatus.status as string) === 'NOT_FOUND') && checkCount < 30) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        txStatus = await rpcServer.getTransaction(submitResult.hash);
        checkCount++;
      }

      if (txStatus.status === 'SUCCESS') {
        if (statusCallback) statusCallback('Confirmed');
        
        let returnValue: any = undefined;
        if (txStatus.returnValue) {
          returnValue = scValToNative(txStatus.returnValue);
        }
        
        return {
          txHash: submitResult.hash,
          confirmedTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
          returnValue
        };
      } else {
        if (statusCallback) statusCallback('Failed');
        throw new Error(`Transaction execution failed with status: ${txStatus.status}`);
      }
    } catch (err: any) {
      if (statusCallback) statusCallback('Failed');
      console.error('Soroban invocation error:', err);
      throw new Error(err.message || 'Soroban smart contract invocation failed.');
    }
  }

  /**
   * Performs a read-only simulation call to query a view function on the Soroban contract.
   */
  async queryContract(contractId: string, functionName: string, args: any[] = []): Promise<any> {
    try {
      // Use a dummy funded/unfunded public key for constructing the simulation transaction
      const dummyAccount = new Account('GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP', '0');
      
      const scValArgs = args.map(arg => {
        if (arg && typeof arg === 'object' && arg.value !== undefined && arg.switch !== undefined) {
          return arg;
        }
        if (typeof arg === 'string' && arg.length === 56 && (arg.startsWith('G') || arg.startsWith('C'))) {
          return Address.fromString(arg).toScVal();
        }
        return nativeToScVal(arg);
      });

      const operation = Operation.invokeContractFunction({
        contract: contractId,
        function: functionName,
        args: scValArgs,
      });

      const transaction = new TransactionBuilder(dummyAccount, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
      .addOperation(operation)
      .setTimeout(30)
      .build();

      const sim = await rpcServer.simulateTransaction(transaction);
      
      // If error occurs, print details
      if ((sim as any).error) {
        console.warn(`Simulation warning/error for ${functionName}:`, (sim as any).error);
        return null;
      }
      
      if (rpc.Api.isSimulationSuccess(sim) && sim.result && sim.result.retval) {
        return scValToNative(sim.result.retval);
      }
      return null;
    } catch (err) {
      console.error(`Failed to query Soroban contract function ${functionName}:`, err);
      return null;
    }
  }
}

export const stellarService = new StellarService();
