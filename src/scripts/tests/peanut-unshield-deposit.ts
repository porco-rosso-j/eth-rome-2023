import { 
    gasEstimateForUnprovenUnshieldBaseToken,
    generateUnshieldBaseTokenProof,
    populateProvedUnshieldBaseToken,
    pbkdf2,
    refreshRailgunBalances,
    createRailgunWallet,
    fullWalletForID,
    getProver, 
    SnarkJSGroth16
 } from '@railgun-community/wallet';
 import {
    RailgunERC20Amount,
    NetworkName,
    TransactionGasDetails,
    EVMGasType,
    FeeTokenDetails,
    NETWORK_CONFIG
  } from '@railgun-community/shared-models';
import {initEngine, initEngineNetwork} from "../utils/setup"
import { groth16 } from 'snarkjs';
import * as dotenv from "dotenv"
dotenv.config()

const publicWalletAddress = process.env.ETHADDRESS_GOERLI as string;
console.log('publicWalletAddress :', publicWalletAddress);
const mnemonic = process.env.RAILGUN_MNEMONIC as string;
const secret = process.env.RAILGUN_PASSWORD as string;
const WETH_GOERLI = NETWORK_CONFIG.Ethereum_Goerli.baseToken.wrappedAddress;
const chainGoerli = NETWORK_CONFIG.Ethereum_Goerli.chain;
// ts-node-esm --experimental-specifier-resolution=node scripts/unshield.ts

async function unshield() {
    initEngine();
    await initEngineNetwork();

    // @ts-ignore
    getProver().setSnarkJSGroth16(groth16 as SnarkJSGroth16);

    const encryptionKey = await pbkdf2(secret, "0x0", 1000000);

    const railgunWalletInfo = await createRailgunWallet(
        encryptionKey,
        mnemonic,
        undefined, // creationBlockNumbers
      );
    
    console.log("address", railgunWalletInfo.railgunAddress)
    console.log("id", railgunWalletInfo.id)
    
    if (!railgunWalletInfo) {
        throw new Error('Expected railgunWalletInfo');
    }

    const railgunWallet = await fullWalletForID(railgunWalletInfo.id);

    // Formatted wrapped token amount.
    // Tokens will unwrap as wETH and unshield as ETH.
    const wrappedERC20Amount: RailgunERC20Amount = {
        tokenAddress: WETH_GOERLI, // wETH
        amount: BigInt('0x5AF3107A4000'), // hexadecimal amount of 0.0001
      };

    const originalGasDetails: TransactionGasDetails = {
        evmGasType: EVMGasType.Type2, // Depends on the chain (BNB uses type 0)
        gasEstimate: 0n, // Always 0, we don't have this yet.
        maxFeePerGas: BigInt('0x100000'), // Current gas Max Fee
        maxPriorityFeePerGas: BigInt('0x010000'), // Current gas Max Priority Fee
      }

    const feeTokenDetails: FeeTokenDetails = {
        tokenAddress: WETH_GOERLI,
        feePerUnitGas: BigInt('0x2000000000000000000'), // 2x
      };

      const fullRescan = false
      await refreshRailgunBalances(chainGoerli, railgunWallet.id, fullRescan);

      const {gasEstimate} = await gasEstimateForUnprovenUnshieldBaseToken(
        NetworkName.EthereumGoerli,
        publicWalletAddress,
        railgunWallet.id,
        encryptionKey,
        wrappedERC20Amount,
        originalGasDetails,
        feeTokenDetails,
        false,
      );
      
      await generateUnshieldBaseTokenProof(
        NetworkName.EthereumGoerli,
        publicWalletAddress,
        railgunWallet.id,
        encryptionKey,
        wrappedERC20Amount,
        undefined,
        true,
        BigInt('0x1000'), // overallBatchMinGasPrice
        () => {}
    );

      const gasDetails: TransactionGasDetails = {
        evmGasType: EVMGasType.Type2, // Depends on the chain (BNB uses type 0)
        gasEstimate: gasEstimate, // Output from gasEstimateForDeposit
        maxFeePerGas: BigInt('0x100000'), // Current gas Max Fee
        maxPriorityFeePerGas: BigInt('0x010000'), // Current gas Max Priority Fee
      }

      const populateResponse = await populateProvedUnshieldBaseToken(
        NetworkName.EthereumGoerli,
        publicWalletAddress,
        railgunWallet.id,
        wrappedERC20Amount,
        // relayerFeeERC20AmountRecipient,
        undefined,
        true, // sendWithPublicWallet
        BigInt('0x1000'), // overallBatchMinGasPrice
        gasDetails,
      );
  
      const { transaction } = populateResponse;
      console.log("transaction: ", transaction)
}

unshield()