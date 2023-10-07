/*
1: unshield ERC20
2: approve dex
3: swap ERC20 for ETH
4: deposit ETH to peanut
*/

import { 
    fullWalletForID,
    refreshRailgunBalances,
    generateCrossContractCallsProof,
    populateProvedCrossContractCalls
  } from '@railgun-community/wallet';
  import {
    NetworkName,
    NETWORK_CONFIG,
    RailgunERC20AmountRecipient,
    RailgunWalletInfo,
  } from '@railgun-community/shared-models';
  import {
    RecipeERC20Amount,
    RecipeInput
  } from "@railgun-community/cookbook"
  import { PrivateTransferRecipe } from './cookbook/recipes/private-transfer-recipe';
  import { getGasDetailsERC20 } from './utils/gas';
  import {getPeanutLink} from "./utils/peanut"
  import {sendTxRailgunRelayer, getRelayer} from "./utils/relayer"
  
  const peanutAddress = "0x891021b34fEDC18E36C015BFFAA64a2421738906"
  const chainGoerli = NETWORK_CONFIG.Ethereum_Goerli.chain;
  
  // TODO1: should return link
  export async function privateTransfer(
    railgunWalletInfo:RailgunWalletInfo, 
    encryptionKey:string, 
    tokenAddr:string, 
    amount:number
    ):Promise<string>{

    /* TODO2: this initialization part should be moved out to somewhere else in browser
    initEngine();
    await initEngineNetwork();
  
    // @ts-ignore
    getProver().setSnarkJSGroth16(groth16 as SnarkJSGroth16);
  
    const encryptionKey = await pbkdf2(secret, "0x0", 1000000);
  
    const railgunWalletInfo = await createRailgunWallet(
        encryptionKey,
        mnemonic,
        undefined, // creationBlockNumbers
      );
    
    if (!railgunWalletInfo) {
        throw new Error('Expected railgunWalletInfo');
    }

    await setRailgunGas()
    */ /// 

    const railgunWallet = await fullWalletForID(railgunWalletInfo.id);
    const railgunAddress = railgunWalletInfo.railgunAddress
  
    // Inputs that will be unshielded from private balance.
    const unshieldERC20Amounts: RecipeERC20Amount = {  
        tokenAddress: tokenAddr, 
        decimals: BigInt('0x12'), 
        amount: BigInt(amount*1e18)
    };
  
    const recipeInput: RecipeInput = { 
        railgunAddress: railgunAddress,
        networkName: NetworkName.EthereumGoerli, 
        erc20Amounts: [unshieldERC20Amounts],
        nfts: [],
    };
  
    const deposit = new PrivateTransferRecipe(peanutAddress);
    const { crossContractCalls, feeERC20AmountRecipients } = await deposit.getRecipeOutput(recipeInput, false, true);
    console.log("crossContractCalls: ", crossContractCalls)
  
    const selectedRelayer = await getRelayer(tokenAddr)
    const relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient = {
        tokenAddress: selectedRelayer?.tokenAddress as string,
        recipientAddress: selectedRelayer?.railgunAddress as string,
        amount: feeERC20AmountRecipients[0].amount
    }
  
    const sendWithPublicWallet = false
    
    console.log("relayerFeeERC20AmountRecipient: ", relayerFeeERC20AmountRecipient)
  
    await refreshRailgunBalances(chainGoerli, railgunWallet.id, false);
    
    const gasDetails = await getGasDetailsERC20(
        railgunWallet.id,
        encryptionKey,
        [unshieldERC20Amounts],
        [],
        crossContractCalls
    )
  
    await generateCrossContractCallsProof(
        NetworkName.EthereumGoerli,
        railgunWallet.id,
        encryptionKey,
        [unshieldERC20Amounts],
        [],
        [],
        [],
        crossContractCalls,
        relayerFeeERC20AmountRecipient,
        sendWithPublicWallet,
        BigInt('0x1000'),
        undefined,
        () => {}
    )
  
    const {transaction} = await populateProvedCrossContractCalls(
        NetworkName.EthereumGoerli,
        railgunWallet.id,
        [unshieldERC20Amounts],
        [],
        [],
        [],
        crossContractCalls,
        relayerFeeERC20AmountRecipient,
        sendWithPublicWallet,
        BigInt('0x1000'),
        gasDetails
    );
  
    console.log("transaction: ", transaction)
  
    const txHash = await sendTxRailgunRelayer(transaction, selectedRelayer)
    
    let peanutLink: string | undefined;
    await setTimeout(async () => {  
       peanutLink = await getPeanutLink(amount, txHash, deposit.password)
    }, 20000);
  
    console.log("peanutLink: ", peanutLink)
    return peanutLink as string
  }