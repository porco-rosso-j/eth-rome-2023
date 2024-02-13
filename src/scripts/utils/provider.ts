import { FallbackProviderJsonConfig } from "@railgun-community/shared-models";

// const shouldDebug = 0;

export const MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI: FallbackProviderJsonConfig =
	{
		chainId: 5,
		providers: [
			{
				// provider: "https://ethereum-goerli.publicnode.com",
				provider:
					"https://eth-goerli.g.alchemy.com/v2/L8eKUNVmlKk7r9nSMmZIP-MUfgTktQc3",
				priority: 1,
				weight: 2,
				maxLogsPerBatch: 10,
				stallTimeout: 2500,
			},
			{
				provider: "https://rpc.ankr.com/eth_goerli",
				priority: 1,
				weight: 2,
				maxLogsPerBatch: 10,
			},
		],
	};

// export const MOCK_FALLBACK_PROVIDER_JSON_CONFIG_ETH: FallbackProviderJsonConfig =
// 	{
// 		chainId: 1,
// 		providers: [
// 			{
// 				provider: "https://rpc.ankr.com/eth",
// 				priority: 1,
// 				weight: 1,
// 				maxLogsPerBatch: 10,
// 				stallTimeout: 2500,
// 			},
// 		],
// 	};
