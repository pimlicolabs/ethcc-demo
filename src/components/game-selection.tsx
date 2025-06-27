"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function GameSelection() {
	const router = useRouter();

	const games = [
		{
			id: "cookie-clicker",
			title: "Cookie Clicker",
			emoji: "🍪",
			description: "Tap as fast as you can!",
			route: "/games/cookie-clicker",
		},
		{
			id: "the-place",
			title: "The Place",
			emoji: "🎨",
			description: "Collaborative pixel art",
			route: "/games/the-place",
		},
	];

	return (
		<div className="mx-auto w-full max-w-md space-y-6">
			<div className="text-center">
				<h1 className="text-2xl sm:text-3xl font-bold mb-2">Select a Game</h1>
				<p className="text-muted-foreground">
					Choose which game you'd like to play
				</p>
			</div>

			<div className="space-y-4">
				{games.map((game) => (
					<Card key={game.id} className="p-6">
						<div className="flex items-center space-x-4">
							<div className="text-4xl">{game.emoji}</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold">{game.title}</h3>
								<p className="text-sm text-muted-foreground">
									{game.description}
								</p>
							</div>
							<Button
								onClick={() => router.push(game.route)}
								size="default"
								className="touch-manipulation min-h-[44px]"
							>
								Play
							</Button>
						</div>
					</Card>
				))}
			</div>

			<div className="text-center">
				<p className="text-sm text-muted-foreground">More games coming soon!</p>
			</div>
		</div>
	);
}
