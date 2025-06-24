"use client";

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
					<div className="text-lg font-semibold text-green-600 mb-2">
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
		<div className="flex flex-col items-center gap-6 p-6">
			<div className="text-center">
				<h2 className="text-xl sm:text-2xl font-bold mb-2">
					Connect with Batua
				</h2>
				<p className="text-sm text-muted-foreground">
					Smart account with passkey authentication
				</p>
			</div>
			<div className="w-full max-w-xs">
				{batuaConnector ? (
					<Button
						onClick={() => connect({ connector: batuaConnector })}
						className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium"
					>
						🔐 Connect Batua Wallet
					</Button>
				) : (
					<div className="text-center text-muted-foreground p-4 border border-dashed border-gray-300 rounded-lg">
						<p className="mb-2 text-sm">Batua wallet not detected</p>
						<p className="text-xs opacity-75">
							Please ensure Batua is properly configured
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
