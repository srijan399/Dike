// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/// @title Chainlink AggregatorV3Interface
/// @notice Standard interface for Chainlink price feeds
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/// @title Swap
/// @notice Oracle-priced swap contract for BNB/USDC on BNB Chain using Chainlink
contract Swap is Ownable, ReentrancyGuard {
    AggregatorV3Interface public immutable priceFeed;
    IERC20 public immutable usdc;
    uint8 public immutable usdcDecimals;

    // Maximum price staleness: 24 hours
    uint256 public constant MAX_PRICE_AGE = 24 hours;

    // Liquidity managers approved by owner to add liquidity
    mapping(address => bool) public isLiquidityManager;

    event LiquidityManagerUpdated(address indexed account, bool approved);
    event LiquidityAdded(address indexed manager, uint256 bnbAmount, uint256 usdcAmount);
    event SwapUsdcForBnb(address indexed user, uint256 usdcIn, uint256 bnbOut, address indexed to);
    event SwapBnbForUsdc(address indexed user, uint256 bnbIn, uint256 usdcOut, address indexed to);

    /// @param chainlinkPriceFeed The address of the Chainlink BNB/USD price feed
    /// @param usdcToken The USDC ERC20 token address
    constructor(address chainlinkPriceFeed, address usdcToken) {
        require(chainlinkPriceFeed != address(0), "Invalid price feed");
        require(usdcToken != address(0), "Invalid USDC token");
        priceFeed = AggregatorV3Interface(chainlinkPriceFeed);
        usdc = IERC20(usdcToken);
        usdcDecimals = IERC20Metadata(usdcToken).decimals();
        isLiquidityManager[msg.sender] = true;
    }

    /// @notice Reads the current BNB/USD price from Chainlink
    /// @return price The current BNB/USD price (with 8 decimals)
    /// @return updatedAt The timestamp when the price was last updated
    function getBnbUsd() external view returns (int256 price, uint256 updatedAt) {
        (, int256 answer, , uint256 updatedTimestamp, ) = priceFeed.latestRoundData();
        require(answer > 0, "Invalid price");
        require(updatedTimestamp > 0, "Price not available");
        require(block.timestamp - updatedTimestamp <= MAX_PRICE_AGE, "Price too stale");
        return (answer, updatedTimestamp);
    }

    // --------- Admin ---------
    function setLiquidityManager(address account, bool approved) external onlyOwner {
        isLiquidityManager[account] = approved;
        emit LiquidityManagerUpdated(account, approved);
    }

    // --------- Liquidity ---------
    function addLiquidityBnb() external payable nonReentrant {
        require(isLiquidityManager[msg.sender], "Not authorized");
        require(msg.value > 0, "No BNB");
        emit LiquidityAdded(msg.sender, msg.value, 0);
    }

    function addLiquidityUsdc(uint256 amount) external nonReentrant {
        require(isLiquidityManager[msg.sender], "Not authorized");
        require(amount > 0, "No USDC");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit LiquidityAdded(msg.sender, 0, amount);
    }

    function getReserves() public view returns (uint256 bnbReserveWei, uint256 usdcReserve) {
        bnbReserveWei = address(this).balance;
        usdcReserve = usdc.balanceOf(address(this));
    }

    // --------- Swaps ---------
    function swapUsdcForBnb(uint256 amountUsdc, uint256 minBnbOut, address payable to) external nonReentrant returns (uint256 bnbOutWei) {
        require(amountUsdc > 0, "amount=0");
        uint256 price = _getBnbUsdPrice();

        // Calculate BNB out using oracle price
        // Chainlink price has 8 decimals, USDC has 6 decimals, BNB has 18 decimals
        // bnbOutWei = (amountUsdc * 1e18 * 1e8) / (1e6 * price)
        // Simplified: bnbOutWei = (amountUsdc * 1e20) / (price)
        uint256 scaledUsdc = Math.mulDiv(amountUsdc, 10 ** 18, 10 ** usdcDecimals);
        bnbOutWei = Math.mulDiv(scaledUsdc, 10 ** 8, price);

        require(bnbOutWei >= minBnbOut, "slippage");

        // Pull USDC from user
        require(usdc.transferFrom(msg.sender, address(this), amountUsdc), "USDC in fail");

        // Check BNB liquidity and send
        require(address(this).balance >= bnbOutWei, "insufficient BNB liq");
        (bool ok, ) = to.call{value: bnbOutWei}("");
        require(ok, "BNB out fail");

        emit SwapUsdcForBnb(msg.sender, amountUsdc, bnbOutWei, to);
    }

    function swapBnbForUsdc(uint256 minUsdcOut, address to) external payable nonReentrant returns (uint256 usdcOut) {
        uint256 bnbInWei = msg.value;
        require(bnbInWei > 0, "amount=0");
        uint256 price = _getBnbUsdPrice();

        // Calculate USDC out using oracle price
        // Chainlink price has 8 decimals, USDC has 6 decimals, BNB has 18 decimals
        // usdcOut = (bnbInWei * price * 1e6) / (1e8 * 1e18)
        // Simplified: usdcOut = (bnbInWei * price) / (1e20)
        uint256 usdValue = Math.mulDiv(bnbInWei, price, 10 ** 8);
        usdcOut = Math.mulDiv(usdValue, 10 ** usdcDecimals, 10 ** 18);

        require(usdcOut >= minUsdcOut, "slippage");
        require(usdc.balanceOf(address(this)) >= usdcOut, "insufficient USDC liq");
        require(usdc.transfer(to, usdcOut), "USDC out fail");

        emit SwapBnbForUsdc(msg.sender, bnbInWei, usdcOut, to);
    }

    // --------- Internals ---------
    function _getBnbUsdPrice() internal view returns (uint256) {
        (, int256 answer, , uint256 updatedTimestamp, ) = priceFeed.latestRoundData();
        require(answer > 0, "Invalid price");
        require(updatedTimestamp > 0, "Price not available");
        require(block.timestamp - updatedTimestamp <= MAX_PRICE_AGE, "Price too stale");
        return uint256(answer);
    }
}


