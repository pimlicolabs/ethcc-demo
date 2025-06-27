"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trophy, ExternalLink, AlertCircle } from "lucide-react";
import { useChainId } from "wagmi";
import { useThePlaceContract } from "@/hooks/use-the-place-contract";
import { containsBannedContent, isValidUrl } from "@/lib/content-validation";

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
	const [validationError, setValidationError] = useState<string | null>(null);
	const [logos, setLogos] = useState<CompanyLogo[]>([]);
	const companyUrlId = useId();
	const liveCanvasId = useId();
	const chainId = useChainId();

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

	// Chain ID to explorer URL mapping
	const CHAIN_EXPLORERS: Record<number, string> = {
		1: "https://etherscan.io",
		10: "https://optimistic.etherscan.io",
		56: "https://bscscan.com",
		137: "https://polygonscan.com",
		8453: "https://basescan.org",
		42161: "https://arbiscan.io",
		421614: "https://sepolia.arbiscan.io", // Arbitrum Sepolia
		11155111: "https://sepolia.etherscan.io", // Ethereum Sepolia
	};

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

	// Get explorer URL for current chain
	const getExplorerUrl = (txHash: string) => {
		const baseUrl = CHAIN_EXPLORERS[chainId];
		return baseUrl ? `${baseUrl}/tx/${txHash}` : undefined;
	};

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

	// Handle canvas click to open company website
	const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const clickX = Math.floor(
			((event.clientX - rect.left) * scaleX) / CELL_SIZE,
		);
		const clickY = Math.floor(
			((event.clientY - rect.top) * scaleY) / CELL_SIZE,
		);

		// Find logo at clicked position
		const clickedLogo = logos.find(
			(logo) => logo.x === clickX && logo.y === clickY,
		);

		if (clickedLogo) {
			// Normalize URL and open in new tab
			const url = clickedLogo.url.startsWith("http")
				? clickedLogo.url
				: `https://${clickedLogo.url}`;
			window.open(url, "_blank", "noopener,noreferrer");
		}
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

			let logoFound = false;
			for (const logoUrl of logoSources) {
				try {
					const response = await fetch(
						`/api/proxy-image?url=${encodeURIComponent(logoUrl)}`,
					);
					if (response.ok) {
						logoFound = true;
						return {
							logoUrl: logoUrl,
							companyName: domain.replace("www.", ""),
						};
					}
				} catch {
					// Continue to next logo source
				}
			}

			// If no logos were found, throw an error to prevent transaction
			if (!logoFound) {
				throw new Error(
					`Unable to fetch logo for ${domain}. Please try a different company URL.`,
				);
			}

			// This should not be reached, but keep fallback for safety
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
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("Invalid URL format");
		}
	};

	// Validate URL input
	const validateInput = (url: string) => {
		if (!url.trim()) {
			setValidationError(null);
			return;
		}

		// Check URL format
		if (!isValidUrl(url)) {
			setValidationError("Please enter a valid URL");
			return;
		}

		// Check for banned content
		const { isValid, reason } = containsBannedContent(url, url);
		if (!isValid) {
			setValidationError(reason || "Content not allowed");
			return;
		}

		setValidationError(null);
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

		// Client-side validation
		if (!isValidUrl(companyUrl)) {
			setError("Please enter a valid URL");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Fetch company logo to validate URL and get company name
			const { companyName } = await fetchCompanyLogo(companyUrl);

			// Final content validation with actual company name
			const { isValid, reason } = containsBannedContent(
				companyUrl,
				companyName,
			);
			if (!isValid) {
				setError(reason || "Content not allowed");
				setIsLoading(false);
				return;
			}

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
			setValidationError(null);
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
					<p className="text-sm text-muted-foreground">
						Become part of ETHCC Canvas
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
								Your company
							</label>
							<Input
								id={companyUrlId}
								type="url"
								placeholder="company.com or https://company.com"
								value={companyUrl}
								onChange={(e) => {
									setCompanyUrl(e.target.value);
									validateInput(e.target.value);
								}}
								disabled={isLoading}
							/>
							{validationError && (
								<p className="text-sm text-destructive mt-2 flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{validationError}
								</p>
							)}
						</div>

						<Button
							onClick={handleAddLogo}
							disabled={
								isLoading ||
								isContractLoading ||
								isConfirming ||
								!companyUrl.trim() ||
								!isConnected ||
								logos.length >= 49 ||
								!!validationError
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
									{/* <Plus className="w-4 h-4 mr-2" /> */}
									{isConnected ? "Submit" : "Connect Wallet First"}
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
								{getExplorerUrl(hash) && (
									<a
										href={getExplorerUrl(hash)}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-green-600 hover:text-green-700"
									>
										<ExternalLink className="h-3 w-3" />
									</a>
								)}
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
								onClick={handleCanvasClick}
								className="border rounded-lg max-w-full h-auto cursor-pointer"
								style={{
									width: "100%",
									maxWidth: `${CANVAS_SIZE}px`,
									height: "auto",
									aspectRatio: "1/1",
								}}
							/>
						</div>
						<p className="text-sm text-muted-foreground text-center mt-2">
							Click on any logo to visit their website
						</p>
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
