import { Cookie, Clock, Trophy, Zap, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BestSession } from "@/hooks/use-contract-interactions";

interface GameStatsProps {
	bestScore: number;
	bestSession: BestSession | null;
	sessionCount: number;
	totalCookies: number;
	isConnected: boolean;
	formatNumber: (num: number) => string;
	hasHistory?: boolean;
	onHistoryClick?: () => void;
}

export function GameStats({
	bestScore,
	bestSession,
	sessionCount,
	totalCookies,
	isConnected,
	formatNumber,
	hasHistory = false,
	onHistoryClick,
}: GameStatsProps) {
	if (!isConnected) return null;

	// Calculate actual CPS from best session (cookies / duration in seconds)
	const calculateActualCPS = () => {
		if (!bestSession || bestSession.duration === 0) return 0;
		// Convert duration from milliseconds to seconds if needed
		const durationInSeconds = bestSession.duration / 1000;
		return bestSession.cookies / durationInSeconds;
	};

	const bestSessionCPS = calculateActualCPS();

	return (
		<Card className="p-4">
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-lg font-semibold">Your Stats</h2>
				{hasHistory && onHistoryClick && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onHistoryClick}
						className="p-2"
					>
						<History className="w-4 h-4" />
					</Button>
				)}
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="text-center">
					<Trophy className="w-6 h-6 mx-auto mb-1 text-primary" />
					<div className="text-xs text-muted-foreground">Best Score</div>
					<div className="font-semibold">{formatNumber(bestScore)}</div>
				</div>
				<div className="text-center">
					<Clock className="w-6 h-6 mx-auto mb-1 text-primary" />
					<div className="text-xs text-muted-foreground">Sessions</div>
					<div className="font-semibold">{sessionCount}</div>
				</div>
				<div className="text-center">
					<Zap className="w-6 h-6 mx-auto mb-1 text-primary" />
					<div className="text-xs text-muted-foreground">Best CPS</div>
					<div className="font-semibold">{bestSessionCPS.toFixed(1)}/s</div>
				</div>
				<div className="text-center">
					<Cookie className="w-6 h-6 mx-auto mb-1 text-primary" />
					<div className="text-xs text-muted-foreground">Global Total</div>
					<div className="font-semibold">{formatNumber(totalCookies)}</div>
				</div>
			</div>
		</Card>
	);
}
