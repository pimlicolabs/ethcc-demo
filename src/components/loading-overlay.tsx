import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadingOverlayProps {
	isPending: boolean;
	isConfirming: boolean;
	cookies: number;
	formatNumber: (num: number) => string;
}

export function LoadingOverlay({
	isPending,
	isConfirming,
	cookies,
	formatNumber,
}: LoadingOverlayProps) {
	if (!isPending && !isConfirming) return null;

	return (
		<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
			<Card className="p-6 w-10/12">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<div className="text-center">
						<p className="font-semibold">
							{isPending ? "Submitting Score..." : "Confirming Transaction..."}
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Recording {formatNumber(Math.floor(cookies))} cookies
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
