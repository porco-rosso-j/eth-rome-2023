import {
  pbkdf2,
  createRailgunWallet
} from '@railgun-community/wallet';
import { setRailgunGas } from 'src/scripts/utils/gas';

export default async function getRailgunWallet(password: string, mnemonic: string) {
  const encryptionKey = await pbkdf2(password, "0x0", 1000000);
  const railgunWalletInfo = await createRailgunWallet(
    encryptionKey,
    mnemonic,
    undefined, // creationBlockNumbers
  )

  await setRailgunGas();
  return { railgunWalletInfo, encryptionKey }
}