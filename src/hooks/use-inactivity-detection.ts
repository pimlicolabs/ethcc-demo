import { useEffect } from "react";

interface UseInactivityDetectionProps {
	isPlaying: boolean;
	lastActivityTime: number | null;
	onInactivity: () => void;
	timeout?: number;
}

export function useInactivityDetection({
	isPlaying,
	lastActivityTime,
	onInactivity,
	timeout = 500,
}: UseInactivityDetectionProps) {
	useEffect(() => {
		if (isPlaying && lastActivityTime) {
			// Set new timer for specified timeout
			const timer = setTimeout(() => {
				onInactivity();
			}, timeout);

			// Cleanup on unmount or when dependencies change
			return () => {
				clearTimeout(timer);
			};
		}
	}, [lastActivityTime, isPlaying, onInactivity, timeout]);
}
