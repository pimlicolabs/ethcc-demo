import { useEffect, useState } from "react";
import { useChainId, useReadContract } from "wagmi";
import {
	COOKIE_CLICKER_ABI,
	COOKIE_CLICKER_ADDRESS,
} from "@/lib/contracts/cookie-clicker-abi";

export interface LeaderboardEntry {
	address: string;
	score: number;
	username?: string;
}

export function useLeaderboard() {
	const chainId = useChainId();
	const [hasInitialData, setHasInitialData] = useState(false);

	const {
		data: leaderboardData,
		isLoading: isContractLoading,
		refetch: fetchLeaderboard,
	} = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getTop10GameSessions",
		query: {
			refetchInterval: 10000, // Refetch every 10 seconds
			staleTime: 5000, // Consider data stale after 5 seconds
		},
	});

	// Track when we first get data
	useEffect(() => {
		if (leaderboardData && !hasInitialData) {
			setHasInitialData(true);
		}
	}, [leaderboardData, hasInitialData]);

	// Transform the contract data into the expected format
	const leaderboard: LeaderboardEntry[] = leaderboardData
		? leaderboardData[0]
				.map((address, index) => ({
					address: address as string,
					score: Number(leaderboardData[1][index]),
					username: leaderboardData[4][index] || undefined,
				}))
				.filter(
					(entry) =>
						entry.address !== "0x0000000000000000000000000000000000000000",
				)
		: [];

	const refetchLeaderboard = () => {
		// Refetch leaderboard with a delay
		setTimeout(() => {
			fetchLeaderboard();
		}, 2000);
	};

	// Only show loading on initial fetch, not on background updates
	const isLoading = isContractLoading && !hasInitialData;

	return {
		leaderboard,
		isLoading,
		fetchLeaderboard,
		refetchLeaderboard,
	};
}
