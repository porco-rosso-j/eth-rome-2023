import { useState } from "react";

const CREDENTIAL_PREFIX = "peanutGun";
const useUserCredential = () => {
  const [password, setPassword] = useState<string | null>(
    localStorage.getItem(`${CREDENTIAL_PREFIX}_password`)
  );
  const [mnemonic, setMnemonic] = useState<string | null>(
    localStorage.getItem(`${CREDENTIAL_PREFIX}_mnemonic`)
  );

  const savePassword = (password: string) => {
    setPassword(password);
  };

  const saveMnemonic = (mnemonic: string) => {
    localStorage.setItem(`${CREDENTIAL_PREFIX}_mnemonic`, mnemonic);
    setMnemonic(mnemonic);
  };

  const logout = () => {
    localStorage.removeItem(`${CREDENTIAL_PREFIX}_mnemonic`);
    setPassword(null);
    setMnemonic(null);
  };


  return { password, mnemonic, savePassword, saveMnemonic, logout };
};

export default useUserCredential;