import { 
    refreshRailgunBalances,
    fullWalletForID,
    balanceForERC20Token
 } from '@railgun-community/wallet';
 import {
    NetworkName,
    NETWORK_CONFIG,
    RailgunWalletInfo
  } from '@railgun-community/shared-models';

const chainGoerli = NETWORK_CONFIG.Ethereum_Goerli.chain;

export async function getPrivateBalance(railgunWalletInfo: RailgunWalletInfo, tokenAddress:string):Promise<bigint> {    
    const railgunWallet = await fullWalletForID(railgunWalletInfo.id);
    await refreshRailgunBalances(chainGoerli, railgunWallet.id, false);

    const balance = await balanceForERC20Token(
        railgunWallet,
        NetworkName.EthereumGoerli,
        tokenAddress
    )

    console.log("balance: ", balance)
    return balance
}