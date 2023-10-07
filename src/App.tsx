import WalletLogin from 'src/components/WalletLogin'
import Header from 'src/components/Header'
import { ChakraProvider } from "@chakra-ui/react";
import useUserCredential from 'src/hooks/useUserCredential';
import UserCredentialContext from 'src/context/userCredential';

export default function App() {
  const {
    mnemonic,
    password,
    saveMnemonic,
    savePassword,
    logout
  } = useUserCredential();
  return <ChakraProvider>
    <UserCredentialContext.Provider value={{
      mnemonic,
      password,
      saveMnemonic,
      savePassword,
      logout
    }}>
      <div>
        <Header />
        {
          (!mnemonic || !password) ? <WalletLogin /> : <div>logged in</div>
        }

      </div>
    </UserCredentialContext.Provider>
  </ChakraProvider>
}