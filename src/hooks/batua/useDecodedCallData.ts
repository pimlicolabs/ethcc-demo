import { useEffect, useState } from "react";
import type { Address, Hex } from "viem";
import { decodeCallData } from "@/lib/batua/helpers/decoder";

export type DecodedCallData = {
	functionName?: string;
	args?: unknown[];
} | null;

export const useDecodedCallData = ({
	calls,
}: {
	calls: readonly {
		to?: Address | undefined;
		data?: Hex | undefined;
		value?: Hex | undefined;
	}[];
}) => {
	const [decodedCallData, setDecodedCallData] = useState<
		DecodedCallData[] | null
	>(null);

	useEffect(() => {
		const decodedCallDataPromises = Promise.all(
			calls.map((call) => decodeCallData(call.data as Hex)),
		);

		decodedCallDataPromises.then((results) => {
			setDecodedCallData(results as DecodedCallData[]);
		});
	}, [calls]);

	return decodedCallData;
};
