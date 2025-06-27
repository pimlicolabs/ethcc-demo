"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { ThePlace } from "@/components/the-place";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ThePlacePage() {
	const router = useRouter();
	const { isConnected } = useAccount();

	// Redirect to home page if wallet is not connected
	useEffect(() => {
		if (!isConnected) {
			router.push("/");
		}
	}, [isConnected, router]);

	// Don't render the page if wallet is not connected
	if (!isConnected) {
		return null;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex items-center justify-between p-4 border-b">
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
