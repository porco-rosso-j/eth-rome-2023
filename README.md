## Ghost Pay 👻

GhostPay lets anyone privately send and receive crypto with the sharable URL link. Plus, users have the freedom to receive/claim crypto in any tokens they preferred. This is built at ETH Rome 2023. The project page is [here](https://taikai.network/ethrome/hackathons/ethrome-23/projects/clnfwynab00eswu01pbnmnjif/idea)

- [Railgun](https://www.railgun.org/): An on-chain & smart contract-based system for private Ethereum/EVM DeFi.
- [Peanut Protocol](https://peanut.to/): A protocol to transfer tokens using URLs

## Core Functionalities
### Private Transfer
Alice can privately deposit an amount of ETH/ERC20 to the peanut contract from her railgun wallet address. This involves unshielding, unwrapping WETH, etc, in a batch call made possible with railgun's cross-contract call. 

#### UI
<img width="450" alt="Screenshot 2023-10-08 at 12 03 20" src="https://github.com/porco-rosso-j/eth-rome-2023/assets/88586592/2e60013b-36eb-45bf-8a83-9dd9feff172d">

#### Flow
<img width="450" alt="Screenshot 2023-10-08 at 12 03 20" src="https://github.com/porco-rosso-j/eth-rome-2023/assets/88586592/b8693276-2640-4069-a0ac-1039ee17fef8">

### Private Claim
Alice can claim ETH from the peanut link and directly shield it to her railgun wallet address. Optionally, she specifies the token asset she receives. In this case, ETH will be swapped for USDC within the shielding batch transaction. Our own railgun's cookbook recipe enables this flexible execution.

#### UI
<img width="450" alt="Screenshot 2023-10-08 at 12 03 20" src="https://github.com/porco-rosso-j/eth-rome-2023/assets/88586592/d50b421e-2b17-4edb-82c3-b6790b270365">

#### Flow
<img width="450" alt="Screenshot 2023-10-08 at 12 03 20" src="https://github.com/porco-rosso-j/eth-rome-2023/assets/88586592/eb52bb1d-c5c8-4226-a5ff-97e4b23ea24a">

## Technologies
- [Railgun Wallet SDK](https://github.com/Railgun-Community/wallet)
- [Railgun Cookbook](https://github.com/Railgun-Community/cookbook)
- [Peanut SDK](https://github.com/peanutprotocol/peanut-sdk/tree/main/src)

## Demo
### Demo Video
https://youtu.be/yKbU_A3ZPVA

### Demo App:
[ghost-pay-alpha.vercel.app](https://ghost-pay-alpha.vercel.app)

You can create an account with Metamask signing or use the following seed and password.  
- seed phrase:
deny ivory target dumb album valley knee broccoli dumb fiscal require process
- password: 
Qazwsx0812
