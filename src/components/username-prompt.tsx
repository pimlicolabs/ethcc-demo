import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const validateUsername = (
	username: string,
): { isValid: boolean; error?: string } => {
	if (!username.trim()) {
		return { isValid: false, error: "Username cannot be empty" };
	}

	if (username.length < 2) {
		return { isValid: false, error: "Username must be at least 2 characters" };
	}

	if (username.length > 20) {
		return {
			isValid: false,
			error: "Username must be less than 20 characters",
		};
	}

	if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
		return {
			isValid: false,
			error: "Username can only contain letters, numbers, underscore, and dash",
		};
	}

	return { isValid: true };
};

interface UsernamePromptProps {
	isOpen: boolean;
	onSubmit: (username: string) => void;
	onCancel: () => void;
}

export const UsernamePrompt = memo(function UsernamePrompt({
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
							id={`username-${Math.random()}`}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							onKeyDown={handleKeyPress}
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
});
