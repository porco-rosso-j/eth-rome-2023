import { useState } from "react";

const CREDENTIAL_PREFIX = "peanutGun";
const useUserCredential = () => {
  const [password, setPassword] = useState<string | null>(
    localStorage.getItem(`${CREDENTIAL_PREFIX}_password`)
  );
  const [railgunWalletID, setRailgunWalletID] = useState<string | null>(
    localStorage.getItem(`${CREDENTIAL_PREFIX}_railgunWalletID`)
  );

  const savePassword = (password: string) => {
    setPassword(password);
  };

  const saveRailgunWalletID = (railgunWalletID: string) => {
    localStorage.setItem(`${CREDENTIAL_PREFIX}_railgunWalletID`, railgunWalletID);
    setRailgunWalletID(railgunWalletID);
  };

  const logout = () => {
    localStorage.removeItem(`${CREDENTIAL_PREFIX}_railgunWalletID`);
    setPassword(null);
    setRailgunWalletID(null);
  };


  return { password, railgunWalletID, savePassword, saveRailgunWalletID, logout };
};

export default useUserCredential;