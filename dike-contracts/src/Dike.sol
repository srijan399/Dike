// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiversePrediction is ReentrancyGuard, Ownable {
    IERC20 public immutable pyUSD;

    uint256 public predictionCounter;
    uint256 public constant MINIMUM_LIQUIDITY = 10 * 10 ** 6;

    struct Prediction {
        uint256 id;
        address creator;
        string title;
        string category;
        string metadata;
        uint256 resolutionDate;
        uint256 initialLiquidity;
        uint256 yesLiquidity;
        uint256 noLiquidity;
        bool resolved;
        bool outcome;
        uint256 createdAt;
        bool active;
    }

    struct Investment {
        uint256 predictionId;
        address investor;
        uint256 amount;
        bool side;
        uint256 expectedVotes;
        uint256 timestamp;
        bool claimed;
    }

    struct UserChain {
        uint256[] predictionIds;
        uint256 totalInvested;
        uint256 totalClaimed;
    }

    // Mappings
    mapping(uint256 => Prediction) public predictions;
    mapping(address => UserChain) public userChains;
    mapping(uint256 => Investment[]) public predictionInvestments;
    mapping(address => mapping(uint256 => Investment[])) public userInvestments; // user => predictionId => investments

    // Events
    event PredictionCreated(
        uint256 indexed predictionId,
        address indexed creator,
        string title,
        uint256 initialLiquidity,
        uint256 resolutionDate
    );

    event InvestmentMade(
        uint256 indexed predictionId,
        address indexed investor,
        uint256 amount,
        bool side,
        uint256 yesPrice,
        uint256 noPrice
    );

    event PredictionResolved(uint256 indexed predictionId, bool outcome);

    constructor(address _pyUSD) {
        pyUSD = IERC20(_pyUSD);
    }

    // ============ PREDICTION CREATION ============

    function createPrediction(
        string memory _title,
        string memory _category,
        string memory _metadata,
        uint256 _resolutionDate,
        uint256 _initialLiquidity
    ) external nonReentrant returns (uint256) {
        require(
            _initialLiquidity >= MINIMUM_LIQUIDITY,
            "Insufficient initial liquidity"
        );
        require(
            _resolutionDate > block.timestamp,
            "Resolution date must be in the future"
        );
        require(bytes(_title).length > 0, "Title cannot be empty");

        // Transfer initial liquidity from creator
        require(
            pyUSD.transferFrom(msg.sender, address(this), _initialLiquidity),
            "Transfer failed"
        );

        predictionCounter++;
        uint256 predictionId = predictionCounter;

        // Split initial liquidity equally between Yes and No
        uint256 halfLiquidity = _initialLiquidity / 2;

        predictions[predictionId] = Prediction({
            id: predictionId,
            creator: msg.sender,
            title: _title,
            category: _category,
            metadata: _metadata,
            resolutionDate: _resolutionDate,
            initialLiquidity: _initialLiquidity,
            yesLiquidity: halfLiquidity,
            noLiquidity: halfLiquidity,
            resolved: false,
            outcome: false,
            createdAt: block.timestamp,
            active: true
        });

        emit PredictionCreated(
            predictionId,
            msg.sender,
            _title,
            _initialLiquidity,
            _resolutionDate
        );

        return predictionId;
    }

    // ============ PREDICTION INVESTMENT ============

    function investInPrediction(
        uint256 _predictionId,
        uint256 _amount,
        bool _side,
        uint256 _minExpectedVotes
    ) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(predictions[_predictionId].active, "Prediction not active");
        require(
            !predictions[_predictionId].resolved,
            "Prediction already resolved"
        );
        require(
            block.timestamp < predictions[_predictionId].resolutionDate,
            "Prediction expired"
        );

        Prediction storage prediction = predictions[_predictionId];

        // Calculate current prices
        (uint256 yesPrice, uint256 noPrice) = getCurrentPrices(_predictionId);

        // Calculate expected votes based on current price
        uint256 expectedVotes = _side
            ? (_amount * 10 ** 18) / yesPrice
            : (_amount * 10 ** 18) / noPrice;

        require(
            expectedVotes >= _minExpectedVotes,
            "Slippage tolerance exceeded"
        );

        // Transfer investment amount
        require(
            pyUSD.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        // Update liquidity
        if (_side) {
            prediction.yesLiquidity += _amount;
        } else {
            prediction.noLiquidity += _amount;
        }

        // Create investment record
        Investment memory newInvestment = Investment({
            predictionId: _predictionId,
            investor: msg.sender,
            amount: _amount,
            side: _side,
            expectedVotes: expectedVotes,
            timestamp: block.timestamp,
            claimed: false
        });

        // Store investment
        predictionInvestments[_predictionId].push(newInvestment);
        userInvestments[msg.sender][_predictionId].push(newInvestment);

        // Update user chain
        UserChain storage userChain = userChains[msg.sender];

        // Add to chain if it's a new prediction for this user
        bool foundInChain = false;
        for (uint256 i = 0; i < userChain.predictionIds.length; i++) {
            if (userChain.predictionIds[i] == _predictionId) {
                foundInChain = true;
                break;
            }
        }

        if (!foundInChain) {
            userChain.predictionIds.push(_predictionId);
        }

        userChain.totalInvested += _amount;

        emit InvestmentMade(
            _predictionId,
            msg.sender,
            _amount,
            _side,
            yesPrice,
            noPrice
        );
    }

    // ============ GETTER FUNCTIONS ============

    function getCurrentPrices(
        uint256 _predictionId
    ) public view returns (uint256 yesPrice, uint256 noPrice) {
        Prediction memory prediction = predictions[_predictionId];
        uint256 totalLiquidity = prediction.yesLiquidity +
            prediction.noLiquidity;

        if (totalLiquidity == 0) {
            return (5 * 10 ** 17, 5 * 10 ** 17);
        }

        yesPrice = (prediction.yesLiquidity * 10 ** 18) / totalLiquidity;
        noPrice = (prediction.noLiquidity * 10 ** 18) / totalLiquidity;
    }

    function getPrediction(
        uint256 _predictionId
    ) external view returns (Prediction memory) {
        return predictions[_predictionId];
    }

    function getPredictionWithPrices(
        uint256 _predictionId
    )
        external
        view
        returns (
            Prediction memory prediction,
            uint256 yesPrice,
            uint256 noPrice
        )
    {
        prediction = predictions[_predictionId];
        (yesPrice, noPrice) = getCurrentPrices(_predictionId);
    }

    function getUserChain(
        address _user
    )
        external
        view
        returns (
            uint256[] memory predictionIds,
            uint256 totalInvested,
            uint256 totalClaimed
        )
    {
        UserChain memory userChain = userChains[_user];
        return (
            userChain.predictionIds,
            userChain.totalInvested,
            userChain.totalClaimed
        );
    }

    function getUserInvestmentsInPrediction(
        address _user,
        uint256 _predictionId
    ) external view returns (Investment[] memory) {
        return userInvestments[_user][_predictionId];
    }

    function getPredictionInvestments(
        uint256 _predictionId
    ) external view returns (Investment[] memory) {
        return predictionInvestments[_predictionId];
    }

    function getTotalLiquidity(
        uint256 _predictionId
    ) external view returns (uint256) {
        Prediction memory prediction = predictions[_predictionId];
        return prediction.yesLiquidity + prediction.noLiquidity;
    }

    function getActivePredictions()
        external
        view
        returns (Prediction[] memory activePredictions)
    {
        uint256 activeCount = 0;

        // First pass: count active predictions
        for (uint256 i = 1; i <= predictionCounter; i++) {
            if (predictions[i].active && !predictions[i].resolved) {
                activeCount++;
            }
        }

        // Initialize array with correct size
        activePredictions = new Prediction[](activeCount);
        uint256 currentIndex = 0;

        // Second pass: populate array with actual Prediction structs
        for (uint256 i = 1; i <= predictionCounter; i++) {
            if (predictions[i].active && !predictions[i].resolved) {
                activePredictions[currentIndex] = predictions[i];
                currentIndex++;
            }
        }
    }

    function getAllPredictions()
        external
        view
        returns (Prediction[] memory allPredictions)
    {
        // Initialize array with the total number of predictions created
        allPredictions = new Prediction[](predictionCounter);

        // Populate array with all predictions (including inactive/resolved ones)
        for (uint256 i = 1; i <= predictionCounter; i++) {
            allPredictions[i - 1] = predictions[i];
        }
    }

    function getUserTotalInvestmentInPrediction(
        address _user,
        uint256 _predictionId
    )
        external
        view
        returns (uint256 totalAmount, uint256 yesAmount, uint256 noAmount)
    {
        Investment[] memory investments = userInvestments[_user][_predictionId];

        for (uint256 i = 0; i < investments.length; i++) {
            totalAmount += investments[i].amount;
            if (investments[i].side) {
                yesAmount += investments[i].amount;
            } else {
                noAmount += investments[i].amount;
            }
        }
    }

    // ============ ADMIN FUNCTIONS ============

    function resolvePrediction(
        uint256 _predictionId,
        bool _outcome
    ) external onlyOwner {
        require(predictions[_predictionId].active, "Prediction not active");
        require(!predictions[_predictionId].resolved, "Already resolved");
        require(
            block.timestamp >= predictions[_predictionId].resolutionDate,
            "Cannot resolve before resolution date"
        );

        predictions[_predictionId].resolved = true;
        predictions[_predictionId].outcome = _outcome;

        emit PredictionResolved(_predictionId, _outcome);
    }
}
