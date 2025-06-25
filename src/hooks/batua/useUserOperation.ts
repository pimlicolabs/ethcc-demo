import type { RpcRequest, RpcSchema } from "ox";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import type { UserOperation } from "viem/account-abstraction";
import type { KernelSmartAccount } from "@/hooks/batua/useSmartAccount";

export const useUserOperation = ({
	smartAccountClient,
	request,
	boosted,
}: {
	smartAccountClient: KernelSmartAccount | null;
	request: RpcRequest.RpcRequest<
		RpcSchema.ExtractItem<RpcSchema.Default, "wallet_sendCalls">
	>;
	boosted:
		| boolean
		| {
				callGasLimit: bigint;
				verificationGasLimit: bigint;
				preVerificationGas: bigint;
		  };
}) => {
	const [userOperation, setUserOperation] =
		useState<UserOperation<"0.7"> | null>(null);

	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		if (!smartAccountClient) {
			return;
		}

		const updateUserOperation = async () => {
			setUpdating(true);
			const userOperation = await smartAccountClient.prepareUserOperation({
				calls: request.params[0].calls.map((call) => ({
					to: call.to ?? "0x",
					data: call.data ?? "0x",
					value: call.value ? BigInt(call.value) : undefined,
				})),
				stateOverride: [
					{
						address: smartAccountClient.account.address,
						balance: parseEther("100"),
					},
				],
				...(typeof boosted === "object"
					? {
							callGasLimit: boosted.callGasLimit,
							verificationGasLimit: boosted.verificationGasLimit,
							preVerificationGas: boosted.preVerificationGas,
						}
					: {}),
			});
			setUserOperation(userOperation);
			setUpdating(false);
		};

		updateUserOperation();

		const interval = setInterval(() => {
			updateUserOperation();
		}, 20_000); // updates every 20 seconds

		return () => clearInterval(interval);
	}, [smartAccountClient, request, boosted]);

	return { userOperation, updating };
};
