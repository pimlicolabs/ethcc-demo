"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { CookieClicker } from "@/components/cookie-clicker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CookieClickerPage() {
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
			</div>
			<div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
				<CookieClicker />
			</div>
		</div>
	);
}
