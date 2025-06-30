"use client";

import { useReadContract, useChainId } from "wagmi";
import {
	COOKIE_CLICKER_ABI,
	COOKIE_CLICKER_ADDRESS,
} from "@/lib/contracts/cookie-clicker-abi";

interface UsernameOrAddressProps {
	address: string;
	isCurrentUser?: boolean;
}

export function UsernameOrAddress({
	address,
	isCurrentUser,
}: UsernameOrAddressProps) {
	const chainId = useChainId();
	const { data: username } = useReadContract({
		address:
			COOKIE_CLICKER_ADDRESS[chainId as keyof typeof COOKIE_CLICKER_ADDRESS],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getUsername",
		args: [address as `0x${string}`],
		query: {
			enabled: !!address,
			staleTime: 30 * 1000, // Cache for 30 seconds
		},
	});

	const displayName =
		username || `${address.slice(0, 6)}...${address.slice(-4)}`;

	return (
		<span className={isCurrentUser ? "font-medium text-primary" : ""}>
			{displayName}
			{isCurrentUser && " (You)"}
		</span>
	);
}
