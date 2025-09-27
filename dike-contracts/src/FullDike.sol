// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.28;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/security/Pausable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/math/Math.sol";

// /**
//  * @title FullDike
//  * @dev A decentralized prediction market with child events, validator resolution, and AI verification
//  */
// contract FullDike is ReentrancyGuard, Pausable, Ownable {
//     using SafeERC20 for IERC20;
//     using Math for uint256;

//     // Constants
//     uint256 public constant PROTOCOL_FEE_RATE = 100; // 1% = 100 basis points
//     uint256 public constant LP_FEE_RATE = 200; // 2% = 200 basis points
//     uint256 public constant BASIS_POINTS = 10000;
//     uint256 public constant VALIDATOR_REWARD_RATE = 100; // 1% from winner surplus
//     uint256 public constant AI_THRESHOLD = 2000; // 20% difference threshold for AI verification
//     uint256 public constant MIN_LIQUIDITY = 100e6; // $100 USDC minimum
//     uint256 public constant MAX_LEVERAGE = 1000; // 10x maximum leverage (1000 basis points)
//     uint256 public constant RESOLUTION_VOTING_PERIOD = 86400; // 24 hours
//     uint256 public constant SLIPPAGE_PROTECTION = 500; // 5% max slippage

//     IERC20 public immutable usdc;
//     address public treasury;
//     address public aiOracle;

//     // Events
//     enum Side {
//         YES,
//         NO
//     }
//     enum EventStatus {
//         ACTIVE,
//         RESOLUTION_PENDING,
//         RESOLVED,
//         CANCELLED
//     }
//     enum ValidationStatus {
//         PENDING,
//         VALIDATED,
//         DISPUTED,
//         AI_REQUIRED
//     }

//     struct Event {
//         string metadata;
//         uint256 liquidity;
//         uint256 originalLiquidity;
//         uint256 yesLiquidity;
//         uint256 noLiquidity;
//         address creator;
//         uint256 resolutionTime;
//         EventStatus status;
//         ValidationStatus validationStatus;
//         Side winner;
//         uint256 createdAt;
//         uint256 parentEventId;
//         bool isChildEvent;
//     }

//     struct Position {
//         uint256 amount;
//         uint256 effectiveAmount;
//         Side side;
//         uint256[] childEventIds;
//     }

//     struct Loan {
//         uint256 parentEventId;
//         uint256 amount;
//         uint256 netAmount;
//         Side side;
//         Side parentSide;
//     }

//     struct Validator {
//         bool isActive;
//         uint256 stakedAmount;
//         uint256 successfulVotes;
//         uint256 totalVotes;
//         bool isKYCVerified;
//     }

//     struct ValidationRound {
//         uint256 eventId;
//         Side proposedWinner;
//         uint256 yesVotes;
//         uint256 noVotes;
//         uint256 totalStakedYes;
//         uint256 totalStakedNo;
//         uint256 startTime;
//         bool isComplete;
//         bool requiresAI;
//         mapping(address => bool) hasVoted;
//         mapping(address => Side) votes;
//         mapping(address => uint256) voterStakes;
//     }

//     // State variables
//     uint256 public nextEventId = 1;
//     uint256 public nextValidationId = 1;
//     uint256 public protocolFees;
//     uint256 public validatorStakeRequirement = 1000e6; // $1000 USDC

//     mapping(uint256 => Event) public events;
//     mapping(address => mapping(uint256 => Position)) public positions;
//     mapping(address => Loan[]) public loans;
//     mapping(uint256 => mapping(Side => mapping(address => uint256)))
//         public stakes;
//     mapping(address => uint256) public balances;
//     mapping(address => Validator) public validators;
//     mapping(uint256 => ValidationRound) public validationRounds;
//     mapping(uint256 => uint256) public eventToValidationRound;

