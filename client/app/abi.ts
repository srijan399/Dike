const abi = [
    {
      "type": "constructor",
      "inputs": [
        { "name": "_pyUSD", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "MINIMUM_LIQUIDITY",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "createPrediction",
      "inputs": [
        { "name": "_title", "type": "string", "internalType": "string" },
        { "name": "_category", "type": "string", "internalType": "string" },
        { "name": "_metadata", "type": "string", "internalType": "string" },
        {
          "name": "_resolutionDate",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_initialLiquidity",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getActivePredictions",
      "inputs": [],
      "outputs": [
        {
          "name": "activePredictions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCurrentPrices",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        { "name": "yesPrice", "type": "uint256", "internalType": "uint256" },
        { "name": "noPrice", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPrediction",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct MultiversePrediction.Prediction",
          "components": [
            { "name": "id", "type": "uint256", "internalType": "uint256" },
            { "name": "creator", "type": "address", "internalType": "address" },
            { "name": "title", "type": "string", "internalType": "string" },
            { "name": "category", "type": "string", "internalType": "string" },
            { "name": "metadata", "type": "string", "internalType": "string" },
            {
              "name": "resolutionDate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initialLiquidity",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "yesLiquidity",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "noLiquidity",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "resolved", "type": "bool", "internalType": "bool" },
            { "name": "outcome", "type": "bool", "internalType": "bool" },
            {
              "name": "createdAt",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "active", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPredictionInvestments",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct MultiversePrediction.Investment[]",
          "components": [
            {
              "name": "predictionId",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "investor",
              "type": "address",
              "internalType": "address"
            },
            { "name": "amount", "type": "uint256", "internalType": "uint256" },
            { "name": "side", "type": "bool", "internalType": "bool" },
            {
              "name": "expectedVotes",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "timestamp",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "claimed", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPredictionWithPrices",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "prediction",
          "type": "tuple",
          "internalType": "struct MultiversePrediction.Prediction",
          "components": [
            { "name": "id", "type": "uint256", "internalType": "uint256" },
            { "name": "creator", "type": "address", "internalType": "address" },
            { "name": "title", "type": "string", "internalType": "string" },
            { "name": "category", "type": "string", "internalType": "string" },
            { "name": "metadata", "type": "string", "internalType": "string" },
            {
              "name": "resolutionDate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initialLiquidity",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "yesLiquidity",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "noLiquidity",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "resolved", "type": "bool", "internalType": "bool" },
            { "name": "outcome", "type": "bool", "internalType": "bool" },
            {
              "name": "createdAt",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "active", "type": "bool", "internalType": "bool" }
          ]
        },
        { "name": "yesPrice", "type": "uint256", "internalType": "uint256" },
        { "name": "noPrice", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getTotalLiquidity",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserChain",
      "inputs": [
        { "name": "_user", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "predictionIds",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        {
          "name": "totalInvested",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "totalClaimed", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserInvestmentsInPrediction",
      "inputs": [
        { "name": "_user", "type": "address", "internalType": "address" },
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct MultiversePrediction.Investment[]",
          "components": [
            {
              "name": "predictionId",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "investor",
              "type": "address",
              "internalType": "address"
            },
            { "name": "amount", "type": "uint256", "internalType": "uint256" },
            { "name": "side", "type": "bool", "internalType": "bool" },
            {
              "name": "expectedVotes",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "timestamp",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "claimed", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserTotalInvestmentInPrediction",
      "inputs": [
        { "name": "_user", "type": "address", "internalType": "address" },
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        { "name": "totalAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "yesAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "noAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "investInPrediction",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "_amount", "type": "uint256", "internalType": "uint256" },
        { "name": "_side", "type": "bool", "internalType": "bool" },
        {
          "name": "_minExpectedVotes",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "predictionCounter",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "predictionInvestments",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "investor", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" },
        { "name": "side", "type": "bool", "internalType": "bool" },
        {
          "name": "expectedVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "timestamp", "type": "uint256", "internalType": "uint256" },
        { "name": "claimed", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "predictions",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "id", "type": "uint256", "internalType": "uint256" },
        { "name": "creator", "type": "address", "internalType": "address" },
        { "name": "title", "type": "string", "internalType": "string" },
        { "name": "category", "type": "string", "internalType": "string" },
        { "name": "metadata", "type": "string", "internalType": "string" },
        {
          "name": "resolutionDate",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "initialLiquidity",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "yesLiquidity",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "noLiquidity", "type": "uint256", "internalType": "uint256" },
        { "name": "resolved", "type": "bool", "internalType": "bool" },
        { "name": "outcome", "type": "bool", "internalType": "bool" },
        { "name": "createdAt", "type": "uint256", "internalType": "uint256" },
        { "name": "active", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pyUSD",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract IERC20" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "resolvePrediction",
      "inputs": [
        {
          "name": "_predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "_outcome", "type": "bool", "internalType": "bool" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "userChains",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [
        {
          "name": "totalInvested",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "totalClaimed", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userInvestments",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "investor", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" },
        { "name": "side", "type": "bool", "internalType": "bool" },
        {
          "name": "expectedVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "timestamp", "type": "uint256", "internalType": "uint256" },
        { "name": "claimed", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "InvestmentMade",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "investor",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "side",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        },
        {
          "name": "yesPrice",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "noPrice",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PredictionCreated",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "title",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "initialLiquidity",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "resolutionDate",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PredictionResolved",
      "inputs": [
        {
          "name": "predictionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "outcome",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    }
  ]

export default abi;