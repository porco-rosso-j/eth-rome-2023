// TransferTabs.tsx

import { Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Input, Flex, Button, Textarea } from "@chakra-ui/react";
import { useContext, useState } from 'react'
import getRailgunWallet from 'src/utils/getRailgunWallet';
import UserCredentialContext from 'src/context/userCredential';
import { privateTransfer } from 'src/scripts/private-transfer';
// import { privateClaim } from 'src/scripts/claim';
import { privateClaimSwap } from 'src/scripts/claim-swap';
import { TOKEN_ADDRESSES } from 'src/constants';


const MainPage = () => {
  const [loading, setLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTokenAddress, setTransferTokenAddress] = useState(TOKEN_ADDRESSES.WETH);
  const [transferTxRecords, setTransferTxRecords] = useState<{ txHash, peanutLink }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>(''); // ['error1', 'error2'
  const { logout, password, mnemonic } = useContext(UserCredentialContext);

  const onPrivateTransfer = async () => {
    setLoading(true);
    const { railgunWalletInfo, encryptionKey } = await getRailgunWallet(password, mnemonic);

    if (transferAmount === '') {
      setErrorMessage('Please input amount');
      return;
    }

    console.log('railgunWalletInfo :', railgunWalletInfo);
    const transferResult = await privateTransfer(
      railgunWalletInfo,
      encryptionKey,
      transferTokenAddress,
      Number(transferAmount)
    )
    setTransferTxRecords(prev => [...prev, transferResult])
    setLoading(false);
    console.log('transferResult :', transferResult);
  }

  const onPrivateClaim = async () => {
    const { railgunWalletInfo, encryptionKey } = await getRailgunWallet(password, mnemonic);
    console.log('railgunWalletInfo :', railgunWalletInfo);
    await privateClaimSwap(
      railgunWalletInfo,
      encryptionKey,
      "https://peanut.to/claim#?c=5&v=v4&i=3555&p=kvVyr6ntko291LTL&t=ui"
    )
  }

  return (
    <Box>
      <Tabs variant="enclosed">
        <TabList>
          <Tab w="50%"> Private Transfer</Tab>
          <Tab w="50%">Claim</Tab>
        </TabList>

        <TabPanels>
          <TabPanel >
            <Box p={4} mb={4} borderRadius="md" boxShadow="md" pos="relative">
              <Box mb={4}>
                <label>1. asset</label>
                <Input placeholder="0x123..." defaultValue={TOKEN_ADDRESSES.WETH} onChange={(e) => setTransferTokenAddress(e.target.value)} />
              </Box>
              <Box mb={4}>
                <label>2. amount</label>
                <Input placeholder="0.001" onChange={(e) => setTransferAmount(e.target.value)} />
              </Box>
              <Box>
                {errorMessage}
              </Box>
              <Button onClick={onPrivateTransfer}>Confirm</Button>
              {loading && <Flex minH={200} justifyContent="center" alignItems="center"
                pos="absolute" left="0" top="0" right="0" bottom="0" background="white" opacity={0.8}>
                <Spinner />
              </Flex>}
            </Box>
            <Box>
              <Box mb={4} fontSize={20}>Transfer History</Box>
              {
                transferTxRecords.map((txRecord, index) => {
                  return (
                    <Card key={index} background="aliceblue">
                      <CardBody>
                        <Box>
                          <Box fontWeight={700}>Tx Hash</Box>
                          {txRecord.txHash}
                        </Box>
                        <Box>
                          <Box fontWeight={700}>Peanut Link</Box>
                          {txRecord.peanutLink}
                        </Box>
                      </CardBody>
                    </Card>
                  )
                })
              }
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

    </Box >
  );
};

export default MainPage;
