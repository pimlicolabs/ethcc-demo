"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trophy } from "lucide-react";
import { useThePlaceContract } from "@/hooks/use-the-place-contract";

interface CompanyLogo {
	id: string;
	url: string;
	logoUrl: string;
	companyName: string;
	x: number;
	y: number;
	address: string;
}

export function ThePlace() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [companyUrl, setCompanyUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [logos, setLogos] = useState<CompanyLogo[]>([]);
	const companyUrlId = useId();
	const liveCanvasId = useId();

	// Blockchain integration
	const {
		placements,
		isLoading: isContractLoading,
		isConfirming,
		isConfirmed,
		error: contractError,
		hash,
		address,
		isConnected,
		userPlacement,
		placeCompany,
	} = useThePlaceContract();

	// Canvas configuration for mobile-friendly 7x7 grid (49 spots, close to 50)
	const GRID_SIZE = 7;
	const CELL_SIZE = 45; // Mobile-friendly size
	const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

	// Convert blockchain placements to display format
	useEffect(() => {
		const convertedLogos: CompanyLogo[] = placements.map((placement) => ({
			id: `${placement.user}-${placement.timestamp}`,
			url: placement.companyUrl,
			logoUrl: "", // Will be fetched when drawing
			companyName: placement.companyName,
			x: placement.x,
			y: placement.y,
			address: placement.user,
		}));

		setLogos(convertedLogos);
	}, [placements]);

	// Initialize canvas
	useEffect(() => {
		if (!userPlacement && !isConfirmed) return; // Only show canvas after user has placed something

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		canvas.width = CANVAS_SIZE;
		canvas.height = CANVAS_SIZE;

		// Clear canvas and draw logos only (no grid)
		ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
		drawLogos(ctx);
	}, [logos, userPlacement, isConfirmed, CANVAS_SIZE]);

	const drawLogos = (ctx: CanvasRenderingContext2D) => {
		logos.forEach(async (logo) => {
			try {
				// Fetch logo URL if not already set
				if (!logo.logoUrl) {
					const { logoUrl } = await fetchCompanyLogo(logo.url);
					logo.logoUrl = logoUrl;
				}

				const img = new Image();
				img.crossOrigin = "anonymous";
				img.onload = () => {
					ctx.drawImage(
						img,
						logo.x * CELL_SIZE + 2,
						logo.y * CELL_SIZE + 2,
						CELL_SIZE - 4,
						CELL_SIZE - 4,
					);

					// Add user indicator for current user's placement
					if (logo.address === address) {
						ctx.strokeStyle = "#10b981";
						ctx.lineWidth = 2;
						ctx.strokeRect(
							logo.x * CELL_SIZE + 1,
							logo.y * CELL_SIZE + 1,
							CELL_SIZE - 2,
							CELL_SIZE - 2,
						);
					}
				};
				img.src = logo.logoUrl;
			} catch (error) {
				console.error("Failed to load logo:", error);
			}
		});
	};

	// Find a random available position
	const findRandomAvailablePosition = (): { x: number; y: number } | null => {
		const occupiedPositions = new Set(
			logos.map((logo) => `${logo.x},${logo.y}`),
		);

		const availablePositions: { x: number; y: number }[] = [];

		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {
				if (!occupiedPositions.has(`${x},${y}`)) {
					availablePositions.push({ x, y });
				}
			}
		}

		if (availablePositions.length === 0) return null;

		const randomIndex = Math.floor(Math.random() * availablePositions.length);
		return availablePositions[randomIndex];
	};

	const fetchCompanyLogo = async (
		url: string,
	): Promise<{ logoUrl: string; companyName: string }> => {
		try {
			// Normalize URL
			const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
			const domain = new URL(normalizedUrl).hostname;

			// Try multiple logo fetching strategies
			const logoSources = [
				`https://logo.clearbit.com/${domain}`,
				`https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
				`https://${domain}/favicon.ico`,
			];

			for (const logoUrl of logoSources) {
				try {
					const response = await fetch(
						`/api/proxy-image?url=${encodeURIComponent(logoUrl)}`,
					);
					if (response.ok) {
						return {
							logoUrl: logoUrl,
							companyName: domain.replace("www.", ""),
						};
					}
				} catch {
					// Continue to next logo source
				}
			}

			// Fallback to a default logo with company initial
			return {
				logoUrl: `data:image/svg+xml,${encodeURIComponent(`
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
						<rect width="40" height="40" fill="#3b82f6"/>
						<text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">
							${domain.charAt(0).toUpperCase()}
						</text>
					</svg>
				`)}`,
				companyName: domain.replace("www.", ""),
			};
		} catch {
			throw new Error("Invalid URL format");
		}
	};

	const handleAddLogo = async () => {
		if (!companyUrl.trim()) {
			setError("Please enter a company URL");
			return;
		}

		if (!isConnected) {
			setError("Please connect your wallet first");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Fetch company logo to validate URL and get company name
			const { companyName } = await fetchCompanyLogo(companyUrl);

			// Find a random available position
			const randomPosition = findRandomAvailablePosition();
			if (!randomPosition) {
				setError("Canvas is full! No available positions.");
				setIsLoading(false);
				return;
			}

			// Send blockchain transaction
			await placeCompany(
				companyUrl,
				companyName,
				randomPosition.x,
				randomPosition.y,
			);

			setCompanyUrl("");
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to place company logo",
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Show initial URL input form if user hasn't placed anything yet
	if (!userPlacement && !isConfirmed) {
		return (
			<div className="w-full max-w-md mx-auto space-y-6">
				<div className="text-center">
					<h2 className="text-xl font-bold mb-2">🎨 The Place</h2>
					<p className="text-sm text-muted-foreground">
						Add your company logo to a random spot on the collaborative canvas
					</p>
				</div>

				{(error || contractError) && (
					<Alert variant="destructive">
						<AlertDescription>
							{error || contractError?.message}
						</AlertDescription>
					</Alert>
				)}

				<Card className="p-4">
					<div className="space-y-4">
						<div>
							<label
								htmlFor={companyUrlId}
								className="text-sm font-medium mb-2 block"
							>
								Company URL
							</label>
							<Input
								id={companyUrlId}
								type="url"
								placeholder="company.com or https://company.com"
								value={companyUrl}
								onChange={(e) => setCompanyUrl(e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<Button
							onClick={handleAddLogo}
							disabled={
								isLoading ||
								isContractLoading ||
								isConfirming ||
								!companyUrl.trim() ||
								!isConnected ||
								logos.length >= 49
							}
							className="w-full"
						>
							{isLoading || isContractLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									{isConfirming ? "Confirming..." : "Adding Logo..."}
								</>
							) : logos.length >= 49 ? (
								"🎉 Canvas Full!"
							) : (
								<>
									<Plus className="w-4 h-4 mr-2" />
									{isConnected
										? "Add Logo to Random Position"
										: "Connect Wallet First"}
								</>
							)}
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	// Show canvas view after user has placed their logo
	return (
		<div className="w-full max-w-md mx-auto space-y-6">
			<div className="text-center">
				<h2 className="text-xl font-bold mb-2">🎨 The Place</h2>
				<p className="text-sm text-muted-foreground">
					Collaborative canvas with company logos
				</p>
			</div>

			{isConfirmed && hash && (
				<Alert className="bg-green-50 border-green-200">
					<Trophy className="h-4 w-4 text-green-600" />
					<AlertDescription className="text-green-800">
						<div className="space-y-2">
							<p className="font-medium">Company logo placed successfully!</p>
							<div className="flex items-center gap-2 text-sm">
								<span>Transaction:</span>
								<code className="bg-green-100 px-2 py-1 rounded text-xs font-mono">
									{hash.slice(0, 10)}...{hash.slice(-8)}
								</code>
							</div>
						</div>
					</AlertDescription>
				</Alert>
			)}

			<Card className="p-4">
				<div className="space-y-4">
					<div>
						<label
							htmlFor={liveCanvasId}
							className="text-sm font-medium mb-2 block"
						>
							Live Canvas ({logos.length}/49 spots filled)
						</label>
						<div className="flex justify-center">
							<canvas
								id={liveCanvasId}
								ref={canvasRef}
								className="border rounded-lg max-w-full h-auto"
								style={{
									width: "100%",
									maxWidth: `${CANVAS_SIZE}px`,
									height: "auto",
									aspectRatio: "1/1",
								}}
							/>
						</div>
					</div>
				</div>
			</Card>

			{logos.length > 0 && (
				<Card className="p-4">
					<h3 className="font-medium mb-3">Companies ({logos.length}/49)</h3>
					<div className="space-y-2 max-h-40 overflow-y-auto">
						{logos.map((logo) => (
							<div
								key={logo.id}
								className="flex items-center justify-between text-sm"
							>
								<div className="flex items-center gap-2">
									<div className="w-6 h-6 bg-muted rounded flex items-center justify-center text-xs">
										{logo.companyName.charAt(0).toUpperCase()}
									</div>
									<span
										className={
											logo.address === address ? "font-medium text-primary" : ""
										}
									>
										{logo.companyName}
										{logo.address === address && " (You)"}
									</span>
								</div>
								<div className="text-muted-foreground">
									({logo.x + 1}, {logo.y + 1})
								</div>
							</div>
						))}
					</div>
				</Card>
			)}
		</div>
	);
}
