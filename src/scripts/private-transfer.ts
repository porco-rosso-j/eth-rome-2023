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
	ArtifactDownloader,
	artifactCache,
	getArtifacts,
	artifactGetterDownloadJustInTime,
} from "@railgun-community/wallet";
import {
	NetworkName,
	NETWORK_CONFIG,
	RailgunERC20AmountRecipient,
	RailgunWalletInfo,
	TXIDVersion,
	TransactionGasDetails,
	calculateGasPrice,
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
import { Optional } from "./utils/type";
import { createArtifactStore } from "./utils/artifactStore";

const peanutAddress = "0x891021b34fEDC18E36C015BFFAA64a2421738906";
const chainGoerli = NETWORK_CONFIG.Ethereum_Goerli.chain;

const artifact_strings: string[] = [
	"1x1",
	"1x2",
	"1x3",
	"2x1",
	"2x2",
	"2x3",
	"3x1",
	"4x1",
	"5x1",
	"POI_3x3",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function seeAr() {
	const downloader = new ArtifactDownloader(
		createArtifactStore(), // This is the same artifactStore you are using elsewhere
		false
	);

	console.log("downloader: "), downloader;

	artifact_strings.forEach(async (artifactVariantString) => {
		//sleep(1000);
		await downloader.downloadArtifacts(artifactVariantString);
	});

	// for (let i = 0; i < artifact_strings.length; i++) {
	// 	try {
	// 		const artifacts = await downloader.getDownloadedArtifacts(
	// 			artifact_strings[i]
	// 		);
	// 		console.log("artifacts: ", artifacts);
	// 	} catch (e) {
	// 		console.log("e: ", e);
	// 	}
	// }

	console.log("artifactCache: ", artifactCache);
	console.log(
		"artifactGetterDownloadJustInTime: ",
		artifactGetterDownloadJustInTime
	);
	// console.log("artifactCache: ", await getArtifacts());
}

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
	console.log("feeERC20AmountRecipients: ", feeERC20AmountRecipients);

	const selectedRelayer = await getRelayer(tokenAddr);

	const relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient = {
		tokenAddress: tokenAddr,
		recipientAddress: selectedRelayer?.railgunAddress as string,
		amount: feeERC20AmountRecipients[0].amount,
	};

	const sendWithPublicWallet = false;

	await refreshBalances(chainGoerli, railgunWallet.id);

	const gasDetails: TransactionGasDetails = await getGasDetailsERC20(
		railgunWallet.id,
		encryptionKey,
		[unshieldERC20Amounts],
		[],
		crossContractCalls
	);

	console.log("gasDetails: ", gasDetails);
	const gasPrice = 530000000n;

	console.log("selectedRelayer: ", selectedRelayer);
	const overallBatchMinGasPrice: Optional<bigint> =
		calculateGasPrice(gasDetails);
	console.log("overallBatchMinGasPrice: ", overallBatchMinGasPrice);

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
		sendWithPublicWallet,
		gasPrice,
		gasDetails.gasEstimate,
		() => {}
	);
	const { transaction, preTransactionPOIsPerTxidLeafPerList } =
		await populateProvedCrossContractCalls(
			TXIDVersion.V2_PoseidonMerkle,
			NetworkName.EthereumGoerli,
			railgunWallet.id,
			[unshieldERC20Amounts],
			[],
			[],
			[],
			crossContractCalls,
			relayerFeeERC20AmountRecipient,
			sendWithPublicWallet,
			gasPrice,
			gasDetails
		);

	console.log("transaction: ", transaction);

	const txHash = await sendTxRailgunRelayer(
		transaction,
		selectedRelayer,
		preTransactionPOIsPerTxidLeafPerList
	);

	let peanutLink: string | undefined;

	console.log("txHash :", txHash);

	peanutLink = await getPeanutLink(amount, txHash, deposit.password);
	console.log("peanutLink: ", peanutLink);
	return {
		txHash,
		peanutLink,
	};
}
