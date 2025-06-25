import { useState, useCallback } from "react";
import { getStoredUsername, saveUsername } from "@/lib/username";

export function useUsernamePrompt() {
	const [isOpen, setIsOpen] = useState(false);
	const [pendingResolve, setPendingResolve] = useState<
		((username: string | null) => void) | null
	>(null);

	const promptForUsername = useCallback((): Promise<string | null> => {
		const stored = getStoredUsername();
		if (stored) {
			return Promise.resolve(stored);
		}

		return new Promise((resolve) => {
			setPendingResolve(() => resolve);
			setIsOpen(true);
		});
	}, []);

	const onSubmit = useCallback(
		(username: string) => {
			saveUsername(username);
			setIsOpen(false);
			if (pendingResolve) {
				pendingResolve(username);
				setPendingResolve(null);
			}
		},
		[pendingResolve],
	);

	const onCancel = useCallback(() => {
		setIsOpen(false);
		if (pendingResolve) {
			pendingResolve(null);
			setPendingResolve(null);
		}
	}, [pendingResolve]);

	return {
		isOpen,
		promptForUsername,
		onSubmit,
		onCancel,
	};
}