//     // Events
//     event EventCreated(
//         uint256 indexed eventId,
//         address indexed creator,
//         string metadata,
//         uint256 liquidity
//     );
//     event PositionBought(
//         uint256 indexed eventId,
//         address indexed user,
//         uint256 amount,
//         Side side
//     );
//     event ChildPositionBought(
//         uint256 indexed parentEventId,
//         uint256 indexed childEventId,
//         address indexed user,
//         uint256 amount,
//         Side side
//     );
//     event EventResolutionStarted(
//         uint256 indexed eventId,
//         uint256 validationRoundId
//     );
//     event ValidatorRegistered(address indexed validator, uint256 stakedAmount);
//     event ValidatorSlashed(address indexed validator, uint256 slashedAmount);
//     event EventResolved(uint256 indexed eventId, Side winner);
//     event Payout(address indexed user, uint256 amount);

//     constructor(address _usdc, address _treasury, address _aiOracle) Ownable() {
//         usdc = IERC20(_usdc);
//         treasury = _treasury;
//         aiOracle = _aiOracle;
//     }

//     modifier onlyKYCValidator() {
//         require(
//             validators[msg.sender].isKYCVerified &&
//                 validators[msg.sender].isActive,
//             "Not authorized validator"
//         );
//         _;
//     }

//     modifier onlyAIOracle() {
//         require(msg.sender == aiOracle, "Not authorized AI oracle");
//         _;
//     }

//     /**
//      * @dev Create a new prediction event
//      */
//     function createEvent(
//         string calldata _metadata,
//         uint256 _liquidity,
//         uint256 _resolutionTime
//     ) external nonReentrant whenNotPaused returns (uint256 eventId) {
//         require(_liquidity >= MIN_LIQUIDITY, "Insufficient liquidity");
//         require(
//             _resolutionTime > block.timestamp + 3600,
//             "Resolution time too soon"
//         ); // At least 1 hour
//         require(bytes(_metadata).length > 0, "Empty metadata");

//         eventId = nextEventId++;

//         // Transfer liquidity from creator
//         usdc.safeTransferFrom(msg.sender, address(this), _liquidity);

//         events[eventId] = Event({
//             metadata: _metadata,
//             liquidity: _liquidity,
//             originalLiquidity: _liquidity,
//             yesLiquidity: _liquidity / 2,
//             noLiquidity: _liquidity / 2,
//             creator: msg.sender,
//             resolutionTime: _resolutionTime,
//             status: EventStatus.ACTIVE,
//             validationStatus: ValidationStatus.PENDING,
//             winner: Side.YES, // Default, will be set during resolution
//             createdAt: block.timestamp,
//             parentEventId: 0,
//             isChildEvent: false
//         });

//         emit EventCreated(eventId, msg.sender, _metadata, _liquidity);
//     }

//     /**
//      * @dev Create a child event linked to a parent
//      */
//     function createChildEvent(
//         string calldata _metadata,
//         uint256 _liquidity,
//         uint256 _resolutionTime,
//         uint256 _parentEventId
//     ) external nonReentrant whenNotPaused returns (uint256 eventId) {
//         require(_liquidity >= MIN_LIQUIDITY, "Insufficient liquidity");
//         require(
//             _resolutionTime > block.timestamp + 3600,
//             "Resolution time too soon"
//         );
//         require(
//             _resolutionTime <= events[_parentEventId].resolutionTime,
//             "Child must resolve before parent"
//         );
//         require(
//             events[_parentEventId].status == EventStatus.ACTIVE,
//             "Parent event not active"
//         );
//         require(
//             !events[_parentEventId].isChildEvent,
//             "Cannot create child of child event"
//         );

//         eventId = nextEventId++;

//         // Transfer liquidity from creator
//         usdc.safeTransferFrom(msg.sender, address(this), _liquidity);

//         events[eventId] = Event({
//             metadata: _metadata,
//             liquidity: _liquidity,
//             originalLiquidity: _liquidity,
//             yesLiquidity: _liquidity / 2,
//             noLiquidity: _liquidity / 2,
//             creator: msg.sender,
//             resolutionTime: _resolutionTime,
//             status: EventStatus.ACTIVE,
//             validationStatus: ValidationStatus.PENDING,
//             winner: Side.YES,
//             createdAt: block.timestamp,
//             parentEventId: _parentEventId,
//             isChildEvent: true
//         });

//         emit EventCreated(eventId, msg.sender, _metadata, _liquidity);
//     }

