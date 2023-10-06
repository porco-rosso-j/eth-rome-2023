  import {
    StepConfig,
    StepInput,
    UnvalidatedStepOutput,
    Step,
    getBaseToken,
    StepOutputERC20Amount,
    compareERC20Info,
} from '@railgun-community/cookbook';
import {getBytes} from 'ethers';
import { PeanutContract } from '../contract/peanut-contract'
import peanut from '@squirrel-labs/peanut-sdk';
  
  export class PeanutWithdrawStep extends Step {
    readonly config: StepConfig = {
      name: 'Peanut Withdraw',
      description: 'Withdraws from ETH Peanut.',
    };
  
    private readonly contractAddress:string;
    private readonly link:string;
    private readonly recipient:string;

    // "0x891021b34fEDC18E36C015BFFAA64a2421738906"
  
    constructor(_contractAddress: string, _link:string, _recipient:string) {
      super();
      this.contractAddress = _contractAddress;
      this.link = _link;
      this.recipient = _recipient;
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
  
        const contract = new PeanutContract(this.contractAddress);
        const params = peanut.getParamsFromLink(this.link)
    
        const keys = peanut.generateKeysFromString(params.password)
        const addressHashEIP191 = peanut.solidityHashBytesEIP191(
            getBytes(peanut.solidityHashAddress(this.recipient))
            )
        const signature = await peanut.signAddress(this.recipient, keys.privateKey)

        const crossContractCall = await contract.withdraw(
            params.depositIdx,
            this.recipient,
            addressHashEIP191,
            signature
            );
  
        const wrappedBaseERC20Amount: StepOutputERC20Amount = {
          ...erc20AmountForStep,
          isBaseToken: true,
          expectedBalance: erc20AmountForStep.expectedBalance,
          minBalance: erc20AmountForStep.minBalance,
        };
  
        return {
          crossContractCalls: [crossContractCall],
          spentERC20Amounts: [],
          outputERC20Amounts: [wrappedBaseERC20Amount],
          outputNFTs: input.nfts,
        };
      }
  }