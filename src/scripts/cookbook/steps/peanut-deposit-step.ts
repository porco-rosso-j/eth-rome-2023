import {
  RecipeERC20Info,
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
  
    private readonly contractAddress: string;
    private readonly amount: number;
  
    constructor(_contractAddress: string, _amount:number) {
      super();
      this.contractAddress = _contractAddress;
      this.amount = _amount;
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

      const password = await peanut.getRandomString(16);
      const pubkey = await peanut.generateKeysFromString(password);

      const contract = new PeanutContract(this.contractAddress);
      const crossContractCall = await contract.deposit(erc20Amounts[0].expectedBalance, pubkey.address); 

      const spentBaseERC20Amount: RecipeERC20AmountRecipient = {
        ...baseToken,
        amount: erc20AmountForStep.expectedBalance,
        recipient: this.contractAddress, // rly?
        // recipient: 'Wrapped Token Contract',
      };

      return {
        crossContractCalls: [crossContractCall],
        spentERC20Amounts: [spentBaseERC20Amount],
        outputERC20Amounts: [],
        outputNFTs: input.nfts,
      };
    }
  }