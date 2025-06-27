// Content validation utility to match smart contract's banned terms
export const BANNED_TERMS = [
	// Adult content keywords
	"pornhub",
	"xvideos",
	"xnxx",
	"xhamster",
	"redtube",
	"youporn",
	"porn",
	"xxx",
	"sex",
	"nude",
	"onlyfans",
	"chaturbate",
	"livejasmin",
	"stripchat",
	"bongacams",
	"cam4",
	"myfreecams",
	"camsoda",
	"flirt4free",
	"streamate",
	"imlive",
	"adult",
	"nsfw",
	"18+",
	"milf",
	"teen",
	"amateur",
	"webcam",
	"cam",
	"fetish",
	"bdsm",
	"hentai",
	"rule34",
	"furry",
	"yiff",
	"e621",
	"nhentai",
	"hanime",
	"fakku",
	"dlsite",
	"dmm",
	"jav",
	"av",
	"gravure",
	"erotic",
	"lewd",
	"ecchi",
	"oppai",
	"ahegao",
	"doujin",
];

export const ILLEGAL_TERMS = [
	// Illegal/harmful content keywords
	"drugs",
	"cocaine",
	"heroin",
	"meth",
	"weed",
	"marijuana",
	"cannabis",
	"darkweb",
	"darknet",
	"silkroad",
	"weapons",
	"guns",
	"explosives",
	"bomb",
	"terrorism",
	"hitman",
	"assassination",
	"murder",
	"illegal",
	"piracy",
];

// Helper function to check if content contains banned terms
export function containsBannedContent(
	url: string,
	companyName: string,
): { isValid: boolean; reason?: string } {
	const lowerUrl = url.toLowerCase();
	const lowerName = companyName.toLowerCase();

	// Check banned terms
	for (const term of BANNED_TERMS) {
		if (lowerUrl.includes(term) || lowerName.includes(term)) {
			return {
				isValid: false,
				reason: "Content contains inappropriate adult content",
			};
		}
	}

	// Check illegal terms
	for (const term of ILLEGAL_TERMS) {
		if (lowerUrl.includes(term) || lowerName.includes(term)) {
			return {
				isValid: false,
				reason: "Content contains illegal or harmful content",
			};
		}
	}

	return { isValid: true };
}

// Helper function to validate URL format
export function isValidUrl(url: string): boolean {
	try {
		// Add protocol if missing
		const urlToTest = url.startsWith("http") ? url : `https://${url}`;
		const parsed = new URL(urlToTest);
		// Basic validation
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}
