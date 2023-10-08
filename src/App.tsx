import WalletLogin from 'src/components/WalletLogin'
import React from 'react'
import Header from 'src/components/Header'
import { ChakraProvider, Box } from "@chakra-ui/react";
import useUserCredential from 'src/hooks/useUserCredential';
import UserCredentialContext from 'src/context/userCredential';
import MainPage from 'src/components/MainPage';
import initializeRailgunSystem from 'src/utils/initializeRailgunSystemRailgunSystem';
import { useEffect } from 'react';
import chakraDefaultTheme from 'src/theme'
function App() {
  const {
    railgunWalletID,
    password,
    saveRailgunWalletID,
    savePassword,
    logout
  } = useUserCredential();


  useEffect(() => {
    async function init() {
      await initializeRailgunSystem()
    }
    init();
  }, [])

  return <ChakraProvider theme={chakraDefaultTheme}>
    <UserCredentialContext.Provider value={{
      railgunWalletID,
      password,
      saveRailgunWalletID,
      savePassword,
      logout
    }}>
      <div>
        <Header />

        <Box maxW='768px' mx="auto">
          {
            (!railgunWalletID || !password) ? <WalletLogin /> : <Box p="16px">
              <MainPage />
            </Box>
          }
        </Box>


      </div>
    </UserCredentialContext.Provider>
  </ChakraProvider>
}

export default App