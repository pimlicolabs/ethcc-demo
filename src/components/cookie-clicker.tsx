"use client";

import { useEffect, useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useGameState } from "@/hooks/use-game-state";
import { useContractInteractions } from "@/hooks/use-contract-interactions";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useInactivityDetection } from "@/hooks/use-inactivity-detection";
import { useUsernamePrompt } from "@/hooks/use-username-prompt";
import { GameStats } from "@/components/game-stats";
import { GameLeaderboard } from "@/components/game-leaderboard";
import { LoadingOverlay } from "@/components/loading-overlay";
import { UsernamePrompt } from "@/components/username-prompt";
import { getStoredUsername } from "@/lib/username";

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
	const gameState = useGameState();
	const usernamePrompt = useUsernamePrompt();
	const contractData = useContractInteractions(
		usernamePrompt.promptForUsername,
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
		recordGameSession,
		isPending,
		isConfirming,
		isConfirmed,
		error,
	} = contractData;

	// Stop game callback
	const stopGame = useCallback(async () => {
		if (!isConnected || !address || !isPlaying) return;

		const duration = getGameDuration();
		const finalCookies = Math.floor(cookies);

		console.log("finalCookies", finalCookies);
		console.log("duration", duration);
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
			<div className="w-full max-w-2xl mx-auto p-4 min-h-screen flex items-center justify-center">
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
		<div className="w-full max-w-2xl mx-auto p-4 space-y-6 pt-12 relative">
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

			<div className="flex justify-center relative">
				<Button
					onClick={handleCookieClick}
					size="lg"
					className="w-32 h-32 rounded-full text-4xl bg-primary hover:bg-primary/90 active:scale-95 transition-transform touch-manipulation"
					style={{ WebkitTapHighlightColor: "transparent" }}
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
			/>

			<GameLeaderboard
				leaderboard={leaderboard}
				isLoading={isLeaderboardLoading}
				currentUserAddress={address}
				currentUserUsername={getStoredUsername() || undefined}
				formatNumber={formatNumber}
			/>

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
