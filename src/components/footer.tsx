import Image from "next/image";
import Link from "next/link";

export function Footer() {
	return (
		<div className="p-4 text-center">
			<Link href="https://pimlico.io" target="_blank">
				<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
					<span>Powered by</span>
					<Image
						src="/pimlico-logo.svg"
						alt="Pimlico"
						width={80}
						height={16}
						className="h-4 w-auto"
					/>
				</div>
			</Link>
		</div>
	);
}
