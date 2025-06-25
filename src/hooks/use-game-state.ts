import confetti from "canvas-confetti";
import { useCallback, useEffect, useState } from "react";

export interface Upgrade {
	count: number;
	cost: number;
	cps: number;
}

export interface Upgrades {
	cursor: Upgrade;
	grandma: Upgrade;
	farm: Upgrade;
	mine: Upgrade;
}

export function useGameState() {
	const [cookies, setCookies] = useState(0);
	const [cookiesPerSecond, setCookiesPerSecond] = useState(0);
	const [upgrades, setUpgrades] = useState<Upgrades>({
		cursor: { count: 0, cost: 15, cps: 0.1 },
		grandma: { count: 0, cost: 100, cps: 1 },
		farm: { count: 0, cost: 1100, cps: 8 },
		mine: { count: 0, cost: 12000, cps: 47 },
	});
	const [startTime, setStartTime] = useState<number | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);

	// // Calculate total CPS whenever upgrades change
	// useEffect(() => {
	// 	const totalCps = Object.entries(upgrades).reduce(
	// 		(total, [_, upgrade]) => total + upgrade.count * upgrade.cps,
	// 		0,
	// 	);
	// 	setCookiesPerSecond(Number(totalCps.toFixed(1)));
	// }, [upgrades]);

	// Auto-increment cookies based on CPS
	useEffect(() => {
		if (!startTime) return;
		const interval = setInterval(() => {
			const now = Date.now();
			const elapsedSeconds = (now - startTime) / 1000;
			setCookiesPerSecond(Number((cookies / elapsedSeconds).toFixed(1)));
		}, 100);
		return () => clearInterval(interval);
	}, [cookies, startTime]);

	// Calculate auto-upgrades based on best score
	const calculateAutoUpgrades = useCallback((score: number) => {
		const upgradeLevels = {
			cursor: 0,
			grandma: 0,
			farm: 0,
			mine: 0,
		};

		// Simple algorithm: allocate score to upgrades based on efficiency
		let remainingScore = score;

		// Buy cursors first (most cost-efficient for small scores)
		if (remainingScore >= 15) {
			upgradeLevels.cursor = Math.floor(Math.min(remainingScore / 100, 10));
			remainingScore -= upgradeLevels.cursor * 15;
		}

		// Then grandmas
		if (remainingScore >= 100) {
			upgradeLevels.grandma = Math.floor(Math.min(remainingScore / 500, 5));
			remainingScore -= upgradeLevels.grandma * 100;
		}

		// Then farms
		if (remainingScore >= 1100) {
			upgradeLevels.farm = Math.floor(Math.min(remainingScore / 3000, 3));
			remainingScore -= upgradeLevels.farm * 1100;
		}

		// Finally mines
		if (remainingScore >= 12000) {
			upgradeLevels.mine = Math.floor(Math.min(remainingScore / 24000, 2));
		}

		return upgradeLevels;
	}, []);

	const clickCookie = useCallback(
		(bestScore?: number) => {
			if (!isPlaying) {
				setIsPlaying(true);
				setStartTime(Date.now());

				// Apply auto-upgrades based on best score
				if (bestScore && bestScore > 0) {
					const autoUpgrades = calculateAutoUpgrades(bestScore);

					setUpgrades({
						cursor: {
							count: autoUpgrades.cursor,
							cost: Math.floor(15 * 1.15 ** autoUpgrades.cursor),
							cps: 0.1,
						},
						grandma: {
							count: autoUpgrades.grandma,
							cost: Math.floor(100 * 1.15 ** autoUpgrades.grandma),
							cps: 1,
						},
						farm: {
							count: autoUpgrades.farm,
							cost: Math.floor(1100 * 1.15 ** autoUpgrades.farm),
							cps: 8,
						},
						mine: {
							count: autoUpgrades.mine,
							cost: Math.floor(12000 * 1.15 ** autoUpgrades.mine),
							cps: 47,
						},
					});

					// Show confetti for auto-upgrades
					if (
						autoUpgrades.cursor > 0 ||
						autoUpgrades.grandma > 0 ||
						autoUpgrades.farm > 0 ||
						autoUpgrades.mine > 0
					) {
						confetti({
							particleCount: 50,
							spread: 45,
							origin: { y: 0.8 },
						});
					}
				}
			}
			setCookies((prev) => prev + 1);
			setLastActivityTime(Date.now());
		},
		[isPlaying, calculateAutoUpgrades],
	);

	const resetGameState = useCallback(() => {
		setIsPlaying(false);
		setCookies(0);
		setCookiesPerSecond(0);
		setStartTime(null);
		setLastActivityTime(null);
		setUpgrades({
			cursor: { count: 0, cost: 15, cps: 0.1 },
			grandma: { count: 0, cost: 100, cps: 1 },
			farm: { count: 0, cost: 1100, cps: 8 },
			mine: { count: 0, cost: 12000, cps: 47 },
		});
	}, []);

	const getGameDuration = useCallback(() => {
		if (!startTime) return 0;
		return Math.floor(Date.now() - startTime);
	}, [startTime]);

	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return Math.floor(num).toString();
	};

	return {
		cookies,
		cookiesPerSecond,
		upgrades,
		isPlaying,
		lastActivityTime,
		startTime,
		clickCookie,
		resetGameState,
		getGameDuration,
		formatNumber,
	};
}
