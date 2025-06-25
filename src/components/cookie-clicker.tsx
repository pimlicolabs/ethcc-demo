"use client";

import { useEffect, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

	// Refetch leaderboard when transaction is confirmed
	useEffect(() => {
		if (isConfirmed) {
			refetchLeaderboard();
		}
	}, [isConfirmed, refetchLeaderboard]);

	// Handle cookie click with best score
	const handleCookieClick = useCallback(() => {
		clickCookie(bestScore);
	}, [clickCookie, bestScore]);

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

			<div className="flex justify-center">
				<Button
					onClick={handleCookieClick}
					size="lg"
					className="w-32 h-32 rounded-full text-4xl bg-primary hover:bg-primary/90 active:scale-95 transition-transform touch-manipulation"
					style={{ WebkitTapHighlightColor: "transparent" }}
				>
					🍪
				</Button>
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
