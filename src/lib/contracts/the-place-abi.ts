export const THE_PLACE_ABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "string",
				name: "companyUrl",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "companyName",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint8",
				name: "x",
				type: "uint8",
			},
			{
				indexed: false,
				internalType: "uint8",
				name: "y",
				type: "uint8",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "CompanyPlaced",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "string",
				name: "oldUrl",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "newUrl",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "newCompanyName",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint8",
				name: "newX",
				type: "uint8",
			},
			{
				indexed: false,
				internalType: "uint8",
				name: "newY",
				type: "uint8",
			},
		],
		name: "CompanyUpdated",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "companyUrl",
				type: "string",
			},
			{
				internalType: "string",
				name: "companyName",
				type: "string",
			},
			{
				internalType: "uint8",
				name: "x",
				type: "uint8",
			},
			{
				internalType: "uint8",
				name: "y",
				type: "uint8",
			},
		],
		name: "placeCompany",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "removePlacement",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "allUsers",
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
		inputs: [],
		name: "getAllPlacements",
		outputs: [
			{
				internalType: "address[]",
				name: "users",
				type: "address[]",
			},
			{
				internalType: "string[]",
				name: "companyUrls",
				type: "string[]",
			},
			{
				internalType: "string[]",
				name: "companyNames",
				type: "string[]",
			},
			{
				internalType: "uint8[]",
				name: "xPositions",
				type: "uint8[]",
			},
			{
				internalType: "uint8[]",
				name: "yPositions",
				type: "uint8[]",
			},
			{
				internalType: "uint256[]",
				name: "timestamps",
				type: "uint256[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint8",
				name: "x",
				type: "uint8",
			},
			{
				internalType: "uint8",
				name: "y",
				type: "uint8",
			},
		],
		name: "getPlacementAtPosition",
		outputs: [
			{
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				internalType: "string",
				name: "companyUrl",
				type: "string",
			},
			{
				internalType: "string",
				name: "companyName",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint8",
				name: "x",
				type: "uint8",
			},
			{
				internalType: "uint8",
				name: "y",
				type: "uint8",
			},
		],
		name: "getPositionId",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "pure",
		type: "function",
	},
	{
		inputs: [],
		name: "getTotalPlacements",
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
				name: "user",
				type: "address",
			},
		],
		name: "getUserPlacement",
		outputs: [
			{
				internalType: "string",
				name: "companyUrl",
				type: "string",
			},
			{
				internalType: "string",
				name: "companyName",
				type: "string",
			},
			{
				internalType: "uint8",
				name: "x",
				type: "uint8",
			},
			{
				internalType: "uint8",
				name: "y",
				type: "uint8",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "exists",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "GRID_SIZE",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint8",
				name: "x",
				type: "uint8",
			},
			{
				internalType: "uint8",
				name: "y",
				type: "uint8",
			},
		],
		name: "isPositionAvailable",
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
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "positionToUser",
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
		name: "userPlacements",
		outputs: [
			{
				internalType: "string",
				name: "companyUrl",
				type: "string",
			},
			{
				internalType: "string",
				name: "companyName",
				type: "string",
			},
			{
				internalType: "uint8",
				name: "x",
				type: "uint8",
			},
			{
				internalType: "uint8",
				name: "y",
				type: "uint8",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "exists",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
] as const;
