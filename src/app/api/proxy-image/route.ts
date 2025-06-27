import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const imageUrl = searchParams.get("url");

	if (!imageUrl) {
		return NextResponse.json(
			{ error: "URL parameter is required" },
			{ status: 400 },
		);
	}

	try {
		const response = await fetch(imageUrl, {
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; LogoFetcher/1.0)",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType?.startsWith("image/")) {
			throw new Error("Not an image");
		}

		const imageBuffer = await response.arrayBuffer();

		return new NextResponse(imageBuffer, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400", // Cache for 24 hours
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch image" },
			{ status: 404 },
		);
	}
}
