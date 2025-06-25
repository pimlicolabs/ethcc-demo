import type { Chain, Transport } from "viem";
import {
	type BundlerClient,
	createBundlerClient,
} from "viem/account-abstraction";
import type { Internal } from "@/lib/batua/type";

const clientCache = new Map<string, BundlerClient<Transport, Chain>>();

export const chainPollingIntervals = new Map<number, number>([
	[42161, Math.floor(250 / 4)], // arbitrum
	[11155111, Math.floor(12000 / 4)], // sepolia
	[421614, Math.floor(300 / 4)], // arbitrumSepolia
	[8453, Math.floor(2000 / 4)], // base
	[84532, Math.floor(200 / 4)], // baseSepolia
	[10, Math.floor(2000 / 4)], // optimism
]);

export const getBundlerClient = ({
	internal,
	chainId,
}: {
	internal: Internal;
	chainId?: number | undefined;
}): BundlerClient<Transport, Chain> => {
	const { config, id, store } = internal;
	const { chains } = config;

	const state = store.getState();
	const chain = chains.find((chain) => chain.id === chainId || state.chain.id);
	if (!chain) throw new Error("chain not found");

	const transport = config.bundler.transports[chain.id];
	if (!transport) throw new Error("transport not found");

	const key = [id, chainId].filter(Boolean).join(":");
	if (clientCache.has(key)) {
		const client = clientCache.get(key);

		// should never happen but TS
		if (!client) {
			throw new Error("client not found");
		}

		return client;
	}
	const client = createBundlerClient({
		chain,
		transport: transport,
		pollingInterval: chainPollingIntervals.get(chain.id) ?? 500,
	});
	clientCache.set(key, client);
	return client;
};
