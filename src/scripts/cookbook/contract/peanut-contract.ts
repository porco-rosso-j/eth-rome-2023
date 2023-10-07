import { Contract, ContractTransaction, Provider } from 'ethers';
import artifact from "./IPeanut.json";
import { validateContractAddress } from '../utils/address';
import {ZeroAddress} from "ethers"

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

  deposit(tokenAddress:string, _value:bigint, pubkey:string): Promise<ContractTransaction> {
    return this.contract.makeDeposit.populateTransaction(
      ZeroAddress, 
      0,
      _value,
      0,
      pubkey,
      {value:_value}
      );
    //return popTx;
  }

  withdraw(index:number, recipientAddress:string, recipientAddressHash:string, signature:string): Promise<ContractTransaction> {
    return this.contract.withdrawDeposit.populateTransaction(index, recipientAddress, recipientAddressHash, signature);
  }
}