import { useCallback, useEffect, useState } from "react";
import { useChainId, usePublicClient, useReadContract } from "wagmi";
import {
	COOKIE_CLICKER_ADDRESS,
	COOKIE_CLICKER_ABI,
} from "@/lib/contracts/cookie-clicker-abi";

export interface LeaderboardEntry {
	address: string;
	score: number;
	username?: string;
}

export function useLeaderboard() {
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const chainId = useChainId();
	const publicClient = usePublicClient();

	// Fetch leaderboard data
	const fetchLeaderboard = useCallback(async () => {
		if (!publicClient) return;

		setIsLoading(true);
		try {
			// Get current block number
			const currentBlock = await publicClient.getBlockNumber();

			// Fetch logs from the last 40000 blocks (within the 50000 limit)
			const fromBlock =
				currentBlock - BigInt(40000) > BigInt(0)
					? currentBlock - BigInt(40000)
					: BigInt(0);

			const logs = await publicClient.getLogs({
				address: COOKIE_CLICKER_ADDRESS[chainId],
				event: {
					type: "event",
					name: "NewBestScore",
					inputs: [
						{ name: "player", type: "address", indexed: true },
						{ name: "newBestScore", type: "uint256", indexed: false },
						{ name: "previousBestScore", type: "uint256", indexed: false },
					],
				},
				fromBlock,
				toBlock: "latest",
			});

			// Group by player and get their best score
			const playerScores = new Map<string, number>();

			logs.forEach((log) => {
				const player = log.args.player as string;
				const score = Number(log.args.newBestScore);

				const existingScore = playerScores.get(player);
				if (!existingScore || existingScore < score) {
					playerScores.set(player, score);
				}
			});

			// Convert to array and sort by score descending
			const leaderboardData = Array.from(playerScores.entries())
				.map(([address, score]) => ({ address, score }))
				.sort((a, b) => b.score - a.score)
				.slice(0, 10); // Top 10

			// Fetch usernames for each player
			const enrichedLeaderboard = await Promise.all(
				leaderboardData.map(async (entry) => {
					try {
						const bestScoreData = await publicClient.readContract({
							address: COOKIE_CLICKER_ADDRESS[chainId],
							abi: COOKIE_CLICKER_ABI,
							functionName: "getPlayerBestScore",
							args: [entry.address],
						});
						return {
							...entry,
							username: bestScoreData[3] || undefined,
						};
					} catch (error) {
						console.error(
							`Failed to fetch username for ${entry.address}:`,
							error,
						);
						return entry;
					}
				}),
			);

			setLeaderboard(enrichedLeaderboard);
		} catch (error) {
			console.error("Failed to fetch leaderboard:", error);
			// Fallback: try with an even smaller range
			try {
				const currentBlock = await publicClient.getBlockNumber();
				const fromBlock =
					currentBlock - BigInt(10000) > BigInt(0)
						? currentBlock - BigInt(10000)
						: BigInt(0);

				const logs = await publicClient.getLogs({
					address: COOKIE_CLICKER_ADDRESS[chainId],
					event: {
						type: "event",
						name: "NewBestScore",
						inputs: [
							{ name: "player", type: "address", indexed: true },
							{ name: "newBestScore", type: "uint256", indexed: false },
							{ name: "previousBestScore", type: "uint256", indexed: false },
						],
					},
					fromBlock,
					toBlock: "latest",
				});

				const playerScores = new Map<string, number>();
				logs.forEach((log) => {
					const player = log.args.player as string;
					const score = Number(log.args.newBestScore);

					const existingScore = playerScores.get(player);
					if (!existingScore || existingScore < score) {
						playerScores.set(player, score);
					}
				});

				const leaderboardData = Array.from(playerScores.entries())
					.map(([address, score]) => ({ address, score }))
					.sort((a, b) => b.score - a.score)
					.slice(0, 10);

				// Fetch usernames for fallback data too
				const enrichedLeaderboard = await Promise.all(
					leaderboardData.map(async (entry) => {
						try {
							const bestScoreData = await publicClient.readContract({
								address: COOKIE_CLICKER_ADDRESS[chainId],
								abi: COOKIE_CLICKER_ABI,
								functionName: "getPlayerBestScore",
								args: [entry.address],
							});
							return {
								...entry,
								username: bestScoreData[3] || undefined,
							};
						} catch (error) {
							console.error(
								`Failed to fetch username for ${entry.address}:`,
								error,
							);
							return entry;
						}
					}),
				);

				setLeaderboard(enrichedLeaderboard);
			} catch (fallbackError) {
				console.error("Fallback leaderboard fetch also failed:", fallbackError);
			}
		}
		setIsLoading(false);
	}, [publicClient, chainId]);

	// Fetch leaderboard on mount
	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	const refetchLeaderboard = useCallback(() => {
		// Refetch leaderboard with a delay
		setTimeout(() => {
			fetchLeaderboard();
		}, 2000);
	}, [fetchLeaderboard]);

	return {
		leaderboard,
		isLoading,
		fetchLeaderboard,
		refetchLeaderboard,
	};
}
