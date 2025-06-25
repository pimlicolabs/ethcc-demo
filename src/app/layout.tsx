import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Cookie Click - Powered by Batua & Pimlico",
	description:
		"A fun cookie clicking game demonstrating Web3 capabilities with Batua wallet integration and Pimlico infrastructure",
	icons: {
		icon: "/favicon.png",
		shortcut: "/favicon.ico",
		apple: "/favicon.png",
	},
	openGraph: {
		title: "Cookie Click - Powered by Batua & Pimlico",
		description:
			"A fun cookie clicking game demonstrating Web3 capabilities with Batua wallet integration and Pimlico infrastructure",
		images: [
			{
				url: "/api/og",
				width: 1200,
				height: 630,
				alt: "Cookie Click - Powered by Batua & Pimlico",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Cookie Click - Powered by Batua & Pimlico",
		description:
			"A fun cookie clicking game demonstrating Web3 capabilities with Batua wallet integration and Pimlico infrastructure",
		images: ["/api/og"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<Header />
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	);
}
