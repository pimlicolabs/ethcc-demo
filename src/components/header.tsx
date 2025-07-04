"use client";

import { useAccount, useDisconnect, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/batua/utils";
import { ExternalLink } from "lucide-react";

export function Header() {
	const { address, isConnected } = useAccount();
	const { disconnect } = useDisconnect();
	const chainId = useChainId();

	// Chain ID to explorer URL mapping
	const CHAIN_EXPLORERS: Record<number, string> = {
		1: "https://etherscan.io",
		10: "https://optimistic.etherscan.io",
		56: "https://bscscan.com",
		137: "https://polygonscan.com",
		8453: "https://basescan.org",
		42161: "https://arbiscan.io",
		421614: "https://sepolia.arbiscan.io", // Arbitrum Sepolia
		11155111: "https://sepolia.etherscan.io", // Ethereum Sepolia
	};

	// Get explorer URL for current chain
	const getExplorerUrl = (address: string) => {
		const baseUrl = CHAIN_EXPLORERS[chainId];
		return baseUrl ? `${baseUrl}/address/${address}` : undefined;
	};

	// Only show header when wallet is connected
	if (!isConnected) return null;

	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-semibold">ETHCC Demo</h1>

					<div className="flex items-center gap-2">
						{address && (
							<>
								{/* Address with explorer link */}
								{getExplorerUrl(address) ? (
									<a
										href={getExplorerUrl(address)}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-3 py-2 border rounded-md"
									>
										{shortenAddress(address)}
										<ExternalLink className="h-3 w-3" />
									</a>
								) : (
									<span className="text-sm text-muted-foreground px-3 py-2 border rounded-md">
										{shortenAddress(address)}
									</span>
								)}

								<Button
									onClick={() => disconnect()}
									variant="outline"
									size="sm"
									className="h-9"
								>
									Disconnect
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
