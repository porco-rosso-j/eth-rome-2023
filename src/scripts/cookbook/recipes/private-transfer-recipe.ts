import { NetworkName } from '@railgun-community/shared-models';
import {
  Recipe,
  RecipeConfig,
  RecipeERC20Info,
  StepInput,
  Step,
  UnwrapBaseTokenStep
} from '@railgun-community/cookbook';
import { PeanutDepositStep } from '../steps/peanut-deposit-step';

export class PrivateTransferRecipe extends Recipe {
  readonly config: RecipeConfig = {
    name: 'Private Transfer Recipe',
    description:
      'convert WETH to ETH and deposit it to peanut.',
    minGasLimit: 3_100_000n,
  };

  protected readonly contractAddress: string;

  constructor(contractAddress: string) {
    super();
    this.contractAddress = contractAddress;
  }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return NetworkName.EthereumGoerli == networkName
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const {erc20Amounts} = firstInternalStepInput

    return [
      new UnwrapBaseTokenStep(erc20Amounts[0].expectedBalance),
      new PeanutDepositStep(this.contractAddress),
    ];
  }
}