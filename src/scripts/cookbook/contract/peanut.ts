import { Contract, ContractTransaction, Provider } from 'ethers';
import { validateContractAddress } from '../utils/address';

export class Peanut {
  private readonly contract: Contract;

  constructor(address: string, provider?: Provider) {
    if (!validateContractAddress(address)) {
      throw new Error('Invalid address for the test contract');
    }
    this.contract = new Contract(
      address,
      artifact.abi,
      provider,
    )
  }

  deposit(): Promise<ContractTransaction> {
    return this.contract.deposit.populateTransaction();
  }

  withdraw(amount?:bigint): Promise<ContractTransaction> {
    return this.contract.withdraw.populateTransaction(amount ?? 0n);
  }
}