import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#0f0f0f",
				backgroundImage: "linear-gradient(to bottom right, #0f0f0f, #1a1a1a)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Background decorative elements */}
			<div
				style={{
					position: "absolute",
					top: "-100px",
					right: "-100px",
					width: "300px",
					height: "300px",
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: "-150px",
					left: "-150px",
					width: "400px",
					height: "400px",
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)",
				}}
			/>

			{/* Cookie emoji */}
			<div
				style={{
					fontSize: "120px",
					marginBottom: "40px",
					filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))",
				}}
			>
				🍪
			</div>

			{/* Main title */}
			<div
				style={{
					fontSize: "72px",
					fontWeight: "bold",
					color: "white",
					marginBottom: "20px",
					letterSpacing: "-2px",
				}}
			>
				Cookie Click
			</div>

			{/* Subtitle */}
			<div
				style={{
					fontSize: "28px",
					color: "#a3a3a3",
					display: "flex",
					alignItems: "center",
					gap: "10px",
				}}
			>
				powered by
				<span style={{ color: "#f97316", fontWeight: "600" }}>Batua</span>
				<span style={{ color: "#a3a3a3" }}>&</span>
				<span style={{ color: "#f97316", fontWeight: "600" }}>Pimlico</span>
			</div>

			{/* Bottom decoration */}
			<div
				style={{
					position: "absolute",
					bottom: "40px",
					display: "flex",
					gap: "15px",
				}}
			>
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						style={{
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							backgroundColor: "rgba(249, 115, 22, 0.4)",
						}}
					/>
				))}
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
