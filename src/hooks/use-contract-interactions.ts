import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo } from "react";
import { encodeFunctionData } from "viem";
import {
	useAccount,
	useChainId,
	useReadContract,
	useSendCalls,
	useWaitForCallsStatus,
} from "wagmi";
import {
	COOKIE_CLICKER_ABI,
	COOKIE_CLICKER_ADDRESS,
} from "@/lib/contracts/cookie-clicker-abi";

export interface BestSession {
	cookies: number;
	timestamp: number;
	duration: number;
	username?: string;
}

export interface GameSession {
	cookies: number;
	timestamp: number;
	duration: number;
	username: string;
}

export function useContractInteractions(
	promptForUsername?: () => Promise<string | null>,
	userName?: string | null,
	isUsernameSetOnBlockchain?: boolean,
) {
	const { address, isConnected } = useAccount();
	const { sendCalls, data: callsId, isPending, error } = useSendCalls();
	const { data: callsStatus, isLoading: isConfirming } = useWaitForCallsStatus({
		id: callsId?.id,
		query: {
			enabled: !!callsId?.id,
			refetchInterval: 2000,
		},
	});

	const isConfirmed = callsStatus?.status === "success";

	const chainId = useChainId();

	// Read contract data
	const { data: bestSessionData, refetch: refetchBestScore } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getPlayerBestScore",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
			refetchInterval: 15000,
		},
	});

	const { data: totalCookies, refetch: refetchTotalCookies } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getTotalCookiesClicked",
		query: {
			refetchInterval: 30000,
		},
	});

	const { data: sessionCount, refetch: refetchSessionCount } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getPlayerSessionCount",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
			refetchInterval: 15000,
		},
	});

	const { data: sessionHistoryData, refetch: refetchSessionHistory } =
		useReadContract({
			address: COOKIE_CLICKER_ADDRESS[chainId],
			abi: COOKIE_CLICKER_ABI,
			functionName: "getPlayerSessionHistory",
			args: address ? [address] : undefined,
			query: {
				enabled: !!address,
				refetchInterval: 15000,
			},
		});

	const recordGameSession = useCallback(
		async (cookies: number, duration: number) => {
			if (!isConnected || !address) {
				return;
			}

			if (!promptForUsername) {
				return;
			}

			try {
				const username = await promptForUsername();
				if (!username) {
					return;
				}

				const calls = [];

				// Add setUsername call if username not set on blockchain
				if (!isUsernameSetOnBlockchain) {
					calls.push({
						to: COOKIE_CLICKER_ADDRESS[chainId] as `0x${string}`,
						data: encodeFunctionData({
							abi: COOKIE_CLICKER_ABI,
							functionName: "setUsername",
							args: [username],
						}),
					});
				}

				// Add recordGameSession call
				calls.push({
					to: COOKIE_CLICKER_ADDRESS[chainId] as `0x${string}`,
					data: encodeFunctionData({
						abi: COOKIE_CLICKER_ABI,
						functionName: "recordGameSession",
						args: [BigInt(cookies), BigInt(duration)],
					}),
				});

				sendCalls({
					calls,
				});
			} catch (err) {
				console.error("Failed to record game session:", err);
			}
		},
		[
			isConnected,
			address,
			sendCalls,
			chainId,
			promptForUsername,
			isUsernameSetOnBlockchain,
		],
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
				refetchSessionHistory();
			}, 1000);
		}
	}, [
		isConfirmed,
		refetchBestScore,
		refetchTotalCookies,
		refetchSessionCount,
		refetchSessionHistory,
	]);

	// Extract best session data
	const bestSession: BestSession | null = useMemo(() => {
		return bestSessionData
			? {
					cookies: Number(bestSessionData[0]),
					timestamp: Number(bestSessionData[1]),
					duration: Number(bestSessionData[2]),
					username: bestSessionData[3] || undefined,
				}
			: null;
	}, [bestSessionData]);

	// Extract session history data
	const sessionHistory: GameSession[] = useMemo(() => {
		return sessionHistoryData
			? (
					sessionHistoryData as Array<{
						cookies: bigint;
						timestamp: bigint;
						duration: bigint;
					}>
				).map((session) => ({
					cookies: Number(session.cookies),
					timestamp: Number(session.timestamp),
					duration: Number(session.duration),
					username: userName || "",
				}))
			: [];
	}, [sessionHistoryData, userName]);

	return {
		address,
		isConnected,
		bestScore: bestSession?.cookies || 0,
		bestSession,
		totalCookies: totalCookies ? Number(totalCookies) : 0,
		sessionCount: sessionCount ? Number(sessionCount) : 0,
		sessionHistory,
		recordGameSession,
		isPending,
		isConfirming,
		isConfirmed,
		callsId,
		callsStatus,
		error,
		refetchBestScore,
		refetchTotalCookies,
		refetchSessionCount,
		refetchSessionHistory,
		hash: callsStatus?.receipts?.[0]?.transactionHash,
	};
}
