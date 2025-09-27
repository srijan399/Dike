// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.28;

// import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
// import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/math/Math.sol";

// /// @title Swap (price reader stub)
// /// @notice Minimal contract that exposes the latest ETH/USD price via Pyth
// contract Swap is Ownable, ReentrancyGuard {
//     IPyth public immutable pyth;
//     IERC20 public immutable pyUSD;
//     uint8 public immutable pyusdDecimals;

//     // ETH/USD price feed id (Stable) from Pyth docs
//     // https://docs.pyth.network/price-feeds/price-feeds
//     // Mainnet/Sepolia stable feed id for ETH/USD:
//     bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;

//     // Liquidity managers approved by owner to add liquidity
//     mapping(address => bool) public isLiquidityManager;

//     event LiquidityManagerUpdated(address indexed account, bool approved);
//     event LiquidityAdded(address indexed manager, uint256 ethAmount, uint256 pyusdAmount);
//     event SwapPyUsdForEth(address indexed user, uint256 pyusdIn, uint256 ethOut, address indexed to);
//     event SwapEthForPyUsd(address indexed user, uint256 ethIn, uint256 pyusdOut, address indexed to);

//     /// @param pythContract The address of the Pyth price feeds contract on the target network
//     /// @param pyUsdToken The PYUSD ERC20 token address
//     constructor(address pythContract, address pyUsdToken) {
//         pyth = IPyth(pythContract);
//         pyUSD = IERC20(pyUsdToken);
//         pyusdDecimals = IERC20Metadata(pyUsdToken).decimals();
//         isLiquidityManager[msg.sender] = true;
//     }

//     /// @notice Reads the current ETH/USD price directly from Pyth without updating
//     /// @dev Uses getPriceUnsafe to avoid requiring Hermes update data or fees
//     /// @return price The current ETH/USD price
//     /// @return conf Confidence interval
//     /// @return expo Price exponent (typically negative). Actual price is price * 10**expo
//     function getEthUsd() external view returns (int64 price, uint64 conf, int32 expo) {
//         PythStructs.Price memory p = pyth.getPriceUnsafe(ETH_USD_PRICE_ID);
//         return (p.price, p.conf, p.expo);
//     }

//     // --------- Admin ---------
//     function setLiquidityManager(address account, bool approved) external onlyOwner {
//         isLiquidityManager[account] = approved;
//         emit LiquidityManagerUpdated(account, approved);
//     }

//     // --------- Liquidity ---------
//     function addLiquidityEth() external payable nonReentrant {
//         require(isLiquidityManager[msg.sender], "Not authorized");
//         require(msg.value > 0, "No ETH");
//         emit LiquidityAdded(msg.sender, msg.value, 0);
//     }

//     function addLiquidityPyUsd(uint256 amount) external nonReentrant {
//         require(isLiquidityManager[msg.sender], "Not authorized");
//         require(amount > 0, "No PYUSD");
//         require(pyUSD.transferFrom(msg.sender, address(this), amount), "Transfer failed");
//         emit LiquidityAdded(msg.sender, 0, amount);
//     }

//     function getReserves() public view returns (uint256 ethReserveWei, uint256 pyusdReserve) {
//         ethReserveWei = address(this).balance;
//         pyusdReserve = pyUSD.balanceOf(address(this));
//     }

//     // --------- Swaps ---------
//     function swapPyUsdForEth(uint256 amountPyUsd, uint256 minEthOut, address payable to) external nonReentrant returns (uint256 ethOutWei) {
//         require(amountPyUsd > 0, "amount=0");
//         (uint256 priceMantissa, uint32 expoAbs) = _getEthUsdPrice();

//         // Calculate ETH out using oracle price
//         // ethOutWei = amountPyUsd * 1e18 * 10^expoAbs / (10^pyusdDecimals * priceMantissa)
//         uint256 scaledUsd = Math.mulDiv(amountPyUsd, 10 ** 18, 10 ** pyusdDecimals);
//         ethOutWei = Math.mulDiv(scaledUsd, 10 ** expoAbs, priceMantissa);

//         require(ethOutWei >= minEthOut, "slippage");

//         // Pull PYUSD from user
//         require(pyUSD.transferFrom(msg.sender, address(this), amountPyUsd), "PYUSD in fail");

//         // Check ETH liquidity and send
//         require(address(this).balance >= ethOutWei, "insufficient ETH liq");
//         (bool ok, ) = to.call{value: ethOutWei}("");
//         require(ok, "ETH out fail");

//         emit SwapPyUsdForEth(msg.sender, amountPyUsd, ethOutWei, to);
//     }

//     function swapEthForPyUsd(uint256 minPyUsdOut, address to) external payable nonReentrant returns (uint256 pyOut) {
//         uint256 ethInWei = msg.value;
//         require(ethInWei > 0, "amount=0");
//         (uint256 priceMantissa, uint32 expoAbs) = _getEthUsdPrice();

//         // pyOut = ethInWei * priceMantissa * 10^pyusdDecimals / (10^expoAbs * 1e18)
//         uint256 usdNumerator = Math.mulDiv(ethInWei, priceMantissa, 10 ** expoAbs);
//         pyOut = Math.mulDiv(usdNumerator, 10 ** pyusdDecimals, 10 ** 18);

//         require(pyOut >= minPyUsdOut, "slippage");
//         require(pyUSD.balanceOf(address(this)) >= pyOut, "insufficient PYUSD liq");
//         require(pyUSD.transfer(to, pyOut), "PYUSD out fail");

//         emit SwapEthForPyUsd(msg.sender, ethInWei, pyOut, to);
//     }

//     // --------- Internals ---------
//     function _getEthUsdPrice() internal view returns (uint256 mantissa, uint32 expoAbs) {
//         PythStructs.Price memory p = pyth.getPriceUnsafe(ETH_USD_PRICE_ID);
//         require(p.price > 0, "bad price");
//         require(p.expo <= 0, "expo>0");
//         mantissa = uint256(int256(p.price));
//         expoAbs = uint32(uint256(int256(-p.expo)));
//     }
// }