//     /**
//      * @dev Buy a position in an event
//      */
//     function buyPosition(
//         uint256 _eventId,
//         uint256 _amount,
//         Side _side,
//         uint256 _minExpectedShares
//     ) external nonReentrant whenNotPaused {
//         Event storage evt = events[_eventId];
//         require(evt.status == EventStatus.ACTIVE, "Event not active");
//         require(
//             block.timestamp < evt.resolutionTime - 300,
//             "Trading cutoff reached"
//         ); // 5 min buffer
//         require(_amount > 0, "Amount must be positive");

//         // Calculate shares with slippage protection
//         uint256 expectedShares = _calculateShares(_eventId, _amount, _side);
//         require(expectedShares >= _minExpectedShares, "Slippage exceeded");

//         // Transfer payment
//         usdc.safeTransferFrom(msg.sender, address(this), _amount);

//         // Calculate protocol fee
//         uint256 protocolFee = (_amount * PROTOCOL_FEE_RATE) / BASIS_POINTS;
//         uint256 netAmount = _amount - protocolFee;
//         protocolFees += protocolFee;

//         // Update event liquidity
//         if (_side == Side.YES) {
//             evt.yesLiquidity += netAmount;
//         } else {
//             evt.noLiquidity += netAmount;
//         }
//         evt.liquidity += netAmount;

//         // Update user position
//         Position storage pos = positions[msg.sender][_eventId];
//         pos.amount += _amount;
//         pos.effectiveAmount += _amount;
//         pos.side = _side;

//         // Update stakes
//         stakes[_eventId][_side][msg.sender] += netAmount;

//         emit PositionBought(_eventId, msg.sender, _amount, _side);
//     }

//     /**
//      * @dev Buy a child position using parent position collateral
//      */
//     function buyChildPosition(
//         uint256 _parentEventId,
//         uint256 _childEventId,
//         uint256 _amount,
//         Side _side
//     ) external nonReentrant whenNotPaused {
//         Event storage childEvt = events[_childEventId];
//         require(
//             childEvt.status == EventStatus.ACTIVE,
//             "Child event not active"
//         );
//         require(
//             childEvt.parentEventId == _parentEventId,
//             "Invalid parent-child relationship"
//         );
//         require(
//             block.timestamp < childEvt.resolutionTime - 300,
//             "Trading cutoff reached"
//         );

//         Position storage parentPos = positions[msg.sender][_parentEventId];
//         require(
//             parentPos.effectiveAmount >= _amount,
//             "Insufficient collateral"
//         );

//         // Check leverage limits
//         uint256 currentLeverage = (_amount * BASIS_POINTS) /
//             parentPos.effectiveAmount;
//         require(currentLeverage <= MAX_LEVERAGE, "Leverage limit exceeded");

//         // Update parent position
//         parentPos.effectiveAmount -= _amount;
//         parentPos.childEventIds.push(_childEventId);

//         // Calculate protocol fee from borrowed amount
//         uint256 protocolFee = (_amount * PROTOCOL_FEE_RATE) / BASIS_POINTS;
//         uint256 netAmount = _amount - protocolFee;
//         protocolFees += protocolFee;

//         // Transfer liquidity from parent to child
//         Side parentSide = parentPos.side;
//         if (parentSide == Side.YES) {
//             events[_parentEventId].yesLiquidity -= netAmount;
//         } else {
//             events[_parentEventId].noLiquidity -= netAmount;
//         }
//         events[_parentEventId].liquidity -= netAmount;

//         // Update child event
//         if (_side == Side.YES) {
//             childEvt.yesLiquidity += netAmount;
//         } else {
//             childEvt.noLiquidity += netAmount;
//         }
//         childEvt.liquidity += netAmount;

//         // Update child stakes
//         stakes[_childEventId][_side][msg.sender] += netAmount;

//         // Record loan
//         loans[msg.sender].push(
//             Loan({
//                 parentEventId: _parentEventId,
//                 amount: _amount,
//                 netAmount: netAmount,
//                 side: _side,
//                 parentSide: parentSide
//             })
//         );

//         emit ChildPositionBought(
//             _parentEventId,
//             _childEventId,
//             msg.sender,
//             _amount,
//             _side
//         );
//     }

