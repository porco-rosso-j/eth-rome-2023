import { 
    NetworkName, 
    isDefined,
} from '@railgun-community/shared-models';
import {
  RecipeConfig,
  StepInput,
  Step,
  WrapBaseTokenStep,
  SwapRecipe,
  SwapQuoteData,
  RecipeERC20Info,
  RecipeERC20Amount,
  SwapQuoteParams,
  findFirstInputERC20Amount,
  ApproveERC20SpenderStep,
  //ZeroXSwapStep,
  getIsUnvalidatedRailgunAddress,
} from '@railgun-community/cookbook';
import {ZeroXQuote} from "../zero-x/zero-x-quote"
import {ZeroXSwapStep} from "../steps/zero-x-swap-step"
import {
    MIN_GAS_LIMIT_0X_SWAP,
    MIN_GAS_LIMIT_0X_SWAP_SHIELD,
    MIN_GAS_LIMIT_0X_SWAP_TRANSFER,
} from "../models/zero-x-config"
import {DesignateShieldERC20RecipientStep} from "../steps/designate-shield-erc20-recipient-step"
import { PeanutWithdrawStep } from '../steps/peanut-withdraw-step';
import {Optional} from "../../utils/type"

export class ClaimSwapRecipe extends SwapRecipe {
  readonly config: RecipeConfig = {
    name: 'Peanut Claim Swap Recipe',
    description:
      'withdraw ETH from peanut, convert it for WETH, and shield',
    minGasLimit: MIN_GAS_LIMIT_0X_SWAP,
  };

  protected readonly sellERC20Info: RecipeERC20Info;
  protected readonly buyERC20Info: RecipeERC20Info;

  private readonly slippageBasisPoints: bigint;
  protected readonly destinationAddress: Optional<string>;

  protected readonly contractAddress: string;
  private readonly link:string;
  private readonly recipient:string;
  protected readonly isRailgunDestinationAddress: Optional<boolean>;

  constructor(
    _contractAddress: string,  
    _link:string, 
    _recipient:string,
    sellERC20Info: RecipeERC20Info,
    buyERC20Info: RecipeERC20Info,
    slippageBasisPoints: bigint,
    destinationAddress?: string,
    ) {
    super();
    this.contractAddress = _contractAddress;
    this.link = _link;
    this.recipient = _recipient;
    this.sellERC20Info = sellERC20Info;
    this.buyERC20Info = buyERC20Info;
    this.slippageBasisPoints = slippageBasisPoints;
    this.destinationAddress = destinationAddress;
    if (isDefined(destinationAddress)) {
        this.isRailgunDestinationAddress =
          getIsUnvalidatedRailgunAddress(destinationAddress);
        if (this.isRailgunDestinationAddress) {
          this.config.name += ' and Shield';
          this.config.minGasLimit = MIN_GAS_LIMIT_0X_SWAP_SHIELD;
        } else {
          this.config.name += ' and Transfer';
          this.config.minGasLimit = MIN_GAS_LIMIT_0X_SWAP_TRANSFER;
        }
      }
    }

  protected supportsNetwork(networkName: NetworkName): boolean {
    return NetworkName.EthereumGoerli === networkName
  }

  async getSwapQuote(
    networkName: NetworkName,
    sellERC20Amount: RecipeERC20Amount,
  ): Promise<SwapQuoteData> {
    const quoteParams: SwapQuoteParams = {
      networkName,
      sellERC20Amount,
      buyERC20Info: this.buyERC20Info,
      slippageBasisPoints: this.slippageBasisPoints,
      isRailgun: true,
    };
    return ZeroXQuote.getSwapQuote(quoteParams);
  }

  protected async getInternalSteps(
    firstInternalStepInput: StepInput,
  ): Promise<Step[]> {
    const {erc20Amounts, networkName} = firstInternalStepInput
    const sellERC20Amount = findFirstInputERC20Amount(
        firstInternalStepInput.erc20Amounts,
        this.sellERC20Info,
      );

    console.log("sellERC20Amount: ", sellERC20Amount)

    this.quote = await this.getSwapQuote(networkName, sellERC20Amount);
    //erc20Amounts[1].expectedBalance = this.quote.buyERC20Amount.amount
    //erc20Amounts[1].minBalance = this.quote.minimumBuyAmount
    console.log("quote: ",  this.quote)

    return [
      new PeanutWithdrawStep(this.contractAddress, this.link, this.recipient),
      new WrapBaseTokenStep(erc20Amounts[0].expectedBalance),
      new ApproveERC20SpenderStep(this.quote.spender, sellERC20Amount),
      new ZeroXSwapStep(this.quote, this.sellERC20Info),
      new DesignateShieldERC20RecipientStep(this.destinationAddress!, [
        this.buyERC20Info,
      ])
    ];
  }
}