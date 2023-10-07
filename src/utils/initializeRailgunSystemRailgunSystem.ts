import { initEngine, initEngineNetwork } from "src/scripts/utils/setup"
import {
  pbkdf2,
  createRailgunWallet,
  SnarkJSGroth16,
  getProver,
  // fullWalletForID,
  // refreshRailgunBalances,
  // generateCrossContractCallsProof,
  // populateProvedCrossContractCalls
} from '@railgun-community/wallet';


export default async function initializeRailgunSystem() {
  initEngine();
  await initEngineNetwork();
  
  const groth16 = (global as unknown as { snarkjs: { groth16: SnarkJSGroth16 } })
    .snarkjs.groth16;
  getProver().setSnarkJSGroth16(groth16);
}