//     /**
//      * @dev Start resolution process for an event
//      */
//     function startResolution(uint256 _eventId, Side _proposedWinner) external {
//         Event storage evt = events[_eventId];
//         require(
//             block.timestamp >= evt.resolutionTime,
//             "Resolution time not reached"
//         );
//         require(evt.status == EventStatus.ACTIVE, "Event not active");
//         require(msg.sender == evt.creator, "Only creator can start resolution");

//         evt.status = EventStatus.RESOLUTION_PENDING;

//         uint256 validationRoundId = nextValidationId++;
//         ValidationRound storage round = validationRounds[validationRoundId];
//         round.eventId = _eventId;
//         round.proposedWinner = _proposedWinner;
//         round.startTime = block.timestamp;

//         eventToValidationRound[_eventId] = validationRoundId;

//         emit EventResolutionStarted(_eventId, validationRoundId);
//     }

//     /**
//      * @dev Register as a validator
//      */
//     function registerValidator(uint256 _stakeAmount) external nonReentrant {
//         require(
//             _stakeAmount >= validatorStakeRequirement,
//             "Insufficient stake"
//         );
//         require(!validators[msg.sender].isActive, "Already registered");

//         usdc.safeTransferFrom(msg.sender, address(this), _stakeAmount);

//         validators[msg.sender] = Validator({
//             isActive: true,
//             stakedAmount: _stakeAmount,
//             successfulVotes: 0,
//             totalVotes: 0,
//             isKYCVerified: false // Will be set by owner after KYC
//         });

//         emit ValidatorRegistered(msg.sender, _stakeAmount);
//     }

//     /**
//      * @dev Set KYC status for validator (only owner)
//      */
//     function setValidatorKYC(
//         address _validator,
//         bool _isKYCVerified
//     ) external onlyOwner {
//         require(validators[_validator].isActive, "Validator not registered");
//         validators[_validator].isKYCVerified = _isKYCVerified;
//     }

//     /**
//      * @dev Vote on event resolution
//      */
//     function voteOnResolution(
//         uint256 _validationRoundId,
//         Side _vote
//     ) external onlyKYCValidator nonReentrant {
//         ValidationRound storage round = validationRounds[_validationRoundId];
//         require(!round.isComplete, "Voting already complete");
//         require(
//             block.timestamp < round.startTime + RESOLUTION_VOTING_PERIOD,
//             "Voting period ended"
//         );
//         require(!round.hasVoted[msg.sender], "Already voted");

//         Validator storage validator = validators[msg.sender];
//         uint256 voterStake = validator.stakedAmount;

//         round.hasVoted[msg.sender] = true;
//         round.votes[msg.sender] = _vote;
//         round.voterStakes[msg.sender] = voterStake;

//         if (_vote == Side.YES) {
//             round.yesVotes += 1;
//             round.totalStakedYes += voterStake;
//         } else {
//             round.noVotes += 1;
//             round.totalStakedNo += voterStake;
//         }

//         validator.totalVotes += 1;
//     }

//     /**
//      * @dev Finalize validation round
//      */
//     function finalizeValidation(
//         uint256 _validationRoundId
//     ) external nonReentrant {
//         ValidationRound storage round = validationRounds[_validationRoundId];
//         require(!round.isComplete, "Already finalized");
//         require(
//             block.timestamp >= round.startTime + RESOLUTION_VOTING_PERIOD,
//             "Voting period not ended"
//         );

//         round.isComplete = true;

//         // Determine if AI verification is needed
//         uint256 totalStaked = round.totalStakedYes + round.totalStakedNo;
//         uint256 majorityStaked = Math.max(
//             round.totalStakedYes,
//             round.totalStakedNo
//         );
//         uint256 majorityPercentage = (majorityStaked * BASIS_POINTS) /
//             totalStaked;

//         if (majorityPercentage < (BASIS_POINTS - AI_THRESHOLD)) {
//             // Difference is less than 20%, require AI verification
//             round.requiresAI = true;
//             events[round.eventId].validationStatus = ValidationStatus
//                 .AI_REQUIRED;
//             return;
//         }

