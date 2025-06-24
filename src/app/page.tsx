import { WalletConnect } from "@/components/wallet-connect";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col">
			{/* Mobile-optimized header */}
			<div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
				<div className="mx-auto w-full max-w-sm">
					{/* App title - mobile optimized */}
					<div className="text-center mb-8">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
							ETHCC Demo
						</h1>
						<p className="mt-3 text-sm sm:text-base text-muted-foreground px-2">
							Connect with Batua to get started
						</p>
					</div>

					{/* Wallet connection component */}
					<div className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm">
						<WalletConnect />
					</div>
				</div>
			</div>

			{/* Mobile-friendly footer */}
			<div className="p-4 text-center">
				<p className="text-xs text-muted-foreground">
					Powered by Batua Smart Accounts
				</p>
			</div>
		</div>
	);
}
