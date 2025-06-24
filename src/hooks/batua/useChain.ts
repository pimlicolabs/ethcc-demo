import { useMemo } from "react";
import type { Internal } from "@/lib/batua/type";

export const useChain = (internal: Internal) => {
	const chain = useMemo(() => {
		return internal.store.getState().chain;
	}, [internal]);

	return chain;
};
