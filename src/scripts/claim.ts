/*
1: withdraw ETH from peanut
2: swap ETH for ERC20
3: shield ETH
*/

import {
	fullWalletForID,
	generateCrossContractCallsProof,
	populateProvedCrossContractCalls,
	refreshBalances,
} from "@railgun-community/wallet";
import {
	NetworkName,
	NETWORK_CONFIG,
	RailgunERC20Recipient,
	RailgunWalletInfo,
	TXIDVersion,
} from "@railgun-community/shared-models";
import {
	RecipeERC20AmountRecipient,
	RecipeInput,
} from "@railgun-community/cookbook";
import { PrivateClaimRecipe } from "./cookbook/recipes/private-claim-recipe";
import { getPeanutTokenAmountFromLink } from "./utils/peanut";
import { getGasDetailsERC20 } from "./utils/gas";
import { sendTx } from "./utils/relayer";

const peanutAddress = "0x891021b34fEDC18E36C015BFFAA64a2421738906";
const railgunAdaptorAddress = "0x14a57CA7C5c1AD54fB6c642f428d973fcD696ED4";
const WETH_GOERLI = NETWORK_CONFIG.Ethereum_Goerli.baseToken.wrappedAddress;
const chainGoerli = NETWORK_CONFIG.Ethereum_Goerli.chain;

export async function privateClaim(
	railgunWalletInfo: RailgunWalletInfo,
	encryptionKey: string,
	link: string
): Promise<string | undefined> {
	const railgunWallet = await fullWalletForID(railgunWalletInfo.id);
	const railgunAddress = railgunWalletInfo.railgunAddress;

	const deposit = await getPeanutTokenAmountFromLink(link);
	console.log("amount: ", deposit[1]);

	// Inputs that will be unshielded from private balance.
	const shieldERC20Amounts: RecipeERC20AmountRecipient = {
		tokenAddress: WETH_GOERLI,
		decimals: BigInt("0x12"),
		amount: BigInt(deposit[1]),
		recipient: railgunAddress,
		isBaseToken: true,
	};

	const recipeInput: RecipeInput = {
		railgunAddress: railgunAddress,
		networkName: NetworkName.EthereumGoerli,
		erc20Amounts: [shieldERC20Amounts],
		nfts: [],
	};

	const claim = new PrivateClaimRecipe(
		peanutAddress,
		link,
		railgunAdaptorAddress
	); // 10n == 0.1%
	const { crossContractCalls, feeERC20AmountRecipients } =
		await claim.getRecipeOutput(recipeInput, true, false);

	//const selectedRelayer = await getRailgunSmartWalletContractForNetwork(NetworkName.EthereumGoerli)
	// console.log("selectedRelayer?.tokenFee: ", selectedRelayer?.tokenFee)
	//   const relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient = {
	//     tokenAddress: WETH_GOERLI as string,
	//     recipientAddress: selectedRelayer?.address as string,
	//     amount: feeERC20AmountRecipients[0].amount
	//   }

	const railgunERC20Recipient: RailgunERC20Recipient = {
		tokenAddress: shieldERC20Amounts.tokenAddress,
		recipientAddress: shieldERC20Amounts.recipient,
	};

	console.log("crossContractCalls: ", crossContractCalls);
	await refreshBalances(chainGoerli, railgunWallet.id);

	const gasDetails = await getGasDetailsERC20(
		railgunWallet.id,
		encryptionKey,
		[],
		[railgunERC20Recipient],
		crossContractCalls
	);

	const sendWithPublicWallet = true;

	await generateCrossContractCallsProof(
		TXIDVersion.V2_PoseidonMerkle,
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
		BigInt("0x1000"),
		undefined,
		() => {}
	);

	const { transaction } = await populateProvedCrossContractCalls(
		TXIDVersion.V2_PoseidonMerkle,
		NetworkName.EthereumGoerli,
		railgunWallet.id,
		[],
		[],
		[railgunERC20Recipient],
		[],
		crossContractCalls,
		// relayerFeeERC20AmountRecipient,
		undefined,
		sendWithPublicWallet,
		BigInt("0x1000"),
		gasDetails
	);

	console.log("transaction: ", transaction);
	// Submit transaction to RPC.
	const txHash: string | undefined = await sendTx(transaction);
	return txHash;

	// const txHash = await sendTxRailgunRelayer(transaction, selectedRelayer)
	// console.log("txHash: ", txHash)
}
