import { Card } from "@/components/ui/card";
import { WalletConnect } from "@/components/wallet-connect";

export function DisconnectedView() {
	return (
		<div className="mx-auto w-full max-w-sm">
			<div className="text-center mb-8">
				<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
					ETHCC Demo
				</h1>
				<p className="mt-3 text-sm sm:text-base text-muted-foreground px-2">
					Connect your wallet to start playing
				</p>
			</div>

			<Card>
				<WalletConnect />
			</Card>
		</div>
	);
}
