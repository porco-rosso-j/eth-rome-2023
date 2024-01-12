import LevelDOWN from "leveldown";
import LevelDB from "level-js";
import { artifactStore } from "./artifactStore";
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
} from "@railgun-community/shared-models";
import { Optional } from "./type";
import { MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI } from "./provider";

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

export const initEngine = () => {
	// const shouldDebug = false;
	startRailgunEngine(
		"test", // walletSource
		db,
		true, //shouldDebug
		artifactStore,
		false, // UseNativeArtifacts
		false,
		["https://poi-node.terminal-wallet.com"],
		undefined
	);

	setLogging();

	setOnBalanceUpdateCallback(MOCK_BALANCES_UPDATE_CALLBACK);
	setOnUTXOMerkletreeScanCallback(merkletreeHistoryScanCallback);
};

export const initEngineNetwork = async () => {
	// Don't wait for async. It will try to load historical events, which takes a while.
	return loadProvider(
		MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
		NetworkName.EthereumGoerli,
		10000 // pollingInterval
	);
};
