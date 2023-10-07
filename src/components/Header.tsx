import { Flex, Box, Button } from '@chakra-ui/react'
import { useContext } from 'react'
import UserCredentialContext from 'src/context/userCredential';
export default function Header() {
  const { logout, password, mnemonic } = useContext(UserCredentialContext);
  return <Flex justifyContent="space-between" p="20px" boxShadow='sm' alignItems="center">
    <Box>
      GhostPay
    </Box>
    <Box>
      {mnemonic && password && <Button onClick={logout}>
        Log Out
      </Button>}
    </Box>

  </Flex >
}