import { http, type Transport } from "viem";
import { base, baseSepolia, type Chain, sepolia } from "viem/chains";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { coingeckoPriceManager } from "@/lib/batua/coingeckoPriceManager";
import { local } from "@/lib/batua/implementations/local";
import { Provider } from "@/lib/batua/provider";
import { idb } from "@/lib/batua/storage";
import type {
	Implementation,
	Internal,
	PriceManager,
	State,
	Storage,
} from "@/lib/batua/type";

const defaultConfig = {
	dappName: "Dapp",
	walletName: "Batua",
	chains: [sepolia, baseSepolia, base],
	announceProvider: true,
	storage: idb(),
	rpc: {
		transports: {
			[sepolia.id]: http(`https://public.pimlico.io/v2/${sepolia.id}/rpc`),
		},
	},
	bundler: {
		transports: {
			[sepolia.id]: http(`https://public.pimlico.io/v2/${sepolia.id}/rpc`),
		},
	},
	implementation: local(),
	priceManager: coingeckoPriceManager(),
	boosted: false,
} as const satisfies Config;

export type Config<
	chains extends readonly [Chain, ...Chain[]] = readonly [Chain, ...Chain[]],
> = {
	dappName: string;
	walletName: string;
	announceProvider: boolean;
	chains: chains | readonly [Chain, ...Chain[]];
	implementation: Implementation;
	storage: Storage;
	rpc: {
		transports: Record<chains[number]["id"], Transport>;
	};
	paymaster?: {
		transports: Record<chains[number]["id"], Transport>;
		context: unknown;
	};
	bundler: {
		transports: Record<chains[number]["id"], Transport>;
	};
	priceManager: PriceManager;
	boosted:
		| boolean
		| {
				callGasLimit: bigint;
				verificationGasLimit: bigint;
				preVerificationGas: bigint;
		  };
};

export const Batua = {
	create: <
		chains extends readonly [Chain, ...Chain[]] = readonly [Chain, ...Chain[]],
	>(parameters?: {
		chains: chains;
		announceProvider?: boolean;
		storage?: Storage;
		implementation?: Implementation | null;
		rpc: {
			transports: Record<chains[number]["id"], Transport>;
		};
		paymaster?: {
			transports: Record<chains[number]["id"], Transport>;
			context: unknown;
		};
		bundler: {
			transports: Record<chains[number]["id"], Transport>;
		};
		dappName?: string;
		walletName?: string;
		priceManager?: PriceManager;
		boosted?:
			| boolean
			| {
					callGasLimit: bigint;
					verificationGasLimit: bigint;
					preVerificationGas: bigint;
			  };
	}) => {
		const config: Config = {
			storage: parameters?.storage ?? defaultConfig.storage,
			chains: parameters?.chains ?? defaultConfig.chains,
			announceProvider: parameters?.announceProvider ?? true,
			rpc: parameters?.rpc ?? defaultConfig.rpc,
			paymaster: parameters?.paymaster,
			bundler: parameters?.bundler ?? defaultConfig.bundler,
			implementation:
				parameters?.implementation ?? defaultConfig.implementation,
			dappName: parameters?.dappName ?? defaultConfig.dappName,
			walletName: parameters?.walletName ?? defaultConfig.walletName,
			priceManager: parameters?.priceManager ?? defaultConfig.priceManager,
			boosted: parameters?.boosted ?? defaultConfig.boosted,
		};

		let implementation = config.implementation;
		let priceManager = config.priceManager;

		const store = createStore(
			subscribeWithSelector(
				persist<State>(
					() => ({
						accounts: [],
						chain: config.chains[0],
						requestQueue: [],
						price: undefined,
					}),
					{
						name: "batua.store",
						partialize(state) {
							return {
								accounts: state.accounts.map((account) => ({
									...account,
									sign: undefined,
								})),
								chain: state.chain,
								price: state.price,
							} as unknown as State;
						},
						storage: config.storage,
					},
				),
			),
		);

		const internal: Internal = {
			config,
			id: crypto.randomUUID(),
			getImplementation() {
				return implementation;
			},
			setImplementation(i) {
				destroyImplementation();
				implementation = i;
				destroyImplementation = i.setup({
					internal,
				});
				return destroyImplementation;
			},
			getPriceManager() {
				return priceManager;
			},
			setPriceManager(p) {
				destroyPriceManager();
				priceManager = p;
				destroyPriceManager = p.setup({
					internal,
				});
				return destroyPriceManager;
			},
			store,
		};

		const provider = Provider.from({ internal });

		let destroyImplementation = implementation.setup({
			internal,
		});
		let destroyPriceManager = priceManager.setup({
			internal,
		});

		return {
			destroy: () => {
				provider.destroy();
				destroyImplementation();
				destroyPriceManager();
			},
		};
	},
};