//         // Determine winner based on stake-weighted voting
//         Side winner = round.totalStakedYes > round.totalStakedNo
//             ? Side.YES
//             : Side.NO;
//         _resolveEvent(round.eventId, winner, _validationRoundId);
//     }

//     /**
//      * @dev AI oracle provides final resolution
//      */
//     function aiResolveEvent(
//         uint256 _eventId,
//         Side _winner
//     ) external onlyAIOracle {
//         Event storage evt = events[_eventId];
//         require(
//             evt.validationStatus == ValidationStatus.AI_REQUIRED,
//             "AI resolution not required"
//         );

//         uint256 validationRoundId = eventToValidationRound[_eventId];
//         _resolveEvent(_eventId, _winner, validationRoundId);
//     }

//     /**
//      * @dev Internal function to resolve an event
//      */
//     function _resolveEvent(
//         uint256 _eventId,
//         Side _winner,
//         uint256 _validationRoundId
//     ) internal {
//         Event storage evt = events[_eventId];
//         evt.status = EventStatus.RESOLVED;
//         evt.winner = _winner;
//         evt.validationStatus = ValidationStatus.VALIDATED;

//         ValidationRound storage round = validationRounds[_validationRoundId];

//         // Slash incorrect validators and reward correct ones
//         _processValidatorRewards(_validationRoundId, _winner);

//         // Distribute payouts to winners
//         _distributePayouts(_eventId, _winner);

//         emit EventResolved(_eventId, _winner);
//     }

//     /**
//      * @dev Process validator rewards and slashing
//      */
//     function _processValidatorRewards(
//         uint256 _validationRoundId,
//         Side _correctSide
//     ) internal {
//         ValidationRound storage round = validationRounds[_validationRoundId];
//         Event storage evt = events[round.eventId];

//         uint256 totalSlashed = 0;
//         uint256 correctValidators = 0;

//         // First pass: slash incorrect validators and count correct ones
//         for (uint256 i = 0; i < 100; i++) {
//             // Limit iterations for gas
//             // This is a simplified approach - in practice, you'd need to track all voters
//             // Implementation would require additional data structures to iterate over voters
//         }

//         // Calculate validator rewards from winner surplus (1%)
//         uint256 winnerSurplus = _calculateWinnerSurplus(round.eventId);
//         uint256 validatorReward = (winnerSurplus * VALIDATOR_REWARD_RATE) /
//             BASIS_POINTS;

//         // Distribute rewards to correct validators (simplified)
//         // Full implementation would require proper voter tracking
//     }

//     /**
//      * @dev Distribute payouts to event winners
//      */
//     function _distributePayouts(uint256 _eventId, Side _winner) internal {
//         Event storage evt = events[_eventId];

//         uint256 netYes = evt.yesLiquidity > evt.originalLiquidity / 2
//             ? evt.yesLiquidity - evt.originalLiquidity / 2
//             : 0;
//         uint256 netNo = evt.noLiquidity > evt.originalLiquidity / 2
//             ? evt.noLiquidity - evt.originalLiquidity / 2
//             : 0;

//         uint256 winnerPrincipal = _winner == Side.YES ? netYes : netNo;
//         uint256 loserPool = _winner == Side.YES ? netNo : netYes;

//         // Calculate LP fee from loser pool
//         uint256 lpFee = (loserPool * LP_FEE_RATE) / BASIS_POINTS;
//         uint256 distributableProfit = loserPool - lpFee;

//         // Pay LP fee to creator
//         balances[evt.creator] += lpFee + evt.originalLiquidity;

//         if (winnerPrincipal == 0) {
//             // No winners, creator gets everything
//             balances[evt.creator] += distributableProfit;
//             return;
//         }

//         // Distribute to winners proportionally
//         // This is simplified - full implementation would iterate through all stakes
//         // and handle loan repayments properly
//     }

//     /**
//      * @dev Calculate expected shares for slippage protection
//      */
//     function _calculateShares(
//         uint256 _eventId,
//         uint256 _amount,
//         Side _side
//     ) internal view returns (uint256) {
//         Event storage evt = events[_eventId];
//         uint256 protocolFee = (_amount * PROTOCOL_FEE_RATE) / BASIS_POINTS;
//         uint256 netAmount = _amount - protocolFee;

