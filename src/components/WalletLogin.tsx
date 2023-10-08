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

  const { saveRailgunWalletID, savePassword, railgunWalletID } = useContext(UserCredentialContext);
  const [railgunWalletIDInput, setrailgunWalletIDInput] = useState<string>('')
  const [passwordInput, setPasswordInput] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')


  const onClickLogin = () => {
    if (!railgunWalletID && railgunWalletIDInput === '') {
      setErrorMessage('Please input the wallet id')
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

      <Box mb={6}>
        <Text mb={2}>1. Railgun Wallet ID</Text>
        <Textarea
          defaultValue={railgunWalletID ? obscureWords(railgunWalletID) : ''}
          onChange={(e) => setrailgunWalletIDInput(e.target.value)}
          placeholder="45094f71...f3gsf81840" />
      </Box>

      <Box mb={4}>
        <Text mb={2}>2. Password</Text>

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