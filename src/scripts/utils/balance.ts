import {
	refreshBalances,
	fullWalletForID,
	balanceForERC20Token,
} from "@railgun-community/wallet";
import {
	NetworkName,
	NETWORK_CONFIG,
	RailgunWalletInfo,
	TXIDVersion,
} from "@railgun-community/shared-models";

const chainGoerli = NETWORK_CONFIG.Ethereum_Goerli.chain;
//const chainEthereum = NETWORK_CONFIG.Ethereum.chain;

export async function getPrivateBalance(
	railgunWalletInfo: RailgunWalletInfo,
	tokenAddress: string
): Promise<bigint> {
	const railgunWallet = fullWalletForID(railgunWalletInfo.id);
	await refreshBalances(chainGoerli, railgunWallet.id);

	const balance = await balanceForERC20Token(
		TXIDVersion.V2_PoseidonMerkle,
		railgunWallet,
		NetworkName.EthereumGoerli,
		//NetworkName.Ethereum,
		tokenAddress,
		true
	);

	console.log("tokenAddress: ", tokenAddress);
	console.log("balance: ", balance);
	return balance;
}
