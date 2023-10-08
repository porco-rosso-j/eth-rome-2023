import { Flex, Box, Button } from '@chakra-ui/react'
import { useContext } from 'react'
import UserCredentialContext from 'src/context/userCredential';
export default function Header() {
  const { logout, password, railgunWalletID } = useContext(UserCredentialContext);
  return <Flex justifyContent="space-between" p="20px" boxShadow='sm' alignItems="center" >
    <Box>
      GhostPay
    </Box>
    <Box>
      {password && <Button onClick={logout}>
        Remove Wallet
      </Button>}
    </Box>

  </Flex >
}