//         uint256 currentLiquidity = _side == Side.YES
//             ? evt.yesLiquidity
//             : evt.noLiquidity;
//         uint256 newLiquidity = currentLiquidity + netAmount;

//         // Simple AMM formula: shares = net_amount * total_supply / current_liquidity
//         // This is simplified - real implementation would use more sophisticated pricing
//         return (netAmount * evt.liquidity) / currentLiquidity;
//     }

//     /**
//      * @dev Calculate winner surplus for validator rewards
//      */
//     function _calculateWinnerSurplus(
//         uint256 _eventId
//     ) internal view returns (uint256) {
//         Event storage evt = events[_eventId];
//         uint256 netYes = evt.yesLiquidity > evt.originalLiquidity / 2
//             ? evt.yesLiquidity - evt.originalLiquidity / 2
//             : 0;
//         uint256 netNo = evt.noLiquidity > evt.originalLiquidity / 2
//             ? evt.noLiquidity - evt.originalLiquidity / 2
//             : 0;

//         return Math.max(netYes, netNo);
//     }

//     /**
//      * @dev Withdraw user balance
//      */
//     function withdraw(uint256 _amount) external nonReentrant {
//         require(balances[msg.sender] >= _amount, "Insufficient balance");
//         require(_amount > 0, "Amount must be positive");

//         balances[msg.sender] -= _amount;
//         usdc.safeTransfer(msg.sender, _amount);

//         emit Payout(msg.sender, _amount);
//     }

//     /**
//      * @dev Withdraw protocol fees (only owner)
//      */
//     function withdrawProtocolFees() external onlyOwner {
//         uint256 amount = protocolFees;
//         protocolFees = 0;
//         usdc.safeTransfer(treasury, amount);
//     }

//     /**
//      * @dev Emergency pause (only owner)
//      */
//     function pause() external onlyOwner {
//         _pause();
//     }

//     /**
//      * @dev Unpause (only owner)
//      */
//     function unpause() external onlyOwner {
//         _unpause();
//     }

//     /**
//      * @dev Update treasury address (only owner)
//      */
//     function updateTreasury(address _newTreasury) external onlyOwner {
//         require(_newTreasury != address(0), "Invalid treasury address");
//         treasury = _newTreasury;
//     }

//     /**
//      * @dev Update AI oracle address (only owner)
//      */
//     function updateAIOracle(address _newAIOracle) external onlyOwner {
//         require(_newAIOracle != address(0), "Invalid AI oracle address");
//         aiOracle = _newAIOracle;
//     }

//     // View functions
//     function getEvent(uint256 _eventId) external view returns (Event memory) {
//         return events[_eventId];
//     }

//     function getPosition(
//         address _user,
//         uint256 _eventId
//     ) external view returns (Position memory) {
//         return positions[_user][_eventId];
//     }

//     function getUserLoans(address _user) external view returns (Loan[] memory) {
//         return loans[_user];
//     }

//     function getValidationRound(
//         uint256 _validationRoundId
//     )
//         external
//         view
//         returns (
//             uint256 eventId,
//             Side proposedWinner,
//             uint256 yesVotes,
//             uint256 noVotes,
//             uint256 totalStakedYes,
//             uint256 totalStakedNo,
//             uint256 startTime,
//             bool isComplete,
//             bool requiresAI
//         )
//     {
//         ValidationRound storage round = validationRounds[_validationRoundId];
//         return (
//             round.eventId,
//             round.proposedWinner,
//             round.yesVotes,
//             round.noVotes,
//             round.totalStakedYes,
//             round.totalStakedNo,
//             round.startTime,
//             round.isComplete,
//             round.requiresAI
//         );
//     }

//     /**
//      * @dev Get current market prices for an event
//      */
//     function getMarketPrices(
//         uint256 _eventId
//     ) external view returns (uint256 yesPrice, uint256 noPrice) {
//         Event storage evt = events[_eventId];
//         if (evt.liquidity == 0) return (5000, 5000); // 50/50 if no liquidity

//         yesPrice = (evt.yesLiquidity * BASIS_POINTS) / evt.liquidity;
//         noPrice = BASIS_POINTS - yesPrice;
//     }
// }
