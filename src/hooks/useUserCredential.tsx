import { useState } from "react";

const CREDENTIAL_PREFIX = "peanutGun";
const useUserCredential = () => {
  const [password, setPassword] = useState<string | null>(
    localStorage.getItem(`${CREDENTIAL_PREFIX}_password`)
  );
  const [railgunWalletID, setRailgunWalletID] = useState<string | null>(
    localStorage.getItem(`${CREDENTIAL_PREFIX}_railgunWalletID`)
  );

  const [railgunWalletMnemonic, setRailgunWalletMnemonic] = useState<string | null>(
    localStorage.getItem(`${CREDENTIAL_PREFIX}_railgunWalletMnemonic`)
  );

  const savePassword = (password: string) => {
    setPassword(password);
  };

  const saveRailgunWalletID = (railgunWalletID: string) => {
    localStorage.setItem(`${CREDENTIAL_PREFIX}_railgunWalletID`, railgunWalletID);
    setRailgunWalletID(railgunWalletID);
  };

  const saveRailgunWalletMnemonic = (railgunWalletMnemonic: string) => {
    localStorage.setItem(`${CREDENTIAL_PREFIX}_railgunWalletMnemonic`, railgunWalletMnemonic);
    setRailgunWalletMnemonic(railgunWalletMnemonic);
  };

  const logout = () => {
    localStorage.removeItem(`${CREDENTIAL_PREFIX}_railgunWalletID`);
    localStorage.removeItem(`${CREDENTIAL_PREFIX}_railgunWalletMnemonic`);
    setPassword(null);
    setRailgunWalletID(null);
    setRailgunWalletMnemonic(null);
  };


  return {
    password,
    railgunWalletID,
    railgunWalletMnemonic,
    savePassword,
    saveRailgunWalletID,
    saveRailgunWalletMnemonic,
    logout
  };
};

export default useUserCredential;