import WalletLogin from "src/components/WalletLogin";
import React from "react";
import Header from "./components/Header";
import { ChakraProvider, Box } from "@chakra-ui/react";
import useUserCredential from "./hooks/useUserCredential";
import UserCredentialContext from "./context/userCredential";
import MainPage from "./components/MainPage";
import initializeRailgunSystem from "./utils/initializeRailgunSystemRailgunSystem";
import { useEffect } from "react";
import chakraDefaultTheme from "./theme";
function App() {
	const {
		railgunWalletID,
		railgunWalletMnemonic,
		password,
		saveRailgunWalletID,
		saveRailgunWalletMnemonic,
		savePassword,
		logout,
	} = useUserCredential();

	useEffect(() => {
		async function init() {
			await initializeRailgunSystem();
		}
		init();
	}, []);

	const getShowLoginPage = () => {
		console.log("password :", password);
		if (!password) {
			return true;
		}

		if (!railgunWalletID && !railgunWalletMnemonic) {
			return true;
		}

		return false;
	};

	return (
		<ChakraProvider theme={chakraDefaultTheme}>
			<UserCredentialContext.Provider
				value={{
					railgunWalletID,
					railgunWalletMnemonic,
					password,
					saveRailgunWalletID,
					saveRailgunWalletMnemonic,
					savePassword,
					logout,
				}}
			>
				<div>
					<Header />

					<Box maxW="768px" mx="auto">
						{getShowLoginPage() ? (
							<WalletLogin />
						) : (
							<Box p="16px">
								<MainPage />
							</Box>
						)}
					</Box>
				</div>
			</UserCredentialContext.Provider>
		</ChakraProvider>
	);
}

export default App;
