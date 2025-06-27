import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import {
	COOKIE_CLICKER_ABI,
	COOKIE_CLICKER_ADDRESS,
} from "@/lib/contracts/cookie-clicker-abi";

export function useUsernamePrompt() {
	const { address } = useAccount();
	const chainId = useChainId();

	// Local username state - this is the single source of truth for the app
	const [userName, setUserName] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [pendingResolve, setPendingResolve] = useState<
		((username: string | null) => void) | null
	>(null);

	// Read username from contract
	const { data: blockchainUsername } = useReadContract({
		address: COOKIE_CLICKER_ADDRESS[chainId],
		abi: COOKIE_CLICKER_ABI,
		functionName: "getUsername",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
			staleTime: 30000, // Cache for 30 seconds
		},
	});

	// Set userName state from blockchain on mount or when blockchain data changes
	useEffect(() => {
		if (blockchainUsername && blockchainUsername !== "") {
			setUserName(blockchainUsername);
		}
	}, [blockchainUsername]);

	// Determine if username is set on blockchain
	const isUsernameSetOnBlockchain = useMemo(() => {
		return blockchainUsername && blockchainUsername !== "";
	}, [blockchainUsername]);

	const promptForUsername = useCallback((): Promise<string | null> => {
		// Check local userName state first
		if (userName) {
			return Promise.resolve(userName);
		}

		// If no username, prompt user
		return new Promise((resolve) => {
			setPendingResolve(() => resolve);
			setIsOpen(true);
		});
	}, [userName]);

	const onSubmit = useCallback(
		(username: string) => {
			// Set the username in local state (single source of truth for the app)
			setUserName(username);
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
		userName,
		setUserName,
		blockchainUsername: blockchainUsername as string,
		isUsernameSetOnBlockchain,
	};
}
