"use client";

import { useCallback, useEffect, useState } from "react";
import {
	useAccount,
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
} from "wagmi";
import { THE_PLACE_ABI } from "@/lib/contracts/the-place-abi";

// TODO: Replace with actual deployed contract address
const THE_PLACE_CONTRACT_ADDRESS =
	"0xe03379F37363c380D5205eEE151b918e184C3495" as const;

export interface CompanyPlacement {
	companyUrl: string;
	companyName: string;
	x: number;
	y: number;
	timestamp: number;
	exists: boolean;
	user: string;
}

export function useThePlaceContract() {
	const { address, isConnected } = useAccount();
	const [placements, setPlacements] = useState<CompanyPlacement[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Write contract hook
	const { writeContract, data: hash, isPending, error } = useWriteContract();

	// Wait for transaction confirmation
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	// Read all placements
	const { data: allPlacementsData, refetch: refetchPlacements } =
		useReadContract({
			address: THE_PLACE_CONTRACT_ADDRESS,
			abi: THE_PLACE_ABI,
			functionName: "getAllPlacements",
		});

	// Read user's current placement
	const { data: userPlacementData, refetch: refetchUserPlacement } =
		useReadContract({
			address: THE_PLACE_CONTRACT_ADDRESS,
			abi: THE_PLACE_ABI,
			functionName: "getUserPlacement",
			args: address ? [address] : undefined,
			query: {
				enabled: !!address,
			},
		});

	// Check if position is available
	const checkPositionAvailable = useCallback(
		async (x: number, y: number): Promise<boolean> => {
			if (!isConnected) return false;

			try {
				// For now, check locally against known placements
				return !placements.some((p) => p.x === x && p.y === y);
			} catch (error) {
				console.error("Error checking position availability:", error);
				return false;
			}
		},
		[isConnected, placements],
	);

	// Place company on canvas
	const placeCompany = useCallback(
		async (companyUrl: string, companyName: string, x: number, y: number) => {
			if (!isConnected || !address) {
				throw new Error("Wallet not connected");
			}

			try {
				setIsLoading(true);

				writeContract({
					address: THE_PLACE_CONTRACT_ADDRESS,
					abi: THE_PLACE_ABI,
					functionName: "placeCompany",
					args: [companyUrl, companyName, x, y],
				});
			} catch (error) {
				console.error("Error placing company:", error);
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[isConnected, address, writeContract],
	);

	// Parse placement data from contract
	useEffect(() => {
		if (allPlacementsData && Array.isArray(allPlacementsData)) {
			const [
				users,
				companyUrls,
				companyNames,
				xPositions,
				yPositions,
				timestamps,
			] = allPlacementsData;

			if (
				users &&
				companyUrls &&
				companyNames &&
				xPositions &&
				yPositions &&
				timestamps
			) {
				const parsedPlacements: CompanyPlacement[] = [];

				for (let i = 0; i < users.length; i++) {
					if (users[i] && companyUrls[i] && companyNames[i]) {
						parsedPlacements.push({
							user: users[i],
							companyUrl: companyUrls[i],
							companyName: companyNames[i],
							x: Number(xPositions[i]),
							y: Number(yPositions[i]),
							timestamp: Number(timestamps[i]),
							exists: true,
						});
					}
				}

				setPlacements(parsedPlacements);
			}
		}
	}, [allPlacementsData]);

	// Refetch data when transaction is confirmed
	useEffect(() => {
		if (isConfirmed) {
			refetchPlacements();
			refetchUserPlacement();
		}
	}, [isConfirmed, refetchPlacements, refetchUserPlacement]);

	// Get user's current placement
	const getUserPlacement = useCallback((): CompanyPlacement | null => {
		if (!userPlacementData || !Array.isArray(userPlacementData)) return null;

		const [companyUrl, companyName, x, y, timestamp, exists] =
			userPlacementData;

		if (!exists || !companyUrl) return null;

		return {
			companyUrl,
			companyName,
			x: Number(x),
			y: Number(y),
			timestamp: Number(timestamp),
			exists: Boolean(exists),
			user: address || "",
		};
	}, [userPlacementData, address]);

	return {
		// State
		placements,
		isLoading: isLoading || isPending,
		isConfirming,
		isConfirmed,
		error,
		hash,

		// User data
		address,
		isConnected,
		userPlacement: getUserPlacement(),

		// Actions
		placeCompany,
		checkPositionAvailable,
		refetchPlacements,
		refetchUserPlacement,
	};
}
