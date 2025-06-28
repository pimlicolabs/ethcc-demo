import { createConfig, http } from "wagmi";
import {
	arbitrum,
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
	chains: [arbitrum],
	dappName: "Pimlico",
	walletName: "Batua",
	boosted: true,
	rpc: {
		transports: {
			[arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://arbitrum.drpc.org"),
			//			[baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com"),
			//			[base.id]: http("https://base-rpc.publicnode.com"),
		},
	},
	bundler: {
		transports: {
			[arbitrum.id]: http(
				`https://api.pimlico.io/v2/${arbitrum.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY || ""}`,
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
	// 			[arbitrum.id]: http(
	// 				`https://api.pimlico.io/v2/${arbitrum.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
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
		arbitrum,
	],
	ssr: true,
	connectors: [injected()],
	transports: {
		[arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://arbitrum.drpc.org"),
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
