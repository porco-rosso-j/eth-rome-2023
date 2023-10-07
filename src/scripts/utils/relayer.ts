import {
  RelayerConnectionStatus,
  SelectedRelayer,
  ChainType,
  Chain,
  poll
} from '@railgun-community/shared-models';
import * as relayerClient from "@railgun-community/waku-relayer-client"
import { RelayerConnectionStatusCallback, RelayerTransaction } from "@railgun-community/waku-relayer-client"
import { Optional } from "./type"
const {
  RailgunWakuRelayerClient,
} = relayerClient;

const Goerli: Chain = {
  type: ChainType.EVM,
  id: 5,
};

// const pubSubTopic = '/waku/2/default-waku/proto'
const pubSubTopic = '/waku/2/railgun-relayer';

const relayerOptions = {
  pubSubTopic,
};

let currentChain: Chain;
let currentStatus: RelayerConnectionStatus;

export async function getRelayer(tokenAddress: string) {
  console.log("1")

  const statusCallback: RelayerConnectionStatusCallback = (chain: Chain, status: RelayerConnectionStatus) => {
    currentChain = chain;
    currentStatus = status;
  };

  await RailgunWakuRelayerClient.start(Goerli, relayerOptions, statusCallback)

  console.log("2")

  // Poll until currentStatus is Connected.
  const statusInitialConnection = await poll(
    async () => currentStatus,
    status => status === RelayerConnectionStatus.Connected,
    20,
    20000 / 20, // 20 sec.
  );

  console.log("3")

  if (statusInitialConnection !== RelayerConnectionStatus.Connected) {
    throw new Error('Could not establish initial connection with fees.');
  }

  console.log("4")

  // Submit transaction to RPC.
  // await relaySwap(transaction);
  // Get relayer with lowest fee for a given ERC20 token.
  const selectedRelayer: Optional<SelectedRelayer>
    = await RailgunWakuRelayerClient.findBestRelayer(Goerli, tokenAddress, true)

  console.log("5")

  return selectedRelayer
}

export async function sendTxRailgunRelayer(tx: any, selectedRelayer: Optional<SelectedRelayer>): Promise<string> {

  const nullifeirs: string[] = ['0x012345']

  // Create Relayed transaction and send through selected Relayer.
  const relayerTransaction: RelayerTransaction = await RelayerTransaction.create(
    tx.to,
    tx.data,
    selectedRelayer?.railgunAddress as string,
    selectedRelayer?.tokenFee.feesID as string,
    Goerli,
    nullifeirs,
    BigInt('0x10000'),
    true,
  )

  console.log("6")

  const txHash = await relayerTransaction.send()
  console.log("txHash: ", txHash)

  console.log("7")

  await RailgunWakuRelayerClient.stop();

  return txHash
}