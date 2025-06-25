import confetti from "canvas-confetti";
import { useCallback, useEffect } from "react";
import {
	useAccount,
	useWaitForTransactionReceipt,
	useWriteContract,
	useReadContract,
	useChainId,
} from "wagmi";
import {
	COOKIE_CLICKER_ADDRESS,
	COOKIE_CLICKER_ABI,
} from "@/lib/contracts/cookie-clicker-abi";

export interface BestSession {
	cookies: number;
	timestamp: number;
	duration: number;
	username?: string;
}

export function useContractInteractions(
	promptForUsername?: () => Promise<string | null>,
) {
	const { address, isConnected } = useAccount();
	const { writeContract, data: hash, isPending, error } = useWriteContract();
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	const chainId = useChainId();

	// Read contract data
	const { data: bestSessionData, refetch: refetchBestScore } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getPlayerBestScore",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
			refetchInterval: 5000,
		},
	});

	const { data: totalCookies, refetch: refetchTotalCookies } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getTotalCookiesClicked",
		query: {
			refetchInterval: 10000,
		},
	});

	const { data: sessionCount, refetch: refetchSessionCount } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getPlayerSessionCount",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
			refetchInterval: 5000,
		},
	});

	const recordGameSession = useCallback(
		async (cookies: number, duration: number) => {
			if (!isConnected || !address) return;
			if (!promptForUsername) {
				return;
			}

			try {
				const username = await promptForUsername();
				if (!username) {
					return;
				}

				writeContract({
					address: COOKIE_CLICKER_ADDRESS[chainId],
					abi: COOKIE_CLICKER_ABI,
					functionName: "recordGameSession",
					args: [BigInt(cookies), BigInt(duration), username],
				});
			} catch (err) {
				console.error("Failed to record game session:", err);
			}
		},
		[isConnected, address, writeContract, chainId, promptForUsername],
	);

	// Success confetti and refetch data when transaction is confirmed
	useEffect(() => {
		if (isConfirmed) {
			confetti({
				particleCount: 200,
				spread: 100,
				origin: { y: 0.3 },
			});

			// Refetch all contract data with a small delay to ensure blockchain state is updated
			setTimeout(() => {
				refetchBestScore();
				refetchTotalCookies();
				refetchSessionCount();
			}, 1000);
		}
	}, [isConfirmed, refetchBestScore, refetchTotalCookies, refetchSessionCount]);

	// Extract best session data
	const bestSession: BestSession | null = bestSessionData
		? {
				cookies: Number(bestSessionData[0]),
				timestamp: Number(bestSessionData[1]),
				duration: Number(bestSessionData[2]),
				username: bestSessionData[3] || undefined,
			}
		: null;

	return {
		address,
		isConnected,
		bestScore: bestSession?.cookies || 0,
		bestSession,
		totalCookies: totalCookies ? Number(totalCookies) : 0,
		sessionCount: sessionCount ? Number(sessionCount) : 0,
		recordGameSession,
		isPending,
		isConfirming,
		isConfirmed,
		error,
		refetchBestScore,
		refetchTotalCookies,
		refetchSessionCount,
	};
}
