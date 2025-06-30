import { Bug } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UserOperation } from "viem/account-abstraction";
import { CopyAddress } from "@/components/batua/CopyAddress";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Call } from "@/lib/batua/type";
import { COOKIE_CLICKER_ADDRESS } from "@/lib/contracts/cookie-clicker-abi";

export const SendCallsHeader = ({
	userOperation,
	calls,
}: {
	userOperation: UserOperation<"0.7"> | null;
	calls: Call[];
}) => {
	const [senderHost, setSenderHost] = useState("");

	console.log(calls);

	const callToCookieClicker = useMemo(
		() =>
			calls.find(
				(call) => call.to === "0xBD5AE2C52A24200C6D3aD445b65E1c3242a09E39",
			),
		[calls],
	);

	useEffect(() => {
		setSenderHost(window.location.host);
	}, []);

	// const [currentDateTime, setCurrentDateTime] = useState("")

	// useEffect(() => {
	//     setCurrentDateTime(format(new Date(), "MMM d, yyyy h:mm a"))
	// }, [])

	return (
		<div className="rounded-t-lg mb-4">
			<DialogHeader className="gap-0 border-b pb-2">
				<div>
					<DialogTitle className="text-xl font-semibold flex items-center justify-start">
						{callToCookieClicker ? "Save score" : "Place logo"}
					</DialogTitle>
					<DialogDescription className="text-sm w-full flex items-center justify-between">
						<span>{senderHost}</span>
						<span className="text-muted-foreground">
							<CopyAddress
								name={<Bug className="h-4 w-4 text-muted-foreground" />}
								tooltip={`Click to copy raw transaction data`}
								value={userOperation?.callData ?? "0x"}
							/>
						</span>
					</DialogDescription>
				</div>
				{/* <div className="bg-muted/20 p-2 rounded-full">
                        <SendIcon className="h-5 w-5" />
                    </div> */}
			</DialogHeader>
		</div>
	);
};
