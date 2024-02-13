/*
1: unshield ERC20
2: approve dex
3: swap ERC20 for ETH
4: deposit ETH to peanut
*/

import {
	fullWalletForID,
	refreshBalances,
	generateCrossContractCallsProof,
	populateProvedCrossContractCalls,
} from "@railgun-community/wallet";
import {
	NetworkName,
	NETWORK_CONFIG,
	RailgunERC20AmountRecipient,
	RailgunWalletInfo,
	TXIDVersion,
} from "@railgun-community/shared-models";
import { RecipeERC20Amount, RecipeInput } from "@railgun-community/cookbook";
import { PrivateTransferRecipe } from "./cookbook/recipes/private-transfer-recipe";
import { getGasDetailsERC20, setRailgunGas } from "./utils/gas";
import { getPeanutLink } from "./utils/peanut";
import {
	getRelayer,
	gpRelayerAddr,
	sendTx,
	sendTxRailgunRelayer,
} from "./utils/relayer";

const peanutAddress = "0x891021b34fEDC18E36C015BFFAA64a2421738906";
const chainGoerli = NETWORK_CONFIG.Ethereum_Goerli.chain;

// TODO1: should return link
export async function privateTransfer(
	railgunWalletInfo: RailgunWalletInfo,
	encryptionKey: string,
	tokenAddr: string,
	amount: number
): Promise<{
	txHash: string;
	peanutLink: string;
}> {
	console.log("encryptionKey: ", encryptionKey);
	//await setRailgunGas();

	const railgunWallet = fullWalletForID(railgunWalletInfo.id);
	const railgunAddress = railgunWalletInfo.railgunAddress;

	// Inputs that will be unshielded from private balance.
	const unshieldERC20Amounts: RecipeERC20Amount = {
		tokenAddress: tokenAddr,
		decimals: BigInt("0x12"),
		amount: BigInt(amount * 1e18),
	};

	const recipeInput: RecipeInput = {
		railgunAddress: railgunAddress,
		networkName: NetworkName.EthereumGoerli,
		erc20Amounts: [unshieldERC20Amounts],
		nfts: [],
	};

	const deposit = new PrivateTransferRecipe(peanutAddress);
	const { crossContractCalls, feeERC20AmountRecipients } =
		await deposit.getRecipeOutput(recipeInput, false, true);
	console.log("crossContractCalls: ", crossContractCalls);

	const selectedRelayer = await getRelayer(tokenAddr);

	const relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient = {
		tokenAddress: tokenAddr,
		recipientAddress: selectedRelayer?.railgunAddress as string,
		// recipientAddress: gpRelayerAddr,
		amount: feeERC20AmountRecipients[0].amount,
	};

	const sendWithPublicWallet = false;

	// console.log("relayerFeeERC20AmountRecipient: ", relayerFeeERC20AmountRecipient)

	await refreshBalances(chainGoerli, railgunWallet.id);

	const gasDetails = await getGasDetailsERC20(
		railgunWallet.id,
		encryptionKey,
		[unshieldERC20Amounts],
		[],
		crossContractCalls
	);

	console.log("selectedRelayer: ", selectedRelayer);

	await generateCrossContractCallsProof(
		TXIDVersion.V2_PoseidonMerkle,
		NetworkName.EthereumGoerli,
		railgunWallet.id,
		encryptionKey,
		[unshieldERC20Amounts],
		[],
		[],
		[],
		crossContractCalls,
		relayerFeeERC20AmountRecipient,
		// undefined,
		sendWithPublicWallet,
		BigInt("0x1000"),
		undefined,
		() => {}
	);

	const { transaction } = await populateProvedCrossContractCalls(
		TXIDVersion.V2_PoseidonMerkle,
		NetworkName.EthereumGoerli,
		railgunWallet.id,
		[unshieldERC20Amounts],
		[],
		[],
		[],
		crossContractCalls,
		relayerFeeERC20AmountRecipient,
		// undefined,
		sendWithPublicWallet,
		BigInt("0x1000"),
		gasDetails
	);

	console.log("transaction: ", transaction);

	const txHash = await sendTxRailgunRelayer(transaction, selectedRelayer);
	//const txHash = await sendTxRailgunRelayer(transaction);
	//const txHash: string | undefined = await sendTx(transaction);
	//await sendTx(transaction)

	let peanutLink: string | undefined;

	console.log("txHash :", txHash);

	peanutLink = await getPeanutLink(amount, txHash, deposit.password);
	console.log("peanutLink: ", peanutLink);
	return {
		txHash,
		peanutLink,
	};
}
