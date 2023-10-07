// TransferTabs.tsx

import { Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Input, Flex, Button, Textarea } from "@chakra-ui/react";
import { useContext, useState } from 'react'
import getRailgunWallet from 'src/utils/getRailgunWallet';
import UserCredentialContext from 'src/context/userCredential';
import { privateTransfer } from 'src/scripts/private-transfer';
import { privateClaim } from 'src/scripts/claim';
import { privateClaimSwap } from 'src/scripts/claim-swap';
import { TOKEN_ADDRESSES } from 'src/constants';
import { set } from 'lodash';


const MainPage = () => {
  const [loading, setLoading] = useState(false);
  // logic for transferring
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTokenAddress, setTransferTokenAddress] = useState(TOKEN_ADDRESSES.WETH);
  const [transferTxRecords, setTransferTxRecords] = useState<{ txHash, peanutLink }[]>([]);
  //logic for claiming

  const [claimPeanutLink, setClaimPeanutLink] = useState('');
  const [receiveAsset, setReceiveAsset] = useState('USDC'); // ['WETH', 'USDC']
  console.log('receiveAsset :', receiveAsset);
  const [claimTxRecords, setClaimTxRecords] = useState<{ txHash }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>(''); // ['error1', 'error2']
  const { logout, password, mnemonic } = useContext(UserCredentialContext);


  const onPrivateTransfer = async () => {
    setLoading(true);

    if (transferAmount === '') {
      setErrorMessage('Please input amount');
      return;
    }
    const { railgunWalletInfo, encryptionKey } = await getRailgunWallet(password, mnemonic);
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
    setLoading(true);
    if (!claimPeanutLink) {
      setErrorMessage('Please input peanut link');
    }
    const { railgunWalletInfo, encryptionKey } = await getRailgunWallet(password, mnemonic);
    console.log('railgunWalletInfo :', railgunWalletInfo);

    if (receiveAsset === 'USDC') {
      console.log('using privateClaimSwap');
      const txHash = await privateClaimSwap(
        railgunWalletInfo,
        encryptionKey,
        claimPeanutLink || "https://peanut.to/claim#?c=5&v=v4&i=3555&p=kvVyr6ntko291LTL&t=ui"
      )
      setClaimTxRecords(prev => [...prev, { txHash }])
    } else if (receiveAsset === 'WETH') {
      console.log('using privateClaim');
      const txHash = await privateClaim(
        railgunWalletInfo,
        encryptionKey,
        claimPeanutLink || "https://peanut.to/claim#?c=5&v=v4&i=3555&p=kvVyr6ntko291LTL&t=ui"
      )
      setClaimTxRecords(prev => [...prev, { txHash }])
    }

    setLoading(false);

  }

  return (
    <Box>
      <Tabs variant="enclosed">
        <TabList>
          <Tab w="50%"> Private Transfer </Tab>
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
                    <Card key={index} background="aliceblue" mb="4">
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
            <Box mb={4} p={4} borderRadius="md" boxShadow="md">
              <Box mb={4}>
                <label>1. Recipient</label>
                <Input placeholder="0zk123..." />
              </Box>
              <Box mb={4}>
                <label>2. Peanut Link</label>
                <Input placeholder="https://peanut..." onChange={(e) => setClaimPeanutLink(e.target.value)} />
              </Box>
              <Box mb={4}>
                <label>3.Receive Asset</label>
                <Select placeholder='Select Asset' onChange={(e) => setReceiveAsset(e.target.value)}>
                  <option value='USDC' selected> USDC (0x07865....Eaa37F)</option>
                  <option value='WETH'> WETH (0xB4FBF2....2b2208d6)</option>
                </Select>
              </Box>
              <Button onClick={onPrivateClaim} >Confirm</Button>
              {loading && <Flex minH={200} justifyContent="center" alignItems="center"
                pos="absolute" left="0" top="0" right="0" bottom="0" background="white" opacity={0.8}>
                <Spinner />
              </Flex>}
            </Box>
            <Box>
              <Box mb={4} fontSize={20}>Claim History</Box>
              {
                claimTxRecords.map((txRecord, index) => {
                  return (
                    <Card key={index} background="antiquewhite" mb="4">
                      <CardBody>
                        <Box>
                          <Box fontWeight={700}>Tx Hash</Box>
                          {txRecord.txHash}
                        </Box>
                      </CardBody>
                    </Card>
                  )
                })
              }
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

    </Box >
  );
};

export default MainPage;
