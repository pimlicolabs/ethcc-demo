import { createConfig, http } from "wagmi";
import {
	// arbitrum,
	arbitrumSepolia,
	// base,
	// baseSepolia,
	// bsc,
	// celo,
	// linea,
	// mainnet,
	// mantle,
	// optimism,
	// polygon,
	// sepolia,
	// worldchain,
} from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { Batua } from "@/lib/batua";

// Initialize Batua wallet - it will appear as a connector automatically
Batua.create({
	// chains: [sepolia, baseSepolia, base],
	chains: [arbitrumSepolia],
	dappName: "Pimlico",
	walletName: "Batua",
	boosted: {
		callGasLimit: BigInt(150_000),
		verificationGasLimit: BigInt(500_000),
		preVerificationGas: BigInt(0),
	},
	rpc: {
		transports: {
			[arbitrumSepolia.id]: http("https://arbitrum-sepolia-rpc.publicnode.com"),
			//			[baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com"),
			//			[base.id]: http("https://base-rpc.publicnode.com"),
		},
	},
	bundler: {
		transports: {
			[arbitrumSepolia.id]: http(
				`https://api.pimlico.io/v2/${arbitrumSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY || ""}`,
			),
			// [baseSepolia.id]: http(
			// 	`https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY || ""}`,
			// ),
			// [base.id]: http(
			// 	`https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY || ""}`,
			// ),
		},
	},
	// Optional: Add paymaster for sponsored transactions
	// ...(process.env.NEXT_PUBLIC_PIMLICO_API_KEY && {
	// 	paymaster: {
	// 		transports: {
	// 			[arbitrumSepolia.id]: http(
	// 				`https://api.pimlico.io/v2/${arbitrumSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
	// 			),
	// 			// [baseSepolia.id]: http(
	// 			// 	`https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
	// 			// ),
	// 			// [base.id]: http(
	// 			// 	`https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
	// 			// ),
	// 		},
	// 		context: {
	// 			sponsorshipPolicyId: process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID,
	// 		},
	// 	},
	// }),
});

export const config = createConfig({
	chains: [
		// mainnet,
		// base,
		// polygon,
		// optimism,
		// arbitrum,
		// linea,
		// bsc,
		// sepolia,
		// baseSepolia,
		// worldchain,
		// mantle,
		// celo,
		arbitrumSepolia,
	],
	ssr: true,
	connectors: [injected()],
	transports: {
		[arbitrumSepolia.id]: http("https://arbitrum-sepolia-rpc.publicnode.com"),
		// [mainnet.id]: http(),
		// [base.id]: http(),
		// [polygon.id]: http(),
		// [optimism.id]: http(),
		// [arbitrum.id]: http(),
		// [linea.id]: http(),
		// [bsc.id]: http(),
		// [sepolia.id]: http(),
		// [baseSepolia.id]: http(),
		// [worldchain.id]: http(),
		// [mantle.id]: http(),
		// [celo.id]: http(),
	},
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}
