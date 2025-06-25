"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectedView } from "@/components/connected-view";
import { DisconnectedView } from "@/components/disconnected-view";
import { Footer } from "@/components/footer";
import { LoadingScreen } from "@/components/loading-screen";

export default function Home() {
	const { isConnected } = useAccount();
	const [isLoading, setIsLoading] = useState(true);

	// Add a small delay to prevent UI flashing
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 500);
		return () => clearTimeout(timer);
	}, []);

	// Show loader while checking initial connection status
	if (isLoading) {
		return <LoadingScreen />;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
				{isConnected ? <ConnectedView /> : <DisconnectedView />}
			</div>
			<Footer />
		</div>
	);
}
