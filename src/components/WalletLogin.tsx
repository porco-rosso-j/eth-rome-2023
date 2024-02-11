// WalletLogin.tsx

import { Box, Input, Button, Text, Textarea, Link } from "@chakra-ui/react";
import React, { useState } from "react";
import { useContext } from "react";
import UserCredentialContext from "../context/userCredential";
import { BrowserProvider, Mnemonic } from "ethers";

// function isValidrailgunWalletIDFormat(input: string): boolean {
//   const words = input.trim().split(/\s+/);
//   return words.length === 12;
// }

declare global {
	interface Window {
		ethereum: any;
	}
}

function obscureWords(input: string): string {
	const words = input.trim().split(/\s+/);
	const obscured = words.map((word) => "*".repeat(word.length));
	return obscured.join(" ");
}

const WalletLogin: React.FC = () => {
	const {
		saveRailgunWalletID,
		saveRailgunWalletMnemonic,
		savePassword,
		railgunWalletID,
		railgunWalletMnemonic,
	} = useContext(UserCredentialContext);
	const [railgunWalletIDInput, setRailgunWalletIDInput] = useState<string>("");
	const [railgunWalletMnemonicInput, setRailgunWalletMnemonicInput] =
		useState<string>("");
	const [passwordInput, setPasswordInput] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isMetamaskLogin, setIsMetamaskLogin] = useState<boolean>(false);

	const onClickLogin = () => {
		if (isMetamaskLogin) {
			onClickMetamaskLogin();
		} else {
			if (
				railgunWalletMnemonic &&
				!railgunWalletID &&
				railgunWalletIDInput === ""
			) {
				setErrorMessage("Please input the wallet id");
				return;
			}
			if (!railgunWalletMnemonic && railgunWalletMnemonicInput === "") {
				setErrorMessage("Please input the wallet mnemonic");
				return;
			}
			// if (!railgunWalletID && !isValidrailgunWalletIDFormat(railgunWalletIDInput)) {
			//   setErrorMessage('Invalid seed phrase')
			//   return
			// }

			if (passwordInput === "") {
				setErrorMessage("Please input password");
				return;
			}

			setErrorMessage("");

			if (railgunWalletIDInput) {
				saveRailgunWalletID(railgunWalletIDInput);
			}
			if (railgunWalletMnemonicInput) {
				saveRailgunWalletMnemonic(railgunWalletMnemonicInput);
			}
			if (passwordInput) {
				savePassword(passwordInput);
			}
		}
	};

	const onClickMetamaskLogin = async () => {
		const provider = new BrowserProvider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = await provider.getSigner();
		console.log("Account:", await signer.getAddress());

		const message = "sign this msg to create new ghsot pay wallet";
		const entropy = (await signer.signMessage(message)).slice(0, 16);
		console.log("entropy:", entropy);

		const mnemonic = Mnemonic.fromEntropy(Buffer.from(entropy)).phrase.trim();
		console.log("mnemonic:", mnemonic);

		setRailgunWalletMnemonicInput(mnemonic);
		saveRailgunWalletMnemonic(mnemonic);

		setPasswordInput(entropy);
		savePassword(entropy);
	};

	const useMMLogin = () => {
		console.log("setIsMetamaskLogin");
		if (isMetamaskLogin) {
			setIsMetamaskLogin(false);
		} else {
			setIsMetamaskLogin(true);
		}
	};

	return (
		<Box p={8} mx="auto" mt={20} borderRadius="lg" boxShadow="lg">
			<Text fontSize="xl" fontWeight="bold" mb={6}>
				Login to your wallet
			</Text>
			{!isMetamaskLogin ? (
				<Box>
					<Box>
						{railgunWalletMnemonic ? (
							<Box mb={6}>
								<Text mb={2}>Railgun Wallet ID</Text>
								<Textarea
									defaultValue={
										railgunWalletID ? obscureWords(railgunWalletID) : ""
									}
									onChange={(e) => setRailgunWalletIDInput(e.target.value)}
									placeholder="45094f71...f3gsf81840"
								/>
							</Box>
						) : (
							<Box mb={6}>
								<Text>Railgun Wallet Mnemonic</Text>
								<Text fontSize="12px" mb={2} color="gray.500">
									{" "}
									You have to use mnemonic to login to the wallet at the first
									time.
								</Text>
								<Textarea
									onChange={(e) =>
										setRailgunWalletMnemonicInput(e.target.value)
									}
									placeholder="apple banana cherry dolphin elephant frog grape hill igloo jelly kite lemon"
								/>
							</Box>
						)}
					</Box>

					<Box mb={4}>
						<Text mb={2}>Password</Text>
						<Input
							type="password"
							onChange={(e) => setPasswordInput(e.target.value)}
						/>
					</Box>
					<Text color="red.500" mb={4}>
						{errorMessage}
					</Text>
				</Box>
			) : null}
			<Button colorScheme="teal" w="100%" onClick={onClickLogin}>
				{isMetamaskLogin ? `Sign message to login` : `Import Railgun Wallet`}
			</Button>
			<Button
				fontSize={16}
				mt={2}
				w="100%"
				colorScheme="teal"
				variant="ghost"
				onClick={useMMLogin}
			>
				{isMetamaskLogin
					? `Import your railgun wallet`
					: `Or use Metamask to Login`}
			</Button>
		</Box>
	);
};

export default WalletLogin;
