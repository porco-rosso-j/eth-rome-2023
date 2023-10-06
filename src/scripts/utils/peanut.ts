import {providers} from "ethers5"
//https://dev.to/atosh502/install-multiple-versions-of-same-package-using-yarn-2668
import peanut from '@squirrel-labs/peanut-sdk';
import * as dotenv from "dotenv";
dotenv.config();

const provider = new providers.JsonRpcProvider(process.env.ALCHEMY_GOERLI as string, 5)

export async function getPeanutLink(amount:number, txHash:string, password:string):Promise<string> {

    const linkDetails = {
        chainId: 5,
        tokenAmount: amount,
        tokenType: 0,  // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
      }

    
    console.log("provider: ", provider)

    const linksFromTxResp = await peanut.getLinksFromTx({
		linkDetails: linkDetails,
		txHash: txHash,
		passwords: [password],
		provider: provider
	})

    console.log("linksFromTxResp: ", linksFromTxResp)

    return linksFromTxResp.links[0];
}

export async function getPassword() {
    return await peanut.getRandomString(16)
}