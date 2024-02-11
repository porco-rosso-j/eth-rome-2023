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
	RelayerOptions,
	RelayerTransaction,
	WakuRelayerClient,
} from "@railgun-community/waku-relayer-client-web";
// import {
// 	WakuRelayerClient,
// 	RelayerOptions,
// } from "@railgun-community/waku-relayer-client-web";
import { Optional } from "./type";

import { Wallet, providers } from "ethers5";
const ALCHEMY_GOERLI = process.env.REACT_APP_ALCHEMY_GOERLI;
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
const provider = new providers.JsonRpcProvider(ALCHEMY_GOERLI);
const wallet = new Wallet(PRIVATE_KEY as string, provider);

export const gpRelayerAddr =
	"0zk1qy2qnq90y0dpmchvj6nz9ngcplqpgn05fz56y8sexpudr2ef33cslrv7j6fe3z53l79jgjxl92vjmvyz4429xcuny32y3s7a93x4gypq89tpxuv5dms6jsacv00";
const gpRelayerFeesID = "ko8fupg111w2gqpw";

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

type RelayerDebugger = {
	log: (msg: string) => void;
	error: (error: Error) => void;
};

const relayerDebugger: RelayerDebugger = {
	log: (msg: string) => {
		console.log(msg);
	},
	error: (err: Error) => {
		console.error(err);
	},
};

// const pubSubTopic = '/waku/2/default-waku/proto'
const pubSubTopic = "/waku/2/railgun-relayer";

const relayerOptions: RelayerOptions = {
	pubSubTopic,
	additionalDirectPeers: [
		"/ip4/167.235.62.116/tcp/60000/p2p/16Uiu2HAmAywKTLZ1bhkDYeudGUTdyd4ipwQH9pHWRG2btqbpbWcw",
		"/ip4/167.235.62.116/tcp/8000/ws/p2p/16Uiu2HAmAywKTLZ1bhkDYeudGUTdyd4ipwQH9pHWRG2btqbpbWcw",
	],
};

// const relayerOptions = {
// 	pubSubTopic,
// };
// let wakuClient: WakuRelayerClient;

export async function getRelayer(tokenAddress: string) {
	console.log("1");
	console.log("tokenAddress: ", tokenAddress);

	let currentChain: Chain;
	let currentStatus: RelayerConnectionStatus;
	const statusCallback = (chain: Chain, status: RelayerConnectionStatus) => {
		currentChain = chain;
		currentStatus = status;
	};

	// wakuClient. = 500;
	await WakuRelayerClient.start(
		Goerli,
		relayerOptions,
		statusCallback,
		relayerDebugger
	);

	console.log("started: ", WakuRelayerClient.isStarted());
	console.log("started: ", WakuRelayerClient.getContentTopics());

	// WakuRelayerClient.setAddressFilters([gpRelayerAddr], []);

	console.log("currentChain: ", currentChain);
	console.log("currentStatus: ", currentStatus);

	// await WakuRelayerClient.setChain(Goerli);
	// console.log(
	// 	"await WakuRelayerClient.tryReconnect();: ",
	// 	await WakuRelayerClient.tryReconnect()
	// );

	// Poll until currentStatus is Connected.
	const statusInitialConnection = await poll(
		async () => currentStatus,
		(status) => status === RelayerConnectionStatus.Connected,
		20,
		100000 / 20 // 20 sec.
	);

	// console.log(
	// 	"findAllRelayersForChain: ",
	// 	await WakuRelayerClient.findAllRelayersForChain(Goerli, true)
	// );

	// console.log(
	// 	"findRandomRelayerForToken: ",
	// 	await WakuRelayerClient.findRandomRelayerForToken(
	// 		Goerli,
	// 		tokenAddress,
	// 		true
	// 	)
	// );

	// console.log(
	// 	"findRelayersForToken: ",
	// 	await WakuRelayerClient.findRelayersForToken(Goerli, tokenAddress, true)
	// );

	// console.log("3");
	// console.log("status: ", currentStatus);
	// console.log("statusInitialConnection: ", statusInitialConnection);

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
	selectedRelayer?: SelectedRelayer
): Promise<string> {
	const nullifeirs: string[] = ["0x012345"];

	// let currentChain: Chain;
	// let currentStatus: RelayerConnectionStatus;
	// const statusCallback = (chain: Chain, status: RelayerConnectionStatus) => {
	// 	currentChain = chain;
	// 	currentStatus = status;
	// };

	// await WakuRelayerClient.start(
	// 	Goerli,
	// 	relayerOptions,
	// 	statusCallback,
	// 	relayerDebugger
	// );

	// Create Relayed transaction and send through selected Relayer.
	const relayerTransaction: RelayerTransaction =
		await RelayerTransaction.create(
			TXIDVersion.V2_PoseidonMerkle,
			tx.to,
			tx.data,
			selectedRelayer?.railgunAddress as string,
			selectedRelayer?.tokenFee.feesID as string,
			// gpRelayerAddr,
			// gpRelayerFeesID,
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
