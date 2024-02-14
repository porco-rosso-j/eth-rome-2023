import { initEngine, initEngineNetwork } from "src/scripts/utils/setup";
import { SnarkJSGroth16, getProver } from "@railgun-community/wallet";

export default async function initializeRailgunSystem() {
	try {
		await initEngine();
	} catch (e) {
		console.log("e: ", e);
	}

	const groth16 = (
		global as unknown as { snarkjs: { groth16: SnarkJSGroth16 } }
	).snarkjs.groth16;
	getProver().setSnarkJSGroth16(groth16);

	await initEngineNetwork();
}
