"use client";
import { AlertCircle, Fingerprint, Loader2 } from "lucide-react";
import { Provider } from "ox";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AssetChangeEvents } from "@/components/batua/AssetChangeEvents";
import { NetworkInformation } from "@/components/batua/NetworkInformation";
import { SendCallsHeader } from "@/components/batua/SendCallsHeader";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAssetChangeEvents } from "@/hooks/batua/useAssetChangeEvents";
import { useBalance } from "@/hooks/batua/useBalance";
import { useChain } from "@/hooks/batua/useChain";
import { useClient } from "@/hooks/batua/useClient";
import { useEthPrice } from "@/hooks/batua/useEthPrice";
import { useGasCost } from "@/hooks/batua/useGasCost";
import { useSendCallsRequest } from "@/hooks/batua/useSendCallsRequest";
import { useSmartAccount } from "@/hooks/batua/useSmartAccount";
import { useUserOperation } from "@/hooks/batua/useUserOperation";
import type { Call, Internal, QueuedRequest } from "@/lib/batua/type";

export const SendCalls = ({
	onComplete,
	queueRequest,
	internal,
	dummy,
}: {
	onComplete: (args: { queueRequest: QueuedRequest }) => void | Promise<void>;
	queueRequest: QueuedRequest;
	internal: Internal;
	dummy?: boolean;
}) => {
	const { request, hasPaymaster } = useSendCallsRequest({
		internal,
		queueRequest,
	});

	const chain = useChain(internal);
	const client = useClient({ internal, chain: chain });

	const smartAccountClient = useSmartAccount({
		internal,
		accountAddress: request.params[0].from,
		capabilities: request.params[0].capabilities,
		client: client,
	});

	const { userOperation, updating: refreshingGasCost } = useUserOperation({
		smartAccountClient,
		request,
		boosted: internal.config.boosted,
	});

	// const decodedCallData = useDecodedCallData({
	//     calls: request.params[0].calls
	// })

	const ethPrice = useEthPrice(internal);
	const gasCost = useGasCost(userOperation);
	const balance = useBalance({
		address: userOperation?.sender,
		client: client,
	});

	const hasEnoughBalance = useMemo(
		() =>
			balance !== null && gasCost !== null
				? hasPaymaster ||
					balance > gasCost ||
					(balance === BigInt(0) && gasCost === BigInt(0))
				: true,
		[balance, gasCost, hasPaymaster],
	);

	const [sendingTransaction, setSendingTransaction] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const assetChangeEvents = useAssetChangeEvents({
		userOperation,
		client,
		smartAccountClient,
	});

	const onOpenChange = (open: boolean) => {
		if (!open) {
			onComplete({
				queueRequest: {
					request: queueRequest.request,
					status: "error",
					error: new Provider.UserRejectedRequestError(),
				},
			});
		}
	};

	// Scroll to top when error occurs
	useEffect(() => {
		if (error) {
			const dialogContent = document.querySelector(".overflow-y-scroll");
			if (dialogContent) {
				dialogContent.scrollTop = 0;
			}
		}
	}, [error]);

	const sendTransaction = useCallback(async () => {
		if (dummy) {
			return;
		}
		try {
			if (!smartAccountClient || !userOperation) {
				return;
			}
			setError(null);

			setSendingTransaction(true);

			const signature = await smartAccountClient.account.signUserOperation({
				...userOperation,
			});

			const userOpHash = await smartAccountClient.sendUserOperation({
				...userOperation,
				signature,
			});

			onComplete({
				queueRequest: {
					request: queueRequest.request,
					status: "success",
					result: userOpHash,
				},
			});
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Failed to send transaction. Please try again.",
			);
		} finally {
			setSendingTransaction(false);
		}
	}, [
		dummy,
		onComplete,
		queueRequest.request,
		smartAccountClient,
		userOperation,
	]);

	const isLoading = useMemo(() => {
		return !userOperation || !smartAccountClient || !assetChangeEvents;
	}, [userOperation, smartAccountClient, assetChangeEvents]);

	return (
		<Dialog open={!!queueRequest} onOpenChange={onOpenChange}>
			<DialogContent
				className={`sm:max-w-[400px] p-0 flex justify-start gap-0 flex-col ${isLoading ? "max-h-[370px] overflow-hidden" : "max-h-[75vh] overflow-y-auto"} transition-[max-height] duration-500 ease-in-out`}
			>
				<div className="p-6 pb-0">
					<SendCallsHeader
						calls={request.params[0].calls as Call[]}
						userOperation={userOperation}
					/>

					{error && (
						<Alert variant="destructive" className="mb-5">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<NetworkInformation
						chainName={chain.name}
						dappName={internal.config.dappName}
						hasPaymaster={hasPaymaster}
						refreshingGasCost={refreshingGasCost}
						gasCost={gasCost}
						ethPrice={ethPrice}
					/>

					<hr className="my-4" />

					{assetChangeEvents === null ? (
						<div className="flex justify-center items-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<AssetChangeEvents
							assetChangeEvents={assetChangeEvents}
							smartAccountAddress={smartAccountClient?.account.address}
						/>
					)}

					{!hasEnoughBalance && (
						<Alert variant="destructive" className="mb-3">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Insufficient balance to cover gas fees for this transaction
							</AlertDescription>
						</Alert>
					)}
				</div>
				<div className="sticky bottom-0 left-0 right-0 bg-background z-10 p-6">
					<Button
						variant="default"
						className="w-full justify-center h-12 text-base font-medium shadow-sm hover:shadow transition-all"
						onClick={sendTransaction}
						disabled={sendingTransaction || !hasEnoughBalance || !userOperation}
					>
						{sendingTransaction ? (
							<>
								<Loader2 className="h-5 w-5 mr-2 animate-spin" />
								<span>Processing Transaction...</span>
							</>
						) : (
							<>
								<Fingerprint className="h-4 w-4" />
								<span>Confirm and Send</span>
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
