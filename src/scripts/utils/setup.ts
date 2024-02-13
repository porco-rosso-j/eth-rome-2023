import LevelDOWN from "leveldown";
import LevelDB from "level-js";
import { createArtifactStore } from "./artifactStore";
import {
	startRailgunEngine,
	loadProvider,
	setOnBalanceUpdateCallback,
	setOnUTXOMerkletreeScanCallback,
	BalancesUpdatedCallback,
	setLoggers,
} from "@railgun-community/wallet";
import {
	MerkletreeScanUpdateEvent,
	MerkletreeScanStatus,
	NetworkName,
	POIList,
	POIListType,
} from "@railgun-community/shared-models";
import { Optional } from "./type";
import {
	// MOCK_FALLBACK_PROVIDER_JSON_CONFIG_ETH,
	MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
} from "./provider";

/// constants/variables //
const dbPath = "engine.db";
const db = new LevelDB(dbPath);
let currentMerkletreeScanStatus: Optional<MerkletreeScanStatus>;

/// -------------------- ///
export const MOCK_BALANCES_UPDATE_CALLBACK: BalancesUpdatedCallback = () => {
	// noop
};

export const merkletreeHistoryScanCallback = (
	scanData: MerkletreeScanUpdateEvent
): void => {
	currentMerkletreeScanStatus = scanData.scanStatus;
};

const setLogging = () => {
	const logMessage = console.log;
	const logError = console.error;

	setLoggers(logMessage, logError);
};

export const initEngine = async () => {
	// const shouldDebug = false;
	const MOCK_LIST: POIList = {
		key: "mock key",
		type: POIListType.Gather,
		name: "mock list",
		description: "mock",
	};

	// await startEngine();
	await startRailgunEngine(
		"test", // walletSource
		db,
		true, //shouldDebug
		// artifactStore,
		createArtifactStore("local/dir"),
		//createArtifactStore(),
		false, // UseNativeArtifacts
		false,
		["https://poi-node.terminal-wallet.com"],
		[MOCK_LIST],
		true
	);
	setLogging();

	setOnBalanceUpdateCallback(MOCK_BALANCES_UPDATE_CALLBACK);
	setOnUTXOMerkletreeScanCallback(merkletreeHistoryScanCallback);
};

// export const startEngine = async () => {
// 	// const shouldDebug = false;
// 	startRailgunEngine(
// 		"test", // walletSource
// 		db,
// 		true, //shouldDebug
// 		// artifactStore,
// 		createArtifactStore("local/dir"),
// 		false, // UseNativeArtifacts
// 		false,
// 		["https://poi-node.terminal-wallet.com"],
// 		undefined
// 	);
// };

export const initEngineNetwork = async () => {
	// Don't wait for async. It will try to load historical events, which takes a while.
	const ret = await loadProvider(
		MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
		//MOCK_FALLBACK_PROVIDER_JSON_CONFIG_ETH,
		NetworkName.EthereumGoerli,
		//NetworkName.Ethereum,
		10000 // pollingInterval
	);
	console.log("ret: ", ret);
	console.log("feesSerialized: ", ret.feesSerialized);
	return ret;
};
