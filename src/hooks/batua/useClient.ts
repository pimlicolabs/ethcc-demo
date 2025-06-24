import { useMemo } from "react";
import type { Chain } from "viem";
import { getClient } from "@/lib/batua/helpers/getClient";
import type { Internal } from "@/lib/batua/type";

export const useClient = ({
	internal,
	chain,
}: {
	internal: Internal;
	chain: Chain;
}) => {
	const client = useMemo(
		() => getClient({ internal, chainId: chain.id }),
		[internal, chain],
	);
	return client;
};
