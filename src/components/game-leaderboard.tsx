import { memo } from "react";
import { Crown, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { LeaderboardEntry } from "@/hooks/use-leaderboard";

interface GameLeaderboardProps {
	leaderboard: LeaderboardEntry[];
	isLoading: boolean;
	currentUserAddress?: string;
	currentUserUsername?: string;
	formatNumber: (num: number) => string;
}

export const GameLeaderboard = memo(function GameLeaderboard({
	leaderboard,
	isLoading,
	currentUserAddress,
	currentUserUsername,
	formatNumber,
}: GameLeaderboardProps) {
	return (
		<Card className="p-4">
			<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
				<Crown className="w-5 h-5 text-primary" />
				Leaderboard
			</h2>
			{isLoading ? (
				<div className="text-center py-8">
					<Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading leaderboard...</p>
				</div>
			) : leaderboard.length > 0 ? (
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
										{player.address === currentUserAddress
											? currentUserUsername || "You"
											: player.username ||
												`${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
									</div>
									{player.address === currentUserAddress && (
										<div className="text-xs text-primary">Your best score</div>
									)}
								</div>
							</div>
							<div className="text-right">
								<div className="font-semibold text-sm">
									{formatNumber(player.score)}
								</div>
								<div className="text-xs text-muted-foreground">
									{player.duration > 0 
										? `${(player.score / (player.duration / 1000)).toFixed(1)} CPS`
										: "0 CPS"
									}
								</div>
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
	);
});
