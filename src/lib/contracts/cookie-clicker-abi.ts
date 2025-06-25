import { arbitrumSepolia, sepolia } from "viem/chains";

export const COOKIE_CLICKER_ADDRESS = {
	[sepolia.id]: "0x35F280c2233d64be5BCfAf3A9F3A4273829b1722",
	[arbitrumSepolia.id]: "0x2f9D5499951BCB1D1d128c5EBD27Ce7130c11149",
} as const;

export const COOKIE_CLICKER_ABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "player",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "cookies",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "duration",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "GameSessionRecorded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "player",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newBestScore",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "previousBestScore",
				type: "uint256",
			},
		],
		name: "NewBestScore",
		type: "event",
	},
	{
		inputs: [{ internalType: "address", name: "", type: "address" }],
		name: "bestScores",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "player", type: "address" }],
		name: "getLatestPlayerSession",
		outputs: [
			{ internalType: "uint256", name: "cookies", type: "uint256" },
			{ internalType: "uint256", name: "timestamp", type: "uint256" },
			{ internalType: "uint256", name: "duration", type: "uint256" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "player", type: "address" }],
		name: "getPlayerBestScore",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "player", type: "address" },
			{ internalType: "uint256", name: "sessionIndex", type: "uint256" },
		],
		name: "getPlayerSession",
		outputs: [
			{ internalType: "uint256", name: "cookies", type: "uint256" },
			{ internalType: "uint256", name: "timestamp", type: "uint256" },
			{ internalType: "uint256", name: "duration", type: "uint256" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "player", type: "address" }],
		name: "getPlayerSessionCount",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getTotalCookiesClicked",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "", type: "address" },
			{ internalType: "uint256", name: "", type: "uint256" },
		],
		name: "playerSessions",
		outputs: [
			{ internalType: "uint256", name: "cookies", type: "uint256" },
			{ internalType: "uint256", name: "timestamp", type: "uint256" },
			{ internalType: "uint256", name: "duration", type: "uint256" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "cookies", type: "uint256" },
			{ internalType: "uint256", name: "duration", type: "uint256" },
		],
		name: "recordGameSession",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "totalCookiesClicked",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;
