import {
	pbkdf2,
	createRailgunWallet,
	loadWalletByID,
} from "@railgun-community/wallet";
import { setRailgunGas } from "src/scripts/utils/gas";

// export default async function getRailgunWallet(password: string, mnemonic: string) {
//   const encryptionKey = await pbkdf2(password, "0x0", 1000000);
//   const railgunWalletInfo = await createRailgunWallet(
//     encryptionKey,
//     mnemonic,
//     undefined, // creationBlockNumbers
//   )

//   await setRailgunGas();
//   return { railgunWalletInfo, encryptionKey }
// }

export default async function getRailgunWallet(
	password: string,
	railgunWalletID: string,
	railgunWalletMnemonic: string
) {
	const encryptionKey = await pbkdf2(password, "0x0", 1000000);
	console.log("encryptionKey !!: ", encryptionKey);
	let railgunWalletInfo;
	if (railgunWalletID) {
		railgunWalletInfo = await loadWalletByID(
			encryptionKey,
			railgunWalletID,
			false // creationBlockNumbers
		);
	} else if (railgunWalletMnemonic) {
		railgunWalletInfo = await createRailgunWallet(
			encryptionKey,
			railgunWalletMnemonic,
			undefined // creationBlockNumbers
		);
	}

	await setRailgunGas();
	return { railgunWalletInfo, encryptionKey };
}
