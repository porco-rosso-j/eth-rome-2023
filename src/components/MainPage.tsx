// TransferTabs.tsx

import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, Input, Button, Textarea } from "@chakra-ui/react";
import { useContext } from 'react'
import getRailgunWallet from 'src/utils/getRailgunWallet';
import UserCredentialContext from 'src/context/userCredential';
import { privateTransfer } from 'src/scripts/private-transfer';
import { privateClaim } from 'src/scripts/claim';
import { TOKEN_ADDRESSES } from 'src/constants';


const MainPage = () => {

  const { logout, password, mnemonic } = useContext(UserCredentialContext);
  const onPrivateTransfer = async () => {
    const { railgunWalletInfo, encryptionKey } = await getRailgunWallet(password, mnemonic);
    console.log('railgunWalletInfo :', railgunWalletInfo);
    await privateTransfer(
      railgunWalletInfo,
      encryptionKey,
      TOKEN_ADDRESSES.WETH,
      0.0001
    )
  }

  const onPrivateClaim = async () => {
    const { railgunWalletInfo, encryptionKey } = await getRailgunWallet(password, mnemonic);
    console.log('railgunWalletInfo :', railgunWalletInfo);
    await privateClaim(
      railgunWalletInfo,
      encryptionKey,
      "https://peanut.to/claim#?c=5&v=v4&i=3538&p=vXUNd4uwp5GzMHyd&t=ui"
    )
  }

  return (
    <Tabs variant="enclosed">
      <TabList>
        <Tab w="50%"> Private Transfer</Tab>
        <Tab w="50%">Claim</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Box p={4} borderRadius="md" boxShadow="md">
            <Box mb={4}>
              <label>1. asset</label>
              <Input placeholder="0x123..." />
            </Box>
            <Box mb={4}>
              <label>2. amount</label>
              <Input placeholder="0.001" />
            </Box>
            <Button onClick={onPrivateTransfer}>Confirm</Button>
          </Box>
        </TabPanel>
        <TabPanel>
          <Box p={4} borderRadius="md" boxShadow="md">
            <Box mb={4}>
              <label>1. recipient</label>
              <Input placeholder="0zk123..." />
            </Box>
            <Box mb={4}>
              <label>2. peanut link</label>
              <Input placeholder="https://peanut..." />
            </Box>
            <Box mb={4}>
              <label>(3. receive asset)</label>
              <Textarea placeholder="0x123" />
            </Box>
            <Button onClick={onPrivateClaim} >Confirm</Button>
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default MainPage;
