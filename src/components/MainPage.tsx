// TransferTabs.tsx

import { Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Input, Flex, Button, Textarea, Text } from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import getRailgunWallet from 'src/utils/getRailgunWallet';
import UserCredentialContext from 'src/context/userCredential';
import { privateTransfer } from 'src/scripts/private-transfer';
import { privateClaim } from 'src/scripts/claim';
import { privateClaimSwap } from 'src/scripts/claim-swap';
import { TOKEN_ADDRESSES } from 'src/constants';
import { set } from 'lodash';

import {getPrivateBalance} from "src/scripts/utils/balance"
import {quoteWETHtoUSDC} from "src/scripts/utils/quote"
import {getPeanutTokenAmountFromLink} from "src/scripts/utils/peanut"
import { ZeroAddress } from "ethers";

const MainPage = () => {
  const [loading, setLoading] = useState(false);
  // logic for transferring
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTokenAddress, setTransferTokenAddress] = useState(TOKEN_ADDRESSES.WETH);
  const [transferTxRecords, setTransferTxRecords] = useState<{ txHash, peanutLink }[]>([]);
  //logic for claiming
  
  // balances
  const [WETHBalance, setWETHBalance] = useState(0);
  const [USDCBalance, setUSDCBalance] = useState(0);

  const [claimPeanutLink, setClaimPeanutLink] = useState('');
  const [claimTokenAddr, setClaimTokenAddr] = useState('');
  const [claimAmount, setClaimAmount] = useState(0);

  const [receiveAsset, setReceiveAsset] = useState('USDC'); // ['WETH', 'USDC']
  const [receiveAssetQuote, setReceiveAssetQuote] = useState(0)
  console.log('receiveAsset :', receiveAsset);
  const [claimTxRecords, setClaimTxRecords] = useState<{ txHash }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>(''); // ['error1', 'error2']
  const { logout, password, mnemonic } = useContext(UserCredentialContext);

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (claimPeanutLink !== "") {
        let res = await getPeanutTokenAmountFromLink(claimPeanutLink);
        const address = res[0] == ZeroAddress ? "ETH" : res[0];
        setClaimTokenAddr(address);
        setClaimAmount(Number(res[1]));
      }
    }, 300);
    return () => clearTimeout(timeOutId);
  }, [claimPeanutLink]);

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (receiveAsset === 'USDC' && claimAmount !== 0) {
        let res = await quoteWETHtoUSDC(claimAmount);
        console.log("res: ", res)
        setReceiveAssetQuote(res)
      }
    }, 300);
    return () => clearTimeout(timeOutId);
  }, [receiveAsset, claimAmount]);

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      const { railgunWalletInfo } = await getRailgunWallet(password, mnemonic);
        setWETHBalance(Number(await getPrivateBalance(railgunWalletInfo, TOKEN_ADDRESSES.WETH)));
        setUSDCBalance(Number(await getPrivateBalance(railgunWalletInfo, TOKEN_ADDRESSES.USDC)));
    }, 300);
    return () => clearTimeout(timeOutId);
  }, [password, mnemonic]);

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
          <Tab w="50%">Private Claim</Tab>
          <Tab w="50%">Private Transfer</Tab> 
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box mb={4} p={4} borderRadius="md" boxShadow="md">
              {/* <Box mb={4}>
                <label>1. Recipient</label>
                <Input placeholder="0zk123..." />
              </Box> */}
              <Box mb={2}>
                <label>1. Peanut Link</label>
                <Input placeholder="https://peanut..." onChange={(e) => setClaimPeanutLink(e.target.value)} />
              </Box>
              { claimPeanutLink !== "" &&
              <Text ml={4}  > 
                - Claim Token: {claimTokenAddr}
              </Text>}
              { claimPeanutLink !== "" &&
              <Text ml={4} mb={3}  > 
                - Claim Amount:  {claimAmount/1e18}
              </Text>}
              <Box mb={3}>
                <label>2. Receive Asset</label>
                <Select placeholder='Select Asset' onChange={(e) => setReceiveAsset(e.target.value)}>
                  <option value='USDC' selected> USDC (0x07865....Eaa37F)</option>
                  <option value='WETH'> WETH (0xB4FBF2....2b2208d6)</option>
                </Select>
              </Box>
              { receiveAsset === 'USDC' && claimAmount !== 0 &&
              <Text ml={4} mb={5}  > 
                - Quote:  {receiveAssetQuote} USDC
              </Text>}
              <Button onClick={onPrivateClaim} >Confirm</Button>
              {loading && <Flex minH={200} justifyContent="center" alignItems="center"
                pos="absolute" left="0" top="0" right="0" bottom="0" background="white" opacity={0.8}>
                <Spinner />
              </Flex>}
            </Box>
            <Box>
            <Box mb={2} fontSize={20}>Private Balance</Box>
            <Text ml={4}  > 
                - WETH: {WETHBalance/1e18}
              </Text>
              <Text ml={4} mb={3}  > 
                - USDC: {USDCBalance/1e12}
              </Text>
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
            <Box mb={2} fontSize={20}>Private Balance</Box>
            <Text ml={4}  > 
                - WETH: {WETHBalance/1e18}
              </Text>
              <Text ml={4} mb={3}  > 
                - USDC: {USDCBalance/1e12}
              </Text>
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
        </TabPanels>
      </Tabs>

    </Box >
  );
};

export default MainPage;
