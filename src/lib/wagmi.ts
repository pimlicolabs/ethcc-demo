import { createConfig, http } from "wagmi";
import { base, baseSepolia, mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { Batua } from "@/lib/batua";

// Initialize Batua wallet - it will appear as a connector automatically
Batua.create({
	chains: [sepolia, baseSepolia, base],
	dappName: "ETHCC Demo",
	walletName: "Batua",
	rpc: {
		transports: {
			[sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
			[baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com"),
			[base.id]: http("https://base-rpc.publicnode.com"),
		},
	},
	bundler: {
		transports: {
			[sepolia.id]: http(
				`https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY || ""}`,
			),
			[baseSepolia.id]: http(
				`https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY || ""}`,
			),
			[base.id]: http(
				`https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY || ""}`,
			),
		},
	},
	// Optional: Add paymaster for sponsored transactions
	...(process.env.NEXT_PUBLIC_PIMLICO_API_KEY && {
		paymaster: {
			transports: {
				[sepolia.id]: http(
					`https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
				),
				[baseSepolia.id]: http(
					`https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
				),
				[base.id]: http(
					`https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
				),
			},
			context: {
				sponsorshipPolicyId: process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID,
			},
		},
	}),
});

export const config = createConfig({
	chains: [mainnet, sepolia, baseSepolia, base],
	ssr: true,
	connectors: [injected()],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[baseSepolia.id]: http(),
		[base.id]: http(),
	},
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}
