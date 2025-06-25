"use client";

import { DaimoPayButton } from "@daimo/pay";
import { getAddress, zeroAddress } from "viem";
import { base } from "viem/chains";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";

export function DepositButton() {
	const { address: recipientAddress } = useAccount();

	// Using Optimism USDC for payment
	return (
		<div className="w-full">
			<DaimoPayButton.Custom
				appId={process.env.NEXT_PUBLIC_DAIMO_APP_ID || ""}
				toChain={base.id}
				toUnits="5.00"
				toToken={getAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")}
				toAddress={recipientAddress || zeroAddress}
				onPaymentCompleted={(result) => {
					console.log("Payment completed:", result);
					// Handle successful payment
				}}
			>
				{({ show }) => (
					<Button onClick={show} className="w-full h-12" size="lg">
						Deposit $1 to Play
					</Button>
				)}
			</DaimoPayButton.Custom>
		</div>
	);
}
