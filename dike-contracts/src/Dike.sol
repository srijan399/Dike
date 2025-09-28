// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiversePrediction is ReentrancyGuard, Ownable {
    IERC20 public immutable pyUSD;

    uint256 public predictionCounter;
    uint256 public constant MINIMUM_LIQUIDITY = 10 * 10 ** 6;
    uint256 public constant COLLATERAL_RATIO = 60;

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
        bool isCollateralBased; // true if investment was made using collateral
        uint256 parentPredictionId; // parent prediction if using collateral
    }

    struct UserChain {
        uint256[] predictionIds;
        uint256 totalInvested;
        uint256 totalClaimed;
    }

    struct CollateralPosition {
        uint256 parentPredictionId;
        uint256 totalCollateralUsed;
        uint256[] childPredictionIds;
        bool liquidated;
    }

    // Chain visualization helper struct
    struct ChainView {
        address user;
        uint256 parentPredictionId;
        uint256[] childPredictionIds;
        uint256 totalCollateralUsed;
        bool liquidated;
    }

    // Mappings
    mapping(uint256 => Prediction) public predictions;
    mapping(address => UserChain) public userChains;
    mapping(uint256 => Investment[]) public predictionInvestments;
    mapping(address => mapping(uint256 => Investment[])) public userInvestments; // user => predictionId => investments
    mapping(address => mapping(uint256 => CollateralPosition))
        public userCollateralPositions; // user => parentPredictionId => position
    mapping(address => uint256[]) public userParentPredictions; // track which predictions have collateral positions
    mapping(uint256 => address[]) public parentIdToUsers; // parent prediction => users who created chains from this parent

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

    event ChainExtended(
        uint256 indexed parentPredictionId,
        uint256 indexed childPredictionId,
        address indexed investor,
        uint256 collateralAmount
    );

    event PositionLiquidated(
        uint256 indexed parentPredictionId,
        address indexed user,
        uint256[] childPredictionIds,
        uint256 totalCollateralUsed
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

    // start of chain
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

        (uint256 yesPrice, uint256 noPrice) = getCurrentPrices(_predictionId);

        uint256 expectedVotes = _side
            ? (_amount * 10 ** 18) / yesPrice
            : (_amount * 10 ** 18) / noPrice;

        require(
            expectedVotes >= _minExpectedVotes,
            "Slippage tolerance exceeded"
        );

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
            claimed: false,
            isCollateralBased: false,
            parentPredictionId: 0
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

    function extendChain(
        uint256 _parentPredictionId,
        uint256 _childPredictionId,
        uint256 _collateralAmount,
        bool _side,
        uint256 _minExpectedVotes
    ) external nonReentrant {
        require(
            predictions[_parentPredictionId].active,
            "Parent prediction not active"
        );
        require(
            predictions[_childPredictionId].active,
            "Child prediction not active"
        );
        require(
            !predictions[_childPredictionId].resolved,
            "Child prediction resolved"
        );
        require(
            block.timestamp < predictions[_childPredictionId].resolutionDate,
            "Child prediction expired"
        );
        require(
            _collateralAmount > 0,
            "Collateral amount must be greater than 0"
        );
        require(
            _parentPredictionId != _childPredictionId,
            "Cannot extend to same prediction"
        );

        // Check available collateral
        uint256 availableCollateral = getAvailableCollateral(
            msg.sender,
            _parentPredictionId
        );
        require(
            availableCollateral >= _collateralAmount,
            "Insufficient collateral available"
        );

        // Check liquidation status
        require(
            !isPositionLiquidatable(msg.sender, _parentPredictionId),
            "Position is liquidatable"
        );

        Prediction storage childPrediction = predictions[_childPredictionId];

        // Calculate current prices for slippage protection
        (uint256 yesPrice, uint256 noPrice) = getCurrentPrices(
            _childPredictionId
        );

        // Calculate expected votes
        uint256 expectedVotes = _side
            ? (_collateralAmount) / yesPrice
            : (_collateralAmount) / noPrice;

        require(
            expectedVotes >= _minExpectedVotes,
            "Slippage tolerance exceeded"
        );

        // Update child prediction liquidity (virtual collateral)
        if (_side) {
            childPrediction.yesLiquidity += _collateralAmount;
        } else {
            childPrediction.noLiquidity += _collateralAmount;
        }

        // Create investment record
        Investment memory newInvestment = Investment({
            predictionId: _childPredictionId,
            investor: msg.sender,
            amount: _collateralAmount,
            side: _side,
            expectedVotes: expectedVotes,
            timestamp: block.timestamp,
            claimed: false,
            isCollateralBased: true,
            parentPredictionId: _parentPredictionId
        });

        // Store investment
        predictionInvestments[_childPredictionId].push(newInvestment);
        userInvestments[msg.sender][_childPredictionId].push(newInvestment);

        // Update collateral position
        CollateralPosition storage position = userCollateralPositions[
            msg.sender
        ][_parentPredictionId];

        // Initialize position if first time
        if (position.parentPredictionId == 0) {
            position.parentPredictionId = _parentPredictionId;
            userParentPredictions[msg.sender].push(_parentPredictionId);
            parentIdToUsers[_parentPredictionId].push(msg.sender);
        }

        position.totalCollateralUsed += _collateralAmount;
        position.childPredictionIds.push(_childPredictionId);

        // Update user chain
        UserChain storage userChain = userChains[msg.sender];
        bool foundInChain = false;
        for (uint256 i = 0; i < userChain.predictionIds.length; i++) {
            if (userChain.predictionIds[i] == _childPredictionId) {
                foundInChain = true;
                break;
            }
        }

        if (!foundInChain) {
            userChain.predictionIds.push(_childPredictionId);
        }

        userChain.totalInvested += _collateralAmount;

        emit InvestmentMade(
            _childPredictionId,
            msg.sender,
            _collateralAmount,
            _side,
            yesPrice,
            noPrice
        );
        emit ChainExtended(
            _parentPredictionId,
            _childPredictionId,
            msg.sender,
            _collateralAmount
        );
    }

    // // ============ LIQUIDATION SYSTEM ============

    function liquidatePosition(
        address _user,
        uint256 _parentPredictionId
    ) external {
        require(
            isPositionLiquidatable(_user, _parentPredictionId),
            "Position not liquidatable"
        );

        CollateralPosition storage position = userCollateralPositions[_user][
            _parentPredictionId
        ];
        require(!position.liquidated, "Position already liquidated");

        // Mark position as liquidated
        position.liquidated = true;

        // Close all child positions (mark as liquidated in practice)
        uint256[] memory childIds = position.childPredictionIds;

        emit PositionLiquidated(
            _parentPredictionId,
            _user,
            childIds,
            position.totalCollateralUsed
        );
    }

    function isPositionLiquidatable(
        address _user,
        uint256 _parentPredictionId
    ) public view returns (bool) {
        CollateralPosition memory position = userCollateralPositions[_user][
            _parentPredictionId
        ];

        if (position.parentPredictionId == 0 || position.liquidated) {
            return false;
        }

        uint256 currentPositionValue = getCurrentPositionValue(
            _user,
            _parentPredictionId
        );
        return currentPositionValue < position.totalCollateralUsed;
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

    function getCurrentPositionValue(
        address _user,
        uint256 _predictionId
    ) public view returns (uint256) {
        Investment[] memory investments = userInvestments[_user][_predictionId];
        uint256 totalValue = 0;

        (uint256 yesPrice, uint256 noPrice) = getCurrentPrices(_predictionId);

        for (uint256 i = 0; i < investments.length; i++) {
            if (!investments[i].isCollateralBased) {
                uint256 currentPrice = investments[i].side ? yesPrice : noPrice;
                uint256 positionValue = (investments[i].amount * currentPrice) /
                    (10 ** 18);
                totalValue += positionValue;
            }
        }

        return totalValue;
    }

    function getAvailableCollateral(
        address _user,
        uint256 _parentPredictionId
    ) public view returns (uint256) {
        uint256 totalInvestment = getUserTotalInvestmentAmount(
            _user,
            _parentPredictionId
        );
        uint256 maxCollateral = (totalInvestment * COLLATERAL_RATIO) / 100;

        CollateralPosition memory position = userCollateralPositions[_user][
            _parentPredictionId
        ];
        uint256 usedCollateral = position.totalCollateralUsed;

        if (maxCollateral > usedCollateral) {
            return maxCollateral - usedCollateral;
        }
        return 0;
    }

    function getUserTotalInvestmentAmount(
        address _user,
        uint256 _predictionId
    ) public view returns (uint256) {
        Investment[] memory investments = userInvestments[_user][_predictionId];
        uint256 total = 0;

        for (uint256 i = 0; i < investments.length; i++) {
            if (!investments[i].isCollateralBased) {
                total += investments[i].amount;
            }
        }

        return total;
    }

    function getUserCollateralPosition(
        address _user,
        uint256 _parentPredictionId
    )
        external
        view
        returns (
            uint256 parentId,
            uint256 totalUsed,
            uint256[] memory childIds,
            bool liquidated,
            uint256 availableCollateral,
            uint256 positionValue
        )
    {
        CollateralPosition memory position = userCollateralPositions[_user][
            _parentPredictionId
        ];
        return (
            position.parentPredictionId,
            position.totalCollateralUsed,
            position.childPredictionIds,
            position.liquidated,
            getAvailableCollateral(_user, _parentPredictionId),
            getCurrentPositionValue(_user, _parentPredictionId)
        );
    }

    function getUserParentPredictionIds(
        address _user
    ) external view returns (uint256[] memory) {
        return userParentPredictions[_user];
    }

    function getUserChains(
        address _user
    ) external view returns (ChainView[] memory chains) {
        uint256[] memory parentIds = userParentPredictions[_user];
        chains = new ChainView[](parentIds.length);
        for (uint256 i = 0; i < parentIds.length; i++) {
            CollateralPosition memory pos = userCollateralPositions[_user][
                parentIds[i]
            ];
            chains[i] = ChainView({
                user: _user,
                parentPredictionId: parentIds[i],
                childPredictionIds: pos.childPredictionIds,
                totalCollateralUsed: pos.totalCollateralUsed,
                liquidated: pos.liquidated
            });
        }
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

    function getChainsByParent(
        uint256 _parentPredictionId
    ) external view returns (ChainView[] memory chains) {
        address[] memory users = parentIdToUsers[_parentPredictionId];
        chains = new ChainView[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            CollateralPosition memory pos = userCollateralPositions[users[i]][
                _parentPredictionId
            ];
            chains[i] = ChainView({
                user: users[i],
                parentPredictionId: _parentPredictionId,
                childPredictionIds: pos.childPredictionIds,
                totalCollateralUsed: pos.totalCollateralUsed,
                liquidated: pos.liquidated
            });
        }
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

        for (uint256 i = 1; i <= predictionCounter; i++) {
            if (predictions[i].active && !predictions[i].resolved) {
                activeCount++;
            }
        }

        activePredictions = new Prediction[](activeCount);
        uint256 currentIndex = 0;

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
        allPredictions = new Prediction[](predictionCounter);

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

    function getMyTotalInvestmentInPrediction(
        uint256 _predictionId
    )
        external
        view
        returns (uint256 totalAmount, uint256 yesAmount, uint256 noAmount)
    {
        (totalAmount, yesAmount, noAmount) = this
            .getUserTotalInvestmentInPrediction(msg.sender, _predictionId);
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
