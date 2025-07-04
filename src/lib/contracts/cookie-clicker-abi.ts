import { arbitrum, arbitrumSepolia, sepolia } from "viem/chains";

export const COOKIE_CLICKER_ADDRESS = {
	[sepolia.id]: "0x35F280c2233d64be5BCfAf3A9F3A4273829b1722",
	[arbitrumSepolia.id]: "0x286837e8b533fec4ed4f612b000F729c55bC658A",
	[arbitrum.id]: "0xBD5AE2C52A24200C6D3aD445b65E1c3242a09E39",
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
				internalType: "string",
				name: "username",
				type: "string",
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
		inputs: [
			{
				internalType: "uint256",
				name: "cookies",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "duration",
				type: "uint256",
			},
		],
		name: "recordGameSession",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "username",
				type: "string",
			},
		],
		name: "setUsername",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
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
				internalType: "string",
				name: "username",
				type: "string",
			},
		],
		name: "UsernameSet",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "allPlayers",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "bestScores",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "player",
				type: "address",
			},
		],
		name: "getLatestPlayerSession",
		outputs: [
			{
				internalType: "uint256",
				name: "cookies",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "duration",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "username",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "player",
				type: "address",
			},
		],
		name: "getPlayerBestScore",
		outputs: [
			{
				internalType: "uint256",
				name: "cookies",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "duration",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "username",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "player",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "sessionIndex",
				type: "uint256",
			},
		],
		name: "getPlayerSession",
		outputs: [
			{
				internalType: "uint256",
				name: "cookies",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "duration",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "username",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "player",
				type: "address",
			},
		],
		name: "getPlayerSessionCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "player",
				type: "address",
			},
		],
		name: "getPlayerSessionHistory",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "cookies",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "timestamp",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "duration",
						type: "uint256",
					},
				],
				internalType: "struct CookieClicker.GameSession[]",
				name: "sessions",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getTop10GameSessions",
		outputs: [
			{
				internalType: "address[10]",
				name: "players",
				type: "address[10]",
			},
			{
				internalType: "uint256[10]",
				name: "cookies",
				type: "uint256[10]",
			},
			{
				internalType: "uint256[10]",
				name: "timestamps",
				type: "uint256[10]",
			},
			{
				internalType: "uint256[10]",
				name: "durations",
				type: "uint256[10]",
			},
			{
				internalType: "string[10]",
				name: "sessionUsernames",
				type: "string[10]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getTotalCookiesClicked",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getTotalPlayerCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "player",
				type: "address",
			},
		],
		name: "getUsername",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "isPlayerTracked",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "playerSessions",
		outputs: [
			{
				internalType: "uint256",
				name: "cookies",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "duration",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "totalCookiesClicked",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "usernames",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
] as const;
