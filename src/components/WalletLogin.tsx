// WalletLogin.tsx

import { Box, Input, Button, Text, Textarea } from "@chakra-ui/react";
import React, { useState } from "react";
import { useContext } from 'react'
import UserCredentialContext from 'src/context/userCredential';

function isValidMnemonicFormat(input: string): boolean {
  const words = input.trim().split(/\s+/);
  return words.length === 12;
}

function obscureWords(input: string): string {
  const words = input.trim().split(/\s+/);
  const obscured = words.map(word => '*'.repeat(word.length));
  return obscured.join(' ');
}

const WalletLogin: React.FC = () => {

  const { saveMnemonic, savePassword, mnemonic } = useContext(UserCredentialContext);
  const [mnemonicInput, setMnemonicInput] = useState<string>('')
  const [passwordInput, setPasswordInput] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')


  const onClickLogin = () => {
    if (!mnemonic && mnemonicInput === '') {
      setErrorMessage('Please input the seed phrase')
      return
    }
    if (!mnemonic && !isValidMnemonicFormat(mnemonicInput)) {
      setErrorMessage('Invalid seed phrase')
      return
    }
    if (passwordInput === '') {
      setErrorMessage('Please input password')
      return
    }

    setErrorMessage('')

    if (mnemonicInput) {
      saveMnemonic(mnemonicInput)
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
        <Text mb={2}>1. Seed</Text>
        <Textarea
          defaultValue={mnemonic ? obscureWords(mnemonic) : ''}
          onChange={(e) => setMnemonicInput(e.target.value)}
          placeholder="apple banana cherry dolphin elephant frog grape hill igloo jelly kite lemon
" />
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