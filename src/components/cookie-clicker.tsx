"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, ExternalLink, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChainId } from "wagmi";
import { useGameState } from "@/hooks/use-game-state";
import { useContractInteractions } from "@/hooks/use-contract-interactions";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useInactivityDetection } from "@/hooks/use-inactivity-detection";
import { useUsernamePrompt } from "@/hooks/use-username-prompt";
import { GameStats } from "@/components/game-stats";
import { GameLeaderboard } from "@/components/game-leaderboard";
import { LoadingOverlay } from "@/components/loading-overlay";
import { UsernamePrompt } from "@/components/username-prompt";

// Chain ID to explorer URL mapping
const CHAIN_EXPLORERS: Record<number, string> = {
	1: "https://etherscan.io",
	10: "https://optimistic.etherscan.io",
	56: "https://bscscan.com",
	137: "https://polygonscan.com",
	8453: "https://basescan.org",
	42161: "https://arbiscan.io",
	421614: "https://sepolia.arbiscan.io", // Arbitrum Sepolia
	11155111: "https://sepolia.etherscan.io", // Ethereum Sepolia
};

export function CookieClicker() {
	// State for first-time user instructions
	const [showInstructions, setShowInstructions] = useState(() => {
		// Check if user has seen instructions before
		if (typeof window !== "undefined") {
			return !localStorage.getItem("cookieClickerInstructionsSeen");
		}
		return true;
	});

	// State for showing "Try again" tooltip
	const [showTryAgain, setShowTryAgain] = useState(false);

	// Custom hooks
	const router = useRouter();
	const chainId = useChainId();
	const gameState = useGameState();
	const usernamePrompt = useUsernamePrompt();
	// Memoize the parameters to prevent excessive re-renders
	const contractParams = useMemo(
		() => ({
			promptForUsername: usernamePrompt.promptForUsername,
			userName: usernamePrompt.userName,
			isUsernameSetOnBlockchain: Boolean(
				usernamePrompt.isUsernameSetOnBlockchain,
			),
		}),
		[
			usernamePrompt.promptForUsername,
			usernamePrompt.userName,
			usernamePrompt.isUsernameSetOnBlockchain,
		],
	);

	const contractData = useContractInteractions(
		contractParams.promptForUsername,
		contractParams.userName,
		contractParams.isUsernameSetOnBlockchain,
	);
	const {
		leaderboard,
		isLoading: isLeaderboardLoading,
		refetchLeaderboard,
	} = useLeaderboard();

	const {
		cookies,
		cookiesPerSecond,
		isPlaying,
		lastActivityTime,
		clickCookie,
		resetGameState,
		getGameDuration,
		formatNumber,
	} = gameState;

	const {
		address,
		isConnected,
		bestScore,
		bestSession,
		totalCookies,
		sessionCount,
		sessionHistory,
		recordGameSession,
		isPending,
		isConfirming,
		isConfirmed,
		hash,
	} = contractData;

	// Stop game callback
	const stopGame = useCallback(async () => {
		if (!isConnected || !address || !isPlaying) return;

		const duration = getGameDuration();
		const finalCookies = Math.floor(cookies);

		await recordGameSession(finalCookies, duration);
		resetGameState();
	}, [
		isConnected,
		address,
		isPlaying,
		getGameDuration,
		cookies,
		recordGameSession,
		resetGameState,
	]);

	// Inactivity detection
	useInactivityDetection({
		isPlaying,
		lastActivityTime,
		onInactivity: stopGame,
		timeout: 800,
	});

	// Refetch leaderboard when transaction is confirmed and show "Try again" tooltip
	useEffect(() => {
		if (isConfirmed) {
			refetchLeaderboard();
			// Show "Try again" tooltip after 1 second
			setTimeout(() => {
				setShowTryAgain(true);
			}, 1000);
		}
	}, [isConfirmed, refetchLeaderboard]);

	// Get explorer URL for current chain
	const getExplorerUrl = (txHash: string) => {
		const baseUrl = CHAIN_EXPLORERS[chainId];
		return baseUrl ? `${baseUrl}/tx/${txHash}` : undefined;
	};

	// Hide "Try again" tooltip when user starts playing again
	useEffect(() => {
		if (isPlaying) {
			setShowTryAgain(false);
		}
	}, [isPlaying]);

	// Handle cookie click with best score
	const handleCookieClick = useCallback(() => {
		clickCookie(bestScore);
	}, [clickCookie, bestScore]);

	// Handle touch events for animation
	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		e.currentTarget.style.transform = 'scale(0.9)';
	}, []);

	const handleTouchEnd = useCallback((e: React.TouchEvent) => {
		e.currentTarget.style.transform = 'scale(1)';
	}, []);

	// Handle starting the game
	const handleStartGame = () => {
		setShowInstructions(false);
		if (typeof window !== "undefined") {
			localStorage.setItem("cookieClickerInstructionsSeen", "true");
		}
	};

	// Show instructions screen for first-time users
	if (showInstructions) {
		return (
			<div className="fixed inset-0 top-16 flex items-center justify-center px-4">
				<Card className="p-8 max-w-md w-full animate-in fade-in slide-in-from-bottom-4">
					<div className="space-y-6 text-center">
						<div className="space-y-2">
							<div className="text-6xl mb-4">🍪</div>
							<h1 className="text-3xl font-bold">Cookie Click</h1>
							<p className="text-muted-foreground">
								powered by Batua & Pimlico
							</p>
						</div>

						<div className="space-y-4">
							<h2 className="text-xl font-semibold flex items-center justify-center gap-2">
								<Trophy className="w-5 h-5 text-primary" />
								How to Play
							</h2>
							<div className="space-y-3 text-left text-muted-foreground">
								<div className="flex gap-3">
									<span className="text-2xl">🍪</span>
									<p>
										<strong>Tap the cookie</strong> as fast as you can to earn
										points!
									</p>
								</div>
								<div className="flex gap-3">
									<span className="text-2xl">⏱️</span>
									<p>
										<strong>Keep tapping</strong> - if you stop for more than
										0.8 seconds, your session ends automatically.
									</p>
								</div>
								<div className="flex gap-3">
									<span className="text-2xl">🏆</span>
									<p>
										<strong>Climb the leaderboard</strong> by tapping for as
										long as possible and beating other players' scores!
									</p>
								</div>
								<p className="text-sm text-center pt-2 text-primary">
									Your score is saved on the blockchain when your session ends.
								</p>
							</div>
						</div>

						<Button
							onClick={handleStartGame}
							size="lg"
							className="w-full text-lg py-6"
						>
							Play Now
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="w-full max-w-2xl mx-auto p-4 space-y-4 relative">
			<UsernamePrompt
				isOpen={usernamePrompt.isOpen}
				onSubmit={usernamePrompt.onSubmit}
				onCancel={usernamePrompt.onCancel}
			/>

			<LoadingOverlay
				isPending={isPending}
				isConfirming={isConfirming}
				cookies={cookies}
				formatNumber={formatNumber}
			/>

			<div className="text-center">
				<div className="text-3xl font-bold text-primary mb-2">
					{formatNumber(cookies)} cookies
				</div>
				<div className="text-sm text-muted-foreground">
					{cookiesPerSecond > 0
						? `${cookiesPerSecond.toFixed(1)} per second`
						: "0 per second"}
				</div>
			</div>

			<div className="flex justify-center relative">
				<Button
					onClick={handleCookieClick}
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
					size="lg"
					className="w-40 h-40 rounded-full text-9xl bg-transparent hover:bg-transparent transition-all duration-150 touch-manipulation select-none shadow-lg border-0 p-0"
					style={{
						WebkitTapHighlightColor: "transparent",
						filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
					}}
				>
					🍪
				</Button>
				{showTryAgain && (
					<div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
						Try again!
						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
							<div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
						</div>
					</div>
				)}
			</div>

			<GameStats
				bestScore={bestScore}
				bestSession={bestSession}
				sessionCount={sessionCount}
				totalCookies={totalCookies}
				isConnected={isConnected}
				formatNumber={formatNumber}
				hasHistory={sessionHistory.length > 0}
				onHistoryClick={() => router.push("/history")}
			/>

			{isConfirmed && hash && (
				<Alert className="bg-green-50 border-green-200">
					<Trophy className="h-4 w-4 text-green-600" />
					<AlertDescription className="text-green-800">
						<div className="space-y-2">
							<p className="font-medium">Score submitted successfully!</p>
							<div className="flex items-center gap-2 text-sm">
								<span>Transaction:</span>
								<code className="bg-green-100 px-2 py-1 rounded text-xs font-mono">
									{hash.slice(0, 10)}...{hash.slice(-8)}
								</code>
								{getExplorerUrl(hash) && (
									<a
										href={getExplorerUrl(hash)}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-green-600 hover:text-green-700"
									>
										<ExternalLink className="h-3 w-3" />
									</a>
								)}
							</div>
						</div>
					</AlertDescription>
				</Alert>
			)}

			<GameLeaderboard
				leaderboard={leaderboard}
				isLoading={isLeaderboardLoading}
				currentUserAddress={address}
				currentUserUsername={usernamePrompt.userName || undefined}
				formatNumber={formatNumber}
			/>
		</div>
	);
}
