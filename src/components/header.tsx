"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { CopyAddress } from "@/components/batua/CopyAddress";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/batua/utils";

export function Header() {
	const { address, isConnected } = useAccount();
	const { disconnect } = useDisconnect();

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
								<CopyAddress
									name={shortenAddress(address)}
									value={address}
									className="text-sm"
								/>
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
