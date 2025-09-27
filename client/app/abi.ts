export const DikeAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_pyUSD",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "MINIMUM_LIQUIDITY",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "createPrediction",
        inputs: [
            {
                name: "_title",
                type: "string",
                internalType: "string",
            },
            {
                name: "_category",
                type: "string",
                internalType: "string",
            },
            {
                name: "_metadata",
                type: "string",
                internalType: "string",
            },
            {
                name: "_resolutionDate",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_initialLiquidity",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "getActivePredictions",
        inputs: [],
        outputs: [
            {
                name: "activePredictions",
                type: "uint256[]",
                internalType: "uint256[]",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getCurrentPrices",
        inputs: [
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "yesPrice",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "noPrice",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getPrediction",
        inputs: [
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct MultiversePrediction.Prediction",
                components: [
                    {
                        name: "id",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "creator",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "title",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "category",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "metadata",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "resolutionDate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "initialLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "yesLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "noLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "resolved",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "outcome",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "createdAt",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "active",
                        type: "bool",
                        internalType: "bool",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getPredictionInvestments",
        inputs: [
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct MultiversePrediction.Investment[]",
                components: [
                    {
                        name: "predictionId",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "investor",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "amount",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "side",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "expectedVotes",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "timestamp",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "claimed",
                        type: "bool",
                        internalType: "bool",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getPredictionWithPrices",
        inputs: [
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "prediction",
                type: "tuple",
                internalType: "struct MultiversePrediction.Prediction",
                components: [
                    {
                        name: "id",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "creator",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "title",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "category",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "metadata",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "resolutionDate",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "initialLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "yesLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "noLiquidity",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "resolved",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "outcome",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "createdAt",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "active",
                        type: "bool",
                        internalType: "bool",
                    },
                ],
            },
            {
                name: "yesPrice",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "noPrice",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getTotalLiquidity",
        inputs: [
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserChain",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "predictionIds",
                type: "uint256[]",
                internalType: "uint256[]",
            },
            {
                name: "totalInvested",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "totalClaimed",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserInvestmentsInPrediction",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct MultiversePrediction.Investment[]",
                components: [
                    {
                        name: "predictionId",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "investor",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "amount",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "side",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "expectedVotes",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "timestamp",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "claimed",
                        type: "bool",
                        internalType: "bool",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getUserTotalInvestmentInPrediction",
        inputs: [
            {
                name: "_user",
                type: "address",
                internalType: "address",
            },
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "totalAmount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "yesAmount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "noAmount",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "investInPrediction",
        inputs: [
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "_side", type: "bool", internalType: "bool" },
            {
                name: "_minExpectedVotes",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "predictionCounter",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "predictionInvestments",
        inputs: [
            { name: "", type: "uint256", internalType: "uint256" },
            { name: "", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
            {
                name: "predictionId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "investor",
                type: "address",
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "side", type: "bool", internalType: "bool" },
            {
                name: "expectedVotes",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "timestamp",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "claimed", type: "bool", internalType: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "predictions",
        inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        outputs: [
            { name: "id", type: "uint256", internalType: "uint256" },
            {
                name: "creator",
                type: "address",
                internalType: "address",
            },
            { name: "title", type: "string", internalType: "string" },
            {
                name: "category",
                type: "string",
                internalType: "string",
            },
            {
                name: "metadata",
                type: "string",
                internalType: "string",
            },
            {
                name: "resolutionDate",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "initialLiquidity",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "yesLiquidity",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "noLiquidity",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "resolved", type: "bool", internalType: "bool" },
            { name: "outcome", type: "bool", internalType: "bool" },
            {
                name: "createdAt",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "active", type: "bool", internalType: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "pyUSD",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract IERC20",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "renounceOwnership",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "resolvePrediction",
        inputs: [
            {
                name: "_predictionId",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "_outcome", type: "bool", internalType: "bool" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "transferOwnership",
        inputs: [
            {
                name: "newOwner",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "userChains",
        inputs: [{ name: "", type: "address", internalType: "address" }],
        outputs: [
            {
                name: "totalInvested",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "totalClaimed",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "userInvestments",
        inputs: [
            { name: "", type: "address", internalType: "address" },
            { name: "", type: "uint256", internalType: "uint256" },
            { name: "", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
            {
                name: "predictionId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "investor",
                type: "address",
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "side", type: "bool", internalType: "bool" },
            {
                name: "expectedVotes",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "timestamp",
                type: "uint256",
                internalType: "uint256",
            },
            { name: "claimed", type: "bool", internalType: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "event",
        name: "InvestmentMade",
        inputs: [
            {
                name: "predictionId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "investor",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "side",
                type: "bool",
                indexed: false,
                internalType: "bool",
            },
            {
                name: "yesPrice",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "noPrice",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnershipTransferred",
        inputs: [
            {
                name: "previousOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "newOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "PredictionCreated",
        inputs: [
            {
                name: "predictionId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "creator",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "title",
                type: "string",
                indexed: false,
                internalType: "string",
            },
            {
                name: "initialLiquidity",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "resolutionDate",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "PredictionResolved",
        inputs: [
            {
                name: "predictionId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "outcome",
                type: "bool",
                indexed: false,
                internalType: "bool",
            },
        ],
        anonymous: false,
    },
];

export const PYUSD_ABI = [
    {
        inputs: [
            { internalType: "address", name: "account", type: "address" },
            { internalType: "bytes32", name: "role", type: "bytes32" },
        ],
        name: "AccessControlUnauthorizedAccount",
        type: "error",
    },
    { inputs: [], name: "AddressFrozen", type: "error" },
    { inputs: [], name: "AddressNotFrozen", type: "error" },
    { inputs: [], name: "AlreadyPaused", type: "error" },
    { inputs: [], name: "AlreadyUnPaused", type: "error" },
    { inputs: [], name: "ArgumentLengthMismatch", type: "error" },
    { inputs: [], name: "AuthorizationExpired", type: "error" },
    { inputs: [], name: "AuthorizationInvalid", type: "error" },
    { inputs: [], name: "BlockedAccountAuthorizer", type: "error" },
    { inputs: [], name: "CallerMustBePayee", type: "error" },
    { inputs: [], name: "ContractPaused", type: "error" },
    { inputs: [], name: "InsufficientAllowance", type: "error" },
    { inputs: [], name: "InsufficientFunds", type: "error" },
    { inputs: [], name: "InvalidECRecoverSignature", type: "error" },
    { inputs: [], name: "InvalidPermission", type: "error" },
    { inputs: [], name: "InvalidSignature", type: "error" },
    { inputs: [], name: "InvalidValueS", type: "error" },
    { inputs: [], name: "OnlySupplyController", type: "error" },
    { inputs: [], name: "OnlySupplyControllerOrOwner", type: "error" },
    { inputs: [], name: "PermitExpired", type: "error" },
    { inputs: [], name: "SupplyControllerUnchanged", type: "error" },
    { inputs: [], name: "ZeroAddress", type: "error" },
    { inputs: [], name: "ZeroValue", type: "error" },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "authorizer",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "nonce",
                type: "bytes32",
            },
        ],
        name: "AuthorizationAlreadyUsed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "authorizer",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "nonce",
                type: "bytes32",
            },
        ],
        name: "AuthorizationCanceled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "authorizer",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "nonce",
                type: "bytes32",
            },
        ],
        name: "AuthorizationUsed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [],
        name: "DefaultAdminDelayChangeCanceled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint48",
                name: "newDelay",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "effectSchedule",
                type: "uint48",
            },
        ],
        name: "DefaultAdminDelayChangeScheduled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [],
        name: "DefaultAdminTransferCanceled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "acceptSchedule",
                type: "uint48",
            },
        ],
        name: "DefaultAdminTransferScheduled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "FreezeAddress",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "FrozenAddressWiped",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint8",
                name: "version",
                type: "uint8",
            },
        ],
        name: "Initialized",
        type: "event",
    },
    { anonymous: false, inputs: [], name: "Pause", type: "event" },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32",
            },
        ],
        name: "RoleAdminChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleGranted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleRevoked",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "newSanctionedAddress",
                type: "address",
            },
        ],
        name: "SanctionedAddressListUpdate",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "supplyControlAddress",
                type: "address",
            },
        ],
        name: "SupplyControlSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "SupplyDecreased",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "SupplyIncreased",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "UnfreezeAddress",
        type: "event",
    },
    { anonymous: false, inputs: [], name: "Unpause", type: "event" },
    {
        inputs: [],
        name: "ASSET_PROTECTION_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "CANCEL_AUTHORIZATION_TYPEHASH",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "DOMAIN_SEPARATOR",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "EIP712_DOMAIN_HASH_DEPRECATED",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "PAUSE_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "PERMIT_TYPEHASH",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "RECEIVE_WITH_AUTHORIZATION_TYPEHASH",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "TRANSFER_WITH_AUTHORIZATION_TYPEHASH",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "acceptDefaultAdminTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "owner", type: "address" },
            { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "assetProtectionRoleDeprecated",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "authorizer", type: "address" },
            { internalType: "bytes32", name: "nonce", type: "bytes32" },
        ],
        name: "authorizationState",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "addr", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "newAdmin", type: "address" },
        ],
        name: "beginDefaultAdminTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "betaDelegateWhitelisterDeprecated",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "burn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "authorizer", type: "address" },
            { internalType: "bytes32", name: "nonce", type: "bytes32" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "cancelAuthorization",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "cancelDefaultAdminTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint48", name: "newDelay", type: "uint48" }],
        name: "changeDefaultAdminDelay",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "spender", type: "address" },
            {
                internalType: "uint256",
                name: "subtractedValue",
                type: "uint256",
            },
        ],
        name: "decreaseApproval",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
        name: "decreaseSupply",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "value", type: "uint256" },
            {
                internalType: "address",
                name: "burnFromAddress",
                type: "address",
            },
        ],
        name: "decreaseSupplyFromAddress",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "defaultAdmin",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "defaultAdminDelay",
        outputs: [{ internalType: "uint48", name: "", type: "uint48" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "defaultAdminDelayIncreaseWait",
        outputs: [{ internalType: "uint48", name: "", type: "uint48" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "addr", type: "address" }],
        name: "freeze",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address[]", name: "addresses", type: "address[]" },
        ],
        name: "freezeBatch",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
        name: "getRoleAdmin",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "addedValue", type: "uint256" },
        ],
        name: "increaseApproval",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
        name: "increaseSupply",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "value", type: "uint256" },
            { internalType: "address", name: "mintToAddress", type: "address" },
        ],
        name: "increaseSupplyToAddress",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint48", name: "initialDelay", type: "uint48" },
            { internalType: "address", name: "initialOwner", type: "address" },
            { internalType: "address", name: "pauser", type: "address" },
            {
                internalType: "address",
                name: "assetProtector",
                type: "address",
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "addr", type: "address" }],
        name: "isFrozen",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "account", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "owner", type: "address" }],
        name: "nonces",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "ownerDeprecated",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "paused",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingDefaultAdmin",
        outputs: [
            { internalType: "address", name: "newAdmin", type: "address" },
            { internalType: "uint48", name: "schedule", type: "uint48" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingDefaultAdminDelay",
        outputs: [
            { internalType: "uint48", name: "newDelay", type: "uint48" },
            { internalType: "uint48", name: "schedule", type: "uint48" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "owner", type: "address" },
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "permit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "proposedOwnerDeprecated",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
            { internalType: "uint256", name: "validAfter", type: "uint256" },
            { internalType: "uint256", name: "validBefore", type: "uint256" },
            { internalType: "bytes32", name: "nonce", type: "bytes32" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "receiveWithAuthorization",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "reclaimToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "rollbackDefaultAdminDelay",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "supplyControlAddress",
                type: "address",
            },
        ],
        name: "setSupplyControl",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "supplyControl",
        outputs: [
            {
                internalType: "contract SupplyControl",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "supplyControllerDeprecated",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes4", name: "interfaceId", type: "bytes4" },
        ],
        name: "supportsInterface",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address[]", name: "from", type: "address[]" },
            { internalType: "address[]", name: "to", type: "address[]" },
            { internalType: "uint256[]", name: "value", type: "uint256[]" },
        ],
        name: "transferFromBatch",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
            { internalType: "uint256", name: "validAfter", type: "uint256" },
            { internalType: "uint256", name: "validBefore", type: "uint256" },
            { internalType: "bytes32", name: "nonce", type: "bytes32" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "transferWithAuthorization",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address[]", name: "from", type: "address[]" },
            { internalType: "address[]", name: "to", type: "address[]" },
            { internalType: "uint256[]", name: "value", type: "uint256[]" },
            {
                internalType: "uint256[]",
                name: "validAfter",
                type: "uint256[]",
            },
            {
                internalType: "uint256[]",
                name: "validBefore",
                type: "uint256[]",
            },
            { internalType: "bytes32[]", name: "nonce", type: "bytes32[]" },
            { internalType: "uint8[]", name: "v", type: "uint8[]" },
            { internalType: "bytes32[]", name: "r", type: "bytes32[]" },
            { internalType: "bytes32[]", name: "s", type: "bytes32[]" },
        ],
        name: "transferWithAuthorizationBatch",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "addr", type: "address" }],
        name: "unfreeze",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address[]", name: "addresses", type: "address[]" },
        ],
        name: "unfreezeBatch",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "addr", type: "address" }],
        name: "wipeFrozenAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];

// Contract address
export const Dike_SEPOLIA_ADDRESS =
    "0x4b0fe8D4512F94771D6B04c0BCD7602A0c095C16";
export const PYUSD_SEPOLIA_ADDRESS =
    "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
