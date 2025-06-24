import { useEffect, useState } from "react";
import type { Internal } from "@/lib/batua/type";

export const useEthPrice = (internal: Internal) => {
	const [ethPrice, setEthPrice] = useState(1500 * 100);

	useEffect(() => {
		const unsubscribe = internal.store.subscribe(
			(x) => x.price,
			(price) => {
				setEthPrice(Number(BigInt((price ?? 1500) * 100)));
			},
		);

		return () => {
			unsubscribe();
		};
	}, [internal]);

	return ethPrice;
};
