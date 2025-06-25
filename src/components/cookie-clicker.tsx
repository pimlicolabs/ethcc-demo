"use client";

import confetti from "canvas-confetti";
import { Loader2, Trophy, Clock, Cookie, Crown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	useAccount,
	useWaitForTransactionReceipt,
	useWriteContract,
	useReadContract,
	useChainId,
	usePublicClient,
} from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	COOKIE_CLICKER_ADDRESS,
	COOKIE_CLICKER_ABI,
} from "@/lib/contracts/cookie-clicker-abi";

export function CookieClicker() {
	const [cookies, setCookies] = useState(0);
	const [cookiesPerSecond, setCookiesPerSecond] = useState(0);
	const [upgrades, setUpgrades] = useState({
		cursor: { count: 0, cost: 15, cps: 0.1 },
		grandma: { count: 0, cost: 100, cps: 1 },
		farm: { count: 0, cost: 1100, cps: 8 },
		mine: { count: 0, cost: 12000, cps: 47 },
	});
	const [startTime, setStartTime] = useState<number | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);
	const [leaderboard, setLeaderboard] = useState<
		Array<{
			address: string;
			score: number;
		}>
	>([]);

	const { address, isConnected } = useAccount();
	const { writeContract, data: hash, isPending, error } = useWriteContract();
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	const chainId = useChainId();
	const publicClient = usePublicClient();

	// Fetch leaderboard data
	const fetchLeaderboard = useCallback(async () => {
		if (!publicClient) return;

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

			setLeaderboard(leaderboardData);
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

				setLeaderboard(leaderboardData);
			} catch (fallbackError) {
				console.error("Fallback leaderboard fetch also failed:", fallbackError);
			}
		}
	}, [publicClient, chainId]);

	// Fetch leaderboard on mount and when transaction is confirmed
	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	useEffect(() => {
		if (isConfirmed) {
			// Refetch leaderboard after transaction confirmation
			setTimeout(() => {
				fetchLeaderboard();
			}, 2000);
		}
	}, [isConfirmed, fetchLeaderboard]);

	// Read contract data
	const { data: bestScore, refetch: refetchBestScore } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "bestScores",
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

	// Auto-increment cookies based on CPS
	useEffect(() => {
		if (cookiesPerSecond > 0 && isPlaying) {
			const interval = setInterval(() => {
				setCookies((prev) => prev + cookiesPerSecond / 10);
			}, 100);
			return () => clearInterval(interval);
		}
	}, [cookiesPerSecond, isPlaying]);

	// Calculate total CPS whenever upgrades change
	useEffect(() => {
		const totalCps = Object.entries(upgrades).reduce(
			(total, [_, upgrade]) => total + upgrade.count * upgrade.cps,
			0,
		);
		setCookiesPerSecond(Number(totalCps.toFixed(1)));
	}, [upgrades]);

	// Calculate auto-upgrades based on best score
	const calculateAutoUpgrades = useCallback((score: number) => {
		const upgradeLevels = {
			cursor: 0,
			grandma: 0,
			farm: 0,
			mine: 0,
		};

		// Simple algorithm: allocate score to upgrades based on efficiency
		let remainingScore = score;

		// Buy cursors first (most cost-efficient for small scores)
		if (remainingScore >= 15) {
			upgradeLevels.cursor = Math.floor(Math.min(remainingScore / 100, 10));
			remainingScore -= upgradeLevels.cursor * 15;
		}

		// Then grandmas
		if (remainingScore >= 100) {
			upgradeLevels.grandma = Math.floor(Math.min(remainingScore / 500, 5));
			remainingScore -= upgradeLevels.grandma * 100;
		}

		// Then farms
		if (remainingScore >= 1100) {
			upgradeLevels.farm = Math.floor(Math.min(remainingScore / 3000, 3));
			remainingScore -= upgradeLevels.farm * 1100;
		}

		// Finally mines
		if (remainingScore >= 12000) {
			upgradeLevels.mine = Math.floor(Math.min(remainingScore / 24000, 2));
		}

		return upgradeLevels;
	}, []);

	const clickCookie = useCallback(() => {
		if (!isPlaying) {
			setIsPlaying(true);
			setStartTime(Date.now());

			// Apply auto-upgrades based on best score
			if (bestScore && Number(bestScore) > 0) {
				const autoUpgrades = calculateAutoUpgrades(Number(bestScore));

				setUpgrades({
					cursor: {
						count: autoUpgrades.cursor,
						cost: Math.floor(15 * 1.15 ** autoUpgrades.cursor),
						cps: 0.1,
					},
					grandma: {
						count: autoUpgrades.grandma,
						cost: Math.floor(100 * 1.15 ** autoUpgrades.grandma),
						cps: 1,
					},
					farm: {
						count: autoUpgrades.farm,
						cost: Math.floor(1100 * 1.15 ** autoUpgrades.farm),
						cps: 8,
					},
					mine: {
						count: autoUpgrades.mine,
						cost: Math.floor(12000 * 1.15 ** autoUpgrades.mine),
						cps: 47,
					},
				});

				// Show confetti for auto-upgrades
				if (
					autoUpgrades.cursor > 0 ||
					autoUpgrades.grandma > 0 ||
					autoUpgrades.farm > 0 ||
					autoUpgrades.mine > 0
				) {
					confetti({
						particleCount: 50,
						spread: 45,
						origin: { y: 0.8 },
					});
				}
			}
		}
		setCookies((prev) => prev + 1);
		setLastActivityTime(Date.now());
	}, [isPlaying, bestScore, calculateAutoUpgrades]);

	const stopGame = useCallback(async () => {
		if (!startTime || !isConnected || !address || !isPlaying) return;

		const duration = Math.floor((Date.now() - startTime) / 1000);
		const finalCookies = Math.floor(cookies);

		try {
			writeContract({
				address: COOKIE_CLICKER_ADDRESS[chainId],
				abi: COOKIE_CLICKER_ABI,
				functionName: "recordGameSession",
				args: [BigInt(finalCookies), BigInt(duration)],
			});

			// Reset game state
			setIsPlaying(false);
			setCookies(0);
			setCookiesPerSecond(0);
			setStartTime(null);
			setLastActivityTime(null);
			setUpgrades({
				cursor: { count: 0, cost: 15, cps: 0.1 },
				grandma: { count: 0, cost: 100, cps: 1 },
				farm: { count: 0, cost: 1100, cps: 8 },
				mine: { count: 0, cost: 12000, cps: 47 },
			});
		} catch (err) {
			console.error("Failed to record game session:", err);
		}
	}, [
		startTime,
		cookies,
		isConnected,
		address,
		writeContract,
		isPlaying,
		chainId,
	]);

	const buyUpgrade = useCallback(
		(upgradeKey: keyof typeof upgrades) => {
			setUpgrades((prev) => {
				const upgrade = prev[upgradeKey];
				if (cookies >= upgrade.cost) {
					setCookies((prevCookies) => prevCookies - upgrade.cost);
					setLastActivityTime(Date.now());

					// Trigger confetti
					confetti({
						particleCount: 100,
						spread: 70,
						origin: { y: 0.6 },
					});

					return {
						...prev,
						[upgradeKey]: {
							...upgrade,
							count: upgrade.count + 1,
							cost: Math.floor(upgrade.cost * 1.15),
						},
					};
				}
				return prev;
			});
		},
		[cookies],
	);

	// Inactivity detection - auto stop after 500ms of no activity
	useEffect(() => {
		if (isPlaying && lastActivityTime) {
			// Set new timer for 500ms
			const timer = setTimeout(() => {
				stopGame();
			}, 500);

			// Cleanup on unmount or when dependencies change
			return () => {
				clearTimeout(timer);
			};
		}
	}, [lastActivityTime, isPlaying, stopGame]);

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

	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return Math.floor(num).toString();
	};

	return (
		<div className="w-full max-w-2xl mx-auto p-4 space-y-6 pt-12 relative">
			{/* Loading Overlay */}
			{(isPending || isConfirming) && (
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<Card className="p-6 w-10/12">
						<div className="flex flex-col items-center space-y-4">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<div className="text-center">
								<p className="font-semibold">
									{isPending
										? "Submitting Score..."
										: "Confirming Transaction..."}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									Recording {formatNumber(Math.floor(cookies))} cookies
								</p>
							</div>
						</div>
					</Card>
				</div>
			)}
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-2">Cookie Clicker</h1>
				<div className="text-3xl font-bold text-primary mb-2">
					{formatNumber(cookies)} cookies
				</div>
				<div className="text-sm text-muted-foreground">
					{cookiesPerSecond > 0
						? `${cookiesPerSecond.toFixed(1)} per second`
						: "0 per second"}
				</div>
			</div>

			<div className="flex justify-center">
				<Button
					onClick={clickCookie}
					size="lg"
					className="w-32 h-32 rounded-full text-4xl bg-primary hover:bg-primary/90 active:scale-95 transition-transform touch-manipulation"
					style={{ WebkitTapHighlightColor: "transparent" }}
				>
					🍪
				</Button>
			</div>

			{/* Stats Section */}
			{isConnected && (
				<Card className="p-4">
					<h2 className="text-lg font-semibold mb-3">Your Stats</h2>
					{/* {bestScore && Number(bestScore) > 0 && !isPlaying ? (
						<Alert className="mb-3 bg-secondary">
							<AlertDescription className="text-sm text-secondary-foreground">
								🎯 Start playing to receive auto-upgrades based on your best
								score!
							</AlertDescription>
						</Alert>
					) : null} */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<div className="text-center">
							<Trophy className="w-6 h-6 mx-auto mb-1 text-primary" />
							<div className="text-xs text-muted-foreground">Best Score</div>
							<div className="font-semibold">
								{bestScore ? formatNumber(Number(bestScore)) : "0"}
							</div>
						</div>
						<div className="text-center">
							<Clock className="w-6 h-6 mx-auto mb-1 text-primary" />
							<div className="text-xs text-muted-foreground">Sessions</div>
							<div className="font-semibold">
								{sessionCount ? Number(sessionCount) : "0"}
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl mb-1">⚡</div>
							<div className="text-xs text-muted-foreground">Per Second</div>
							<div className="font-semibold">
								{cookiesPerSecond.toFixed(1)}/s
							</div>
						</div>
						<div className="text-center">
							<Cookie className="w-6 h-6 mx-auto mb-1 text-primary" />
							<div className="text-xs text-muted-foreground">Global Total</div>
							<div className="font-semibold">
								{totalCookies ? formatNumber(Number(totalCookies)) : "0"}
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Leaderboard Section */}
			<Card className="p-4">
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Crown className="w-5 h-5 text-primary" />
					Leaderboard
				</h2>
				{leaderboard.length > 0 ? (
					<div className="space-y-2">
						{leaderboard.map((player, index) => (
							<div
								key={player.address}
								className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
							>
								<div className="flex items-center gap-3">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
											index === 0
												? "bg-yellow-500 text-yellow-900"
												: index === 1
													? "bg-gray-400 text-gray-900"
													: index === 2
														? "bg-amber-600 text-amber-100"
														: "bg-muted text-muted-foreground"
										}`}
									>
										{index + 1}
									</div>
									<div>
										<div className="font-medium text-sm">
											{player.address === address
												? "You"
												: `${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
										</div>
										{player.address === address && (
											<div className="text-xs text-primary">
												Your best score
											</div>
										)}
									</div>
								</div>
								<div className="text-right">
									<div className="font-semibold text-sm">
										{formatNumber(player.score)}
									</div>
									<div className="text-xs text-muted-foreground">cookies</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8">
						<Crown className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
						<p className="text-muted-foreground">No scores recorded yet</p>
						<p className="text-sm text-muted-foreground mt-1">
							Be the first to set a high score!
						</p>
					</div>
				)}
			</Card>

			{/* <Card className="p-4">
				<h2 className="text-lg font-semibold mb-4">Upgrades</h2>
				<div className="space-y-2">
					{Object.entries(upgrades).map(([key, upgrade]) => (
						<div
							key={key}
							className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
						>
							<div className="flex-1">
								<div className="font-medium capitalize">{key}</div>
								<div className="text-sm text-muted-foreground">
									{upgrade.count} owned • +{upgrade.cps} CPS each
								</div>
							</div>
							<Button
								onClick={() => buyUpgrade(key as keyof typeof upgrades)}
								disabled={cookies < upgrade.cost}
								variant={cookies >= upgrade.cost ? "default" : "outline"}
								size="sm"
							>
								{formatNumber(upgrade.cost)}
							</Button>
						</div>
					))}
				</div>
			</Card> */}

			{error && (
				<Alert variant="destructive">
					<AlertDescription>Error: {error.message}</AlertDescription>
				</Alert>
			)}

			{isConfirmed && (
				<Alert>
					<AlertDescription>
						Score saved successfully! Transaction confirmed.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
