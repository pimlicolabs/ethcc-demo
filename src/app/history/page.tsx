"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Trophy } from "lucide-react";
import { useContractInteractions } from "@/hooks/use-contract-interactions";
import moment from "moment";

export default function HistoryPage() {
	const router = useRouter();
	const { isConnected } = useAccount();
	const { sessionHistory } = useContractInteractions();

	// Format number function
	const formatNumber = (num: number): string => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	// Redirect to home if not connected
	useEffect(() => {
		if (!isConnected) {
			router.push("/");
		}
	}, [isConnected, router]);

	const formatDate = (timestamp: number) => {
		return moment.unix(timestamp).format("MMM DD, YYYY [at] h:mm A");
	};

	const formatDuration = (duration: number) => {
		const minutes = Math.floor(duration / 60);
		const seconds = duration % 60;
		return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
	};

	const sortedHistory = [...sessionHistory].reverse(); // Show newest first

	if (!isConnected) {
		return null;
	}

	return (
		<div className="w-full max-w-2xl mx-auto p-4 space-y-6 pt-24">
			<div className="flex items-center gap-4">
				<Button
					variant="link"
					size="sm"
					onClick={() => router.back()}
					className="flex items-center gap-2 px-0"
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</Button>
				<h1 className="text-2xl font-bold">Your Game History</h1>
			</div>

			{sessionHistory.length === 0 ? (
				<Card className="p-8 text-center">
					<Trophy className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
					<h2 className="text-xl font-semibold mb-2">No Games Played Yet</h2>
					<p className="text-muted-foreground mb-4">
						Start playing to see your game history here!
					</p>
					<Button onClick={() => router.push("/")}>Start Playing</Button>
				</Card>
			) : (
				<div className="space-y-4">
					<div className="text-sm text-muted-foreground">
						Total games played: {sessionHistory.length}
					</div>

					{sortedHistory.map((session, index) => (
						<Card key={index} className="p-4">
							<div className="flex justify-between items-start mb-3">
								<div className="flex items-center gap-2">
									<Trophy className="w-5 h-5 text-primary" />
									<span className="text-lg font-semibold text-primary">
										{formatNumber(session.cookies)} cookies
									</span>
								</div>
								<span className="text-sm text-muted-foreground">
									{formatDate(session.timestamp)}
								</span>
							</div>

							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Clock className="w-4 h-4" />
								<span>Duration: {formatDuration(session.duration)}</span>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
