import { ZeroXQuote } from "../cookbook/zero-x/zero-x-quote"
import {
    NetworkName,
    NETWORK_CONFIG
} from '@railgun-community/shared-models';
import { 
    ZeroXConfig,
    RecipeERC20Amount,
    RecipeERC20Info
} from "@railgun-community/cookbook"
import {SwapQuoteParams} from "../cookbook/models/export-models"

const WETH_GOERLI = NETWORK_CONFIG.Ethereum_Goerli.baseToken.wrappedAddress;
const USDC_GOERLI = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"

export async function quoteWETHtoUSDC(amount: number):Promise<number> {
    ZeroXConfig.API_KEY = process.env.REACT_APP_ZERO_X_API_KEY;

    const sellERC20Info: RecipeERC20Info = {
        tokenAddress: WETH_GOERLI, 
        decimals: BigInt('0x12'),
        isBaseToken: true,
    }

    const buyERC20Info: RecipeERC20Info = {
        tokenAddress: USDC_GOERLI, 
        decimals: BigInt('0x6'),
        isBaseToken: false
    }
    
    const sellERC20Amount: RecipeERC20Amount = {
        ...sellERC20Info,
        amount:  BigInt(amount*1e18),
    }

    const swapQuoteParam:SwapQuoteParams = {
        networkName: NetworkName.EthereumGoerli,
        sellERC20Amount: sellERC20Amount,
        buyERC20Info: buyERC20Info,
        slippageBasisPoints: 10n,
        isRailgun: true
    }
    
    const ret = await ZeroXQuote.getSwapQuote(swapQuoteParam)
    console.log("ret: ", ret)

    const output = Math.floor((Number(ret.buyERC20Amount.amount) / 1e12))
    console.log("output: ", output)
    return output
}