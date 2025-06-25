import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const NetworkFee = ({
	gasCost: costInEther,
	ethPrice,
	hasPaymaster,
	refreshingGasCost,
	dappName,
}: {
	hasPaymaster: boolean;
	refreshingGasCost: boolean;
	gasCost: bigint | null;
	ethPrice: number;
	dappName: string;
}) => {
	const gasCost =
		costInEther !== null
			? Number(costInEther * BigInt(ethPrice)) / (100 * 10 ** 18)
			: null;

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-start justify-between w-full">
				<div className="text-sm">Network fee (est.)</div>

				<div className="text-sm flex items-center gap-1">
					<div className="flex justify-end flex-col">
						<div
							className={`flex gap-2 justify-end ${hasPaymaster && gasCost ? "line-through" : ""} ${refreshingGasCost ? "text-muted-foreground" : ""}`}
						>
							{gasCost === null ? (
								<div className="flex justify-center items-center gap-2">
									<Loader2 className="h-3 w-3 animate-spin" />
									Calculating
								</div>
							) : null}
							{hasPaymaster && gasCost !== null ? (
								<span className="tabular-nums">
									{gasCost.toLocaleString("en-US", {
										style: "currency",
										currency: "USD",
										maximumFractionDigits: 2,
									})}
								</span>
							) : null}

							{/* {!hasPaymaster && gasCost !== null ? (
								<div
									className={`flex flex-col justify-end ${refreshingGasCost ? "text-muted-foreground" : ""}`}
								>
									<div className="flex justify-end">
										{gasCost.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
											maximumFractionDigits: 2,
										})}
									</div>
									{costInEther ? (
										<div className="flex justify-end text-xs text-muted-foreground">
											({Number(formatEther(costInEther)).toFixed(5)} ETH)
										</div>
									) : null}
								</div>
							) : null} */}
						</div>
						{hasPaymaster ||
							(costInEther === BigInt(0) && (
								<Badge variant="outline" className="flex justify-end">
									Sponsored by {dappName}
								</Badge>
							))}
					</div>
				</div>
			</div>
		</div>
	);
};
