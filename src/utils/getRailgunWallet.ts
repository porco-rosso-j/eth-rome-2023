import {
	pbkdf2,
	createRailgunWallet,
	loadWalletByID,
} from "@railgun-community/wallet";
import { setRailgunGas } from "src/scripts/utils/gas";

export default async function getRailgunWallet(
	password: string,
	railgunWalletID: string,
	railgunWalletMnemonic: string
) {
	const encryptionKey = await pbkdf2(password, "0x0", 1000000);
	console.log("encryptionKey !!: ", encryptionKey);
	let railgunWalletInfo;
	if (railgunWalletID) {
		console.log("railgunWalletID 1: ");
		railgunWalletInfo = await loadWalletByID(
			encryptionKey,
			railgunWalletID,
			false // creationBlockNumbers
		);
	} else if (railgunWalletMnemonic) {
		console.log("railgunWalletMnemonic 2: ");
		railgunWalletInfo = await createRailgunWallet(
			encryptionKey,
			railgunWalletMnemonic,
			undefined // creationBlockNumbers
		);
	}

	console.log("railgunWalletInfo: ", railgunWalletInfo);
	await setRailgunGas();
	return { railgunWalletInfo, encryptionKey };
}
