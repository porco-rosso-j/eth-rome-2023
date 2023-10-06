import { gasEstimateForUnprovenCrossContractCalls } from '@railgun-community/wallet';
import {
    NetworkName,
    TransactionGasDetails,
    EVMGasType,
    FeeTokenDetails,
    NETWORK_CONFIG,
    RailgunERC20Amount,
    RailgunERC20Recipient
} from '@railgun-community/shared-models';
import { setRailgunFees } from "@railgun-community/cookbook"
import { ContractTransaction } from "ethers"

const originalGasDetails: TransactionGasDetails = {
    evmGasType: EVMGasType.Type2, // Depends on the chain (BNB uses type 0)
    gasEstimate: 0n, // Always 0, we don't have this yet.
    maxFeePerGas: BigInt('0x100000'), // Current gas Max Fee
    maxPriorityFeePerGas: BigInt('0x010000'), // Current gas Max Priority Fee
}

const feeTokenDetailsWETH: FeeTokenDetails = {
    tokenAddress: NETWORK_CONFIG.Ethereum_Goerli.baseToken.wrappedAddress,
    //feePerUnitGas: BigInt('0x2000000000000000000'), // 2x
    feePerUnitGas: BigInt('0xcc47f20295c0000')
};

export async function setRailgunGas() {
    const shieldUnshieldfee = 25n // must be 25n
    await setRailgunFees(NetworkName.EthereumGoerli, shieldUnshieldfee, shieldUnshieldfee)
}

export async function getGasDetailsERC20(
    railgunWalletID: string,
    encryptionKey : string,
    railgunERC20Amount : RailgunERC20Amount[], 
    railgunERC20Recipient: RailgunERC20Recipient[],
    crossContractCalls: ContractTransaction[],
):Promise<TransactionGasDetails> {

    const {gasEstimate} = await gasEstimateForUnprovenCrossContractCalls(
        NetworkName.EthereumGoerli,
        railgunWalletID,
        encryptionKey,
        railgunERC20Amount,
        [],
        railgunERC20Recipient,
        [],
        crossContractCalls,
        originalGasDetails,
        feeTokenDetailsWETH,
        true,
        undefined
    )

      const gasDetails: TransactionGasDetails = {
        evmGasType: EVMGasType.Type1, // Depends on the chain (BNB uses type 0)
        gasEstimate: gasEstimate, // Output from gasEstimateForDeposit
        gasPrice: BigInt('0x10000')
      }

    return gasDetails

}