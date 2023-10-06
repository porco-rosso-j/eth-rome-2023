import { 
    getShieldPrivateKeySignatureMessage,
    gasEstimateForShieldBaseToken,
    populateShieldBaseToken
 } from '@railgun-community/wallet';
 import {
    RailgunERC20Amount,
    NetworkName,
    TransactionGasDetails,
    EVMGasType,
    NETWORK_CONFIG
  } from '@railgun-community/shared-models';
import {initEngine, initEngineNetwork} from "../utils/setup"
import { Wallet, JsonRpcProvider, keccak256 } from 'ethers';
import * as dotenv from "dotenv"
dotenv.config()

const railgunAddress = process.env.RAILGUN_ADDRESS as string;
const WETH_GOERLI = NETWORK_CONFIG.Ethereum_Goerli.baseToken.wrappedAddress;
const PK = process.env.PRIVATE_KEY as string;
const RPC = process.env.ALCHEMY_GOERLI as string;
const provider = new JsonRpcProvider(RPC, 5)
const wallet = new Wallet(PK, provider);

// ts-node-esm --experimental-specifier-resolution=node scripts/peanut-withdraw_shield.ts

async function withdraw_shield() {
    initEngine();
    await initEngineNetwork();

    const shieldSignatureMessage = getShieldPrivateKeySignatureMessage();
    const shieldPrivateKey = keccak256(
        await wallet.signMessage(shieldSignatureMessage),
    );

    const wrappedERC20Amount: RailgunERC20Amount = {
        tokenAddress: WETH_GOERLI,
        amount: BigInt('0x5AF3107A4000'), // hexadecimal amount of 0.0001
      };

      const {gasEstimate} = await gasEstimateForShieldBaseToken(
        NetworkName.EthereumGoerli,
        railgunAddress,
        shieldPrivateKey,
        wrappedERC20Amount,  
        wallet.address,
      );

      const gasDetails: TransactionGasDetails = {
        evmGasType: EVMGasType.Type2, // Depends on the chain (BNB uses type 0)
        gasEstimate: gasEstimate,
        maxFeePerGas: BigInt('0x100000'), // Current gas Max Fee
        maxPriorityFeePerGas: BigInt('0x010000'), // Current gas Max Priority Fee
      }

      const {transaction} = await populateShieldBaseToken(
        NetworkName.EthereumGoerli,
        railgunAddress,
        shieldPrivateKey,
        wrappedERC20Amount,  
        gasDetails,
      );

      console.log("transaction: ", transaction)
}

withdraw_shield()