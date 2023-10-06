import {
  StepConfig,
  StepInput,
  UnvalidatedStepOutput,
  Step,
  RecipeERC20AmountRecipient,
  getBaseToken,
  compareERC20Info
} from '@railgun-community/cookbook';
import { PeanutContract } from '../contract/peanut-contract'
import peanut from '@squirrel-labs/peanut-sdk';
  export class PeanutDepositStep extends Step {
    readonly config: StepConfig = {
      name: 'Peanut Deposit',
      description: 'Deposits into Peanut Contract.',
    };
  
    protected readonly password:string;
    protected readonly contractAddress: string;
  
    constructor(contractAddress: string, _password:string) {
      super();
      this.contractAddress = contractAddress;
      this.password = _password;
    }
  
    protected async getStepOutput(
      input: StepInput,
    ): Promise<UnvalidatedStepOutput> {
      const { networkName, erc20Amounts } = input;

      const baseToken = getBaseToken(networkName);
      const { erc20AmountForStep } =
      this.getValidInputERC20Amount(
        erc20Amounts,
        erc20Amount => compareERC20Info(erc20Amount, baseToken),
        undefined
      );

      const pubkey = await peanut.generateKeysFromString(this.password);
      const contract = new PeanutContract(this.contractAddress);
      const crossContractCall = await contract.deposit(erc20AmountForStep.tokenAddress, erc20Amounts[0].expectedBalance, pubkey.address); 
      const spentBaseERC20Amount: RecipeERC20AmountRecipient = {
        ...baseToken,
        amount: erc20AmountForStep.expectedBalance,
        recipient: this.contractAddress, // rly?
        //recipient: 'Wrapped Token Contract',
      };

      return {
        crossContractCalls: [crossContractCall],
        spentERC20Amounts: [spentBaseERC20Amount],
        outputERC20Amounts: [],
        outputNFTs: input.nfts,
      };
    }
  }