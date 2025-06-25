import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { validateUsername } from "@/lib/username";

interface UsernamePromptProps {
	isOpen: boolean;
	onSubmit: (username: string) => void;
	onCancel: () => void;
}

export function UsernamePrompt({
	isOpen,
	onSubmit,
	onCancel,
}: UsernamePromptProps) {
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = () => {
		const validation = validateUsername(username);
		if (!validation.isValid) {
			setError(validation.error || "Invalid username");
			return;
		}

		setError(null);
		onSubmit(username);
		setUsername("");
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSubmit();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={() => onCancel()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Choose Your Username</DialogTitle>
					<DialogDescription>
						Enter a username for the leaderboard. This will be saved for future
						games.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Enter username..."
							maxLength={20}
							autoFocus
						/>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<p className="text-xs text-muted-foreground">
							2-20 characters, letters, numbers, underscore, and dash only
						</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!username.trim()}>
						Save Username
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
