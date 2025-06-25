import { Loader2 } from "lucide-react";

export function LoadingScreen() {
	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
					<p className="mt-4 text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		</div>
	);
}
