import {
	RelayerConnectionStatus,
	SelectedRelayer,
	ChainType,
	Chain,
	poll,
	TXIDVersion,
} from "@railgun-community/shared-models";
import {
	RelayerConnectionStatusCallback,
	RelayerTransaction,
	WakuRelayerClient,
} from "@railgun-community/waku-relayer-client-web";
import { Optional } from "./type";

import { Wallet, providers } from "ethers5";
const ALCHEMY_GOERLI = process.env.REACT_APP_ALCHEMY_GOERLI;
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
const provider = new providers.JsonRpcProvider(ALCHEMY_GOERLI);
const wallet = new Wallet(PRIVATE_KEY as string, provider);

export async function sendTx(transaction: any): Promise<string> {
	const res = await wallet.sendTransaction(transaction);
	console.log("res :", res?.hash);
	await res?.wait();
	return res?.hash;
}

const Goerli: Chain = {
	type: ChainType.EVM,
	id: 5,
};

// const pubSubTopic = '/waku/2/default-waku/proto'
const pubSubTopic = "/waku/2/railgun-relayer";

// const relayerOptions: RelayerOptions = {
// 	pubSubTopic: "/waku/2/railgun-relayer",
// 	additionalDirectPeers: [
// 	  "/dns4/relayerv4.wecamefromapes.com/tcp/8000/wss/p2p/16Uiu2HAmCMBVq9am26T61B7FyZ6JbEDusH4c7M7AYVMwNnRuP2cg",
// 	],
//   };

const relayerOptions = {
	pubSubTopic,
};

let currentChain: Chain;
let currentStatus: RelayerConnectionStatus;

export async function getRelayer(tokenAddress: string) {
	console.log("1");
	console.log("tokenAddress: ", tokenAddress);

	const statusCallback: RelayerConnectionStatusCallback = (
		chain: Chain,
		status: RelayerConnectionStatus
	) => {
		currentChain = chain;
		currentStatus = status;
	};

	console.log("currentChain: ", currentChain);

	console.log("statusCallback: ", statusCallback);

	WakuRelayerClient.pollDelay = 500;
	await WakuRelayerClient.start(Goerli, relayerOptions, statusCallback);

	console.log("2");

	// Poll until currentStatus is Connected.
	const statusInitialConnection = await poll(
		async () => currentStatus,
		(status) => status === RelayerConnectionStatus.Connected,
		20,
		60000 / 20 // 20 sec.
	);

	console.log("3");
	console.log(
		"RelayerConnectionStatus.Connected: ",
		RelayerConnectionStatus.Connected
	);
	console.log("statusInitialConnection: ", statusInitialConnection);

	if (statusInitialConnection !== RelayerConnectionStatus.Connected) {
		throw new Error("Could not establish initial connection with fees.");
	}

	console.log("4");

	// Submit transaction to RPC.
	// await relaySwap(transaction);
	// Get relayer with lowest fee for a given ERC20 token.
	const selectedRelayer: Optional<SelectedRelayer> =
		await WakuRelayerClient.findBestRelayer(Goerli, tokenAddress, true);

	console.log("selectedRelayer: ", selectedRelayer);
	console.log("5");

	return selectedRelayer;
}

export async function sendTxRailgunRelayer(
	tx: any,
	selectedRelayer: SelectedRelayer
): Promise<string> {
	const nullifeirs: string[] = ["0x012345"];

	// Create Relayed transaction and send through selected Relayer.
	const relayerTransaction: RelayerTransaction =
		await RelayerTransaction.create(
			TXIDVersion.V2_PoseidonMerkle,
			tx.to,
			tx.data,
			selectedRelayer?.railgunAddress as string,
			selectedRelayer?.tokenFee.feesID as string,
			Goerli,
			nullifeirs,
			BigInt("0x10000"),
			true,
			{}
		);

	console.log("6");

	const txHash = await relayerTransaction.send();
	console.log("txHash: ", txHash);

	console.log("7");

	await WakuRelayerClient.stop();

	return txHash;
}
