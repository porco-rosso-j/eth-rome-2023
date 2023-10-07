import WalletLogin from 'src/components/WalletLogin'
import React from 'react'
import Header from 'src/components/Header'
import { ChakraProvider, Box } from "@chakra-ui/react";
import useUserCredential from 'src/hooks/useUserCredential';
import UserCredentialContext from 'src/context/userCredential';
import MainPage from 'src/components/MainPage';
import initializeRailgunSystem from 'src/utils/initializeRailgunSystemRailgunSystem';
import { useEffect } from 'react';
function App() {
  const {
    mnemonic,
    password,
    saveMnemonic,
    savePassword,
    logout
  } = useUserCredential();


  useEffect(() => {
    async function init() {
      await initializeRailgunSystem()
    }
    init();
  }, [])

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
          (!mnemonic || !password) ? <WalletLogin /> : <Box p="16px">
            <MainPage />
          </Box>
        }

      </div>
    </UserCredentialContext.Provider>
  </ChakraProvider>
}

export default App