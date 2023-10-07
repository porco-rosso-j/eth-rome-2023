import { 
    fullWalletForID,
    generateCrossContractCallsProof,
    populateProvedCrossContractCalls
  } from '@railgun-community/wallet';
  import {
    NetworkName,
    NETWORK_CONFIG,
    RailgunERC20Recipient,
    RailgunWalletInfo
  } from '@railgun-community/shared-models';
  import {
    RecipeInput,
    ZeroXConfig,
    RecipeERC20Info,
    RecipeERC20Amount
  } from "@railgun-community/cookbook"
  import { ClaimSwapRecipe } from './cookbook/recipes/claim-swap-recipe';
  import { getPeanutTokenAmountFromLink } from "./utils/peanut" 
  import { getGasDetailsERC20 } from './utils/gas';
  import { sendTx} from "./utils/relayer"
  import {ZERO_X_API_KEY} from "./utils/secret"

  const peanutAddress = "0x891021b34fEDC18E36C015BFFAA64a2421738906"
  const railgunAdaptorAddress = "0x14a57CA7C5c1AD54fB6c642f428d973fcD696ED4"
  const WETH_GOERLI = NETWORK_CONFIG.Ethereum_Goerli.baseToken.wrappedAddress;
  const USDC_GOERLI = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
  
  export async function privateClaimSwap(
    railgunWalletInfo: RailgunWalletInfo,
    encryptionKey: string,
    link: string
  ):Promise<string | undefined> {

    const railgunWallet = await fullWalletForID(railgunWalletInfo.id);
    ZeroXConfig.API_KEY = ZERO_X_API_KEY

    const sellERC20Info: RecipeERC20Info = {
        tokenAddress: WETH_GOERLI, 
        decimals: BigInt('0x12'), // 18n
        isBaseToken: true,
    }

    const buyERC20Info: RecipeERC20Info = {
        tokenAddress: USDC_GOERLI, 
        decimals: BigInt('0x6'),
        isBaseToken: false,
    }

    const deposit = await getPeanutTokenAmountFromLink(link)
    console.log("amount: ", deposit[1])
    
    const withdrawERC20Amounts: RecipeERC20Amount = {  
        ...sellERC20Info,
        amount: BigInt(deposit[1]),
        recipient: railgunWalletInfo.railgunAddress,
    };

    const claimSwap = new ClaimSwapRecipe(
        peanutAddress, 
        link, 
        railgunAdaptorAddress, 
        sellERC20Info, 
        buyERC20Info, 
        10n,
        railgunWalletInfo.railgunAddress
    );
  
    const recipeInput: RecipeInput = { 
        railgunAddress: railgunWalletInfo.railgunAddress,
        networkName: NetworkName.EthereumGoerli, 
        erc20Amounts: [withdrawERC20Amounts],
        nfts: [],
    };
  
    const { crossContractCalls, erc20AmountRecipients, feeERC20AmountRecipients } = await claimSwap.getRecipeOutput(recipeInput, true, false);
    console.log("crossContractCalls: ", crossContractCalls)   
    console.log("erc20AmountRecipients: ", erc20AmountRecipients)   
    console.log("feeERC20AmountRecipients: ", feeERC20AmountRecipients)   

    // const selectedRelayer = await getRelayer(WETH_GOERLI)
    // console.log("selectedRelayer?.tokenFee: ", selectedRelayer?.tokenFee)
    // const relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient = {
    //     tokenAddress: selectedRelayer?.tokenAddress as string,
    //     recipientAddress: selectedRelayer?.railgunAddress as string,
    //     amount: feeERC20AmountRecipients[0].amount
    // }
  
    const railgunERC20Recipient : RailgunERC20Recipient = {
        tokenAddress:erc20AmountRecipients[1].tokenAddress,
        recipientAddress: erc20AmountRecipients[1].recipient
    }
  
    console.log("crossContractCalls: ", crossContractCalls)
  
    const gasDetails = await getGasDetailsERC20(
        railgunWallet.id,
        encryptionKey,
        [],
        [railgunERC20Recipient],
        crossContractCalls
    )
  
    const sendWithPublicWallet = true
  
    await generateCrossContractCallsProof(
        NetworkName.EthereumGoerli,
        railgunWallet.id,
        encryptionKey,
        [],
        [],
        [railgunERC20Recipient],
        [],
        crossContractCalls,
        //relayerFeeERC20AmountRecipient,
        undefined,
        sendWithPublicWallet,
        BigInt('0x1000'),
        undefined,
        () => {}
    )
  
    const {transaction} = await populateProvedCrossContractCalls(
        NetworkName.EthereumGoerli,
        railgunWallet.id,
        [],
        [],
        [railgunERC20Recipient],
        [],
        crossContractCalls,
        //relayerFeeERC20AmountRecipient,
        undefined,
        sendWithPublicWallet,
        BigInt('0x1000'),
        gasDetails
    );
  
    console.log("transaction: ", transaction)

    // const txHash = await sendTxRailgunRelayer(transaction, selectedRelayer)
    // console.log("txHash: ", txHash)

    // Submit transaction to RPC.
    const txHash: string | undefined = await sendTx(transaction)
    return txHash;
    
  }
