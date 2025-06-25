// import { DepositButton } from "@/components/deposit-button";
import { CookieClicker } from "@/components/cookie-clicker";
// import { Card } from "@/components/ui/card";

export function ConnectedView() {
	return (
		<div className="mx-auto w-full max-w-md">
			<CookieClicker />
			{/* Deposit flow temporarily commented out */}
			{/* 
			<div className="text-center">
				<h2 className="text-xl sm:text-2xl font-semibold mb-4">
					Ready to Play?
				</h2>
				<p className="text-muted-foreground mb-8">
					Deposit $1 to start playing the game
				</p>

				<Card className="p-6">
					<DepositButton />
				</Card>
			</div>
			*/}
		</div>
	);
}
