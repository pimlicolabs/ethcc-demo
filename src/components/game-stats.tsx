import { Cookie, Clock, Trophy, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BestSession } from "@/hooks/use-contract-interactions";

interface GameStatsProps {
	bestScore: number;
	bestSession: BestSession | null;
	sessionCount: number;
	totalCookies: number;
	isConnected: boolean;
	formatNumber: (num: number) => string;
}

export function GameStats({
	bestScore,
	bestSession,
	sessionCount,
	totalCookies,
	isConnected,
	formatNumber,
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
			<h2 className="text-lg font-semibold mb-3">Your Stats</h2>
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
