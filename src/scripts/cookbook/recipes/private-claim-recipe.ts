import { NetworkName } from '@railgun-community/shared-models';
import {
  Recipe,
  RecipeConfig,
  StepInput,
  Step,
  WrapBaseTokenStep
} from '@railgun-community/cookbook';
import { PeanutWithdrawStep } from '../steps/peanut-withdraw-step';

export class TestWithdrawRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Peanut Claim Recipe',
    description:
      'withdraw ETH from peanut, convert it for WETH, and shield',
    minGasLimit: 3_100_000n,
  };

  protected readonly contractAddress: string;
  private readonly link:string;
  private readonly recipient:string;

  constructor(contractAddress: string,  _link:string, _recipient:string) {
    super();
    this.contractAddress = contractAddress;
    this.link = _link;
    this.recipient = _recipient;
  }


  protected supportsNetwork(networkName: NetworkName): boolean {
    // return BeefyAPI.supportsNetwork(networkName);
    return NetworkName.EthereumGoerli == networkName
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const {erc20Amounts} = firstInternalStepInput

    return [
      new PeanutWithdrawStep(this.contractAddress, this.link, this.recipient),
      // ApproveERC20SpenderStep
      // ZeroXSwapStep
      new WrapBaseTokenStep(erc20Amounts[0].expectedBalance)
    ];
  }
}