const USERNAME_STORAGE_KEY = "cookie-clicker-username";

export const usernameStorage = {
	get: (): string | null => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(USERNAME_STORAGE_KEY);
	},

	set: (username: string): void => {
		if (typeof window === "undefined") return;
		localStorage.setItem(USERNAME_STORAGE_KEY, username);
	},

	clear: (): void => {
		if (typeof window === "undefined") return;
		localStorage.removeItem(USERNAME_STORAGE_KEY);
	},
};

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

export const getStoredUsername = (): string | null => {
	return usernameStorage.get();
};

export const saveUsername = (username: string): void => {
	usernameStorage.set(username);
};
