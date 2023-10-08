// WalletLogin.tsx

import { Box, Input, Button, Text, Textarea } from "@chakra-ui/react";
import React, { useState } from "react";
import { useContext } from 'react'
import UserCredentialContext from 'src/context/userCredential';

// function isValidrailgunWalletIDFormat(input: string): boolean {
//   const words = input.trim().split(/\s+/);
//   return words.length === 12;
// }

function obscureWords(input: string): string {
  const words = input.trim().split(/\s+/);
  const obscured = words.map(word => '*'.repeat(word.length));
  return obscured.join(' ');
}

const WalletLogin: React.FC = () => {

  const { saveRailgunWalletID, saveRailgunWalletMnemonic, savePassword, railgunWalletID, railgunWalletMnemonic } = useContext(UserCredentialContext);
  const [railgunWalletIDInput, setRailgunWalletIDInput] = useState<string>('')
  const [railgunWalletMnemonicInput, setRailgunWalletMnemonicInput] = useState<string>('')
  const [passwordInput, setPasswordInput] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')


  const onClickLogin = () => {

    if (railgunWalletMnemonic && !railgunWalletID && railgunWalletIDInput === '') {
      setErrorMessage('Please input the wallet id')
      return
    }
    if (!railgunWalletMnemonic && railgunWalletMnemonicInput === '') {
      setErrorMessage('Please input the wallet mnemonic')
      return
    }
    // if (!railgunWalletID && !isValidrailgunWalletIDFormat(railgunWalletIDInput)) {
    //   setErrorMessage('Invalid seed phrase')
    //   return
    // }

    if (passwordInput === '') {
      setErrorMessage('Please input password')
      return
    }

    setErrorMessage('')

    if (railgunWalletIDInput) {
      saveRailgunWalletID(railgunWalletIDInput)
    }
    if (railgunWalletMnemonicInput) {
      saveRailgunWalletMnemonic(railgunWalletMnemonicInput)
    }
    if (passwordInput) {
      savePassword(passwordInput)
    }
  }
  return (
    <Box
      p={8}
      w={["90%", "80%", "60%", "40%"]}
      mx="auto"
      mt={20}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Login to your wallet
      </Text>

      {railgunWalletMnemonic ? <Box mb={6}>
        <Text mb={2}>Railgun Wallet ID</Text>
        <Textarea
          defaultValue={railgunWalletID ? obscureWords(railgunWalletID) : ''}
          onChange={(e) => setRailgunWalletIDInput(e.target.value)}
          placeholder="45094f71...f3gsf81840" />
      </Box> :
        <Box mb={6}>
          <Text >Railgun Wallet Mnemonic</Text>
          <Text fontSize="12px" mb={2} color="gray.500">  You have to use mnemonic to login to the wallet at the first time.</Text>
          <Textarea
            onChange={(e) => setRailgunWalletMnemonicInput(e.target.value)}
            placeholder="apple banana cherry dolphin elephant frog grape hill igloo jelly kite lemon" />
        </Box>}

      <Box mb={4}>
        <Text mb={2}>Password</Text>

        <Input type="password" onChange={(e) => setPasswordInput(e.target.value)} />
      </Box>
      <Text color="red.500" mb={4}>{errorMessage}</Text>
      <Button colorScheme="teal" w="100%" onClick={onClickLogin}>
        Login
      </Button>
    </Box>
  );
};

export default WalletLogin;