"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ThePlace } from "@/components/the-place";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ThePlacePage() {
	const router = useRouter();
	const { isConnected, isConnecting } = useAccount();
	const [isLoading, setIsLoading] = useState(true);

	// Wait for wallet connection check to complete
	useEffect(() => {
		// Add a small delay to ensure wagmi has properly initialized
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	// Redirect to home page if wallet is not connected (after loading is complete)
	useEffect(() => {
		if (!isLoading && !isConnecting && !isConnected) {
			router.push("/");
		}
	}, [isLoading, isConnecting, isConnected, router]);

	// Show loading screen while checking connection status
	if (isLoading || isConnecting) {
		return <LoadingScreen />;
	}

	// Don't render the page if wallet is not connected
	if (!isConnected) {
		return null;
	}

	return (
		<div className="min-h-screen flex flex-col pt-16">
			<div className="flex items-center justify-between p-4 border-b bg-background">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.back()}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</Button>
				<h1 className="text-lg font-semibold">The Place</h1>
				<div className="w-16" />
			</div>
			<div className="flex-1 flex flex-col px-4 py-6">
				<ThePlace />
			</div>
		</div>
	);
}
