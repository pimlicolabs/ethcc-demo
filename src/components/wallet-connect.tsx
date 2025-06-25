"use client";

import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/button";

export function WalletConnect() {
	const { address, isConnected } = useAccount();
	const { connectors, connect } = useConnect();
	const { disconnect } = useDisconnect();

	if (isConnected) {
		return (
			<div className="flex flex-col items-center gap-6 p-6">
				<div className="text-center">
					<div className="text-lg font-semibold text-primary mb-2">
						✓ Connected
					</div>
					<div className="text-sm text-muted-foreground break-all px-2">
						{address?.slice(0, 8)}...{address?.slice(-6)}
					</div>
				</div>
				<Button
					onClick={() => disconnect()}
					variant="outline"
					className="w-full h-12 text-base"
				>
					Disconnect Wallet
				</Button>
			</div>
		);
	}

	// Find only the Batua connector
	const batuaConnector = connectors.find(
		(connector) => connector.name === "Batua",
	);

	return (
		<div className="flex flex-col items-center gap-4 p-6">
			<div className="w-full max-w-xs">
				{batuaConnector ? (
					<Button
						onClick={() => connect({ connector: batuaConnector })}
						className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-medium"
					>
						<Wallet className="w-5 h-5 mr-2" />
						Connect Wallet
					</Button>
				) : (
					<div className="text-center text-muted-foreground p-4 border border-dashed border-muted rounded-lg">
						<p className="text-sm">Wallet not detected</p>
						<p className="text-xs opacity-75 mt-1">
							Please check your configuration
						</p>
					</div>
				)}
			</div>
			<p className="text-xs text-muted-foreground text-center">
				Secured with passkey authentication
			</p>
		</div>
	);
}
