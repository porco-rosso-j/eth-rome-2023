import {
  pbkdf2,
  createRailgunWallet,
  // fullWalletForID,
  // refreshRailgunBalances,
  // generateCrossContractCallsProof,
  // populateProvedCrossContractCalls
} from '@railgun-community/wallet';


export default async function getRailgunWallet(password: string, mnemonic: string) {
  const encryptionKey = await pbkdf2(password, "0x0", 1000000);
  const railgunWalletInfo = await createRailgunWallet(
    encryptionKey,
    mnemonic,
    undefined, // creationBlockNumbers
  )
  return { railgunWalletInfo, encryptionKey }
}