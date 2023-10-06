import { Contract, ContractTransaction, Provider } from 'ethers';
import artifact from "./IPeanut.json" assert { type: "json" };
import { validateContractAddress } from '../utils/address';

export class PeanutContract {
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

  deposit(tokenAddress:string, value:bigint, pubkey:string): Promise<ContractTransaction> {
    let popTx = this.contract.makeDeposit.populateTransaction(pubkey, {value:value});
    return popTx;
  }

  withdraw(index:number, recipientAddress:string, recipientAddressHash:string, signature:string): Promise<ContractTransaction> {
    return this.contract.withdraw.populateTransaction(index, recipientAddress, recipientAddressHash, signature);
  }
}