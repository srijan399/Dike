// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Swap} from "../src/Swap.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Mock Chainlink AggregatorV3Interface
contract MockChainlinkAggregator {
    int256 public price;
    uint256 public updatedAt;
    uint8 public constant decimals = 8;

    function setPrice(int256 _price) external {
        price = _price;
        updatedAt = block.timestamp;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedTimestamp,
            uint80 answeredInRound
        )
    {
        return (1, price, block.timestamp, updatedAt, 1);
    }

    function getRoundData(uint80)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedTimestamp,
            uint80 answeredInRound
        )
    {
        return (1, price, block.timestamp, updatedAt, 1);
    }

    function description() external pure returns (string memory) {
        return "BNB/USD";
    }

    function version() external pure returns (uint256) {
        return 1;
    }
}

contract ERC20Mock is IERC20 {
    string public name = "USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "bal");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "bal");
        uint256 a = allowance[from][msg.sender];
        require(a >= amount, "allow");
        allowance[from][msg.sender] = a - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
}

contract SwapTest is Test {
    Swap private swap;
    MockChainlinkAggregator private mockAggregator;
    ERC20Mock private usdc;

    function setUp() public {
        mockAggregator = new MockChainlinkAggregator();
        usdc = new ERC20Mock();
        swap = new Swap(address(mockAggregator), address(usdc));
        
        // Set initial BNB/USD price: $3000 (with 8 decimals = 3000e8)
        mockAggregator.setPrice(3000e8);
    }

    function test_getBnbUsd_returns_price() public {
        // Set price to $3500
        mockAggregator.setPrice(3500e8);
        
        (int256 price, uint256 updatedAt) = swap.getBnbUsd();

        assertEq(price, 3500e8, "price mismatch");
        assertEq(updatedAt, block.timestamp, "timestamp mismatch");
    }

    function test_getBnbUsd_reverts_on_stale_price() public {
        // Set price and move time forward beyond MAX_PRICE_AGE
        mockAggregator.setPrice(3000e8);
        vm.warp(block.timestamp + 25 hours);

        vm.expectRevert("Price too stale");
        swap.getBnbUsd();
    }

    function test_swapBnbForUsdc() public {
        // Setup: Give contract some USDC liquidity
        usdc.mint(address(swap), 1000000e6); // 1M USDC
        
        // User sends 1 BNB (1e18 wei) at $3000/BNB
        // Expected USDC: (1e18 * 3000e8) / (1e8 * 1e18) * 1e6 = 3000e6
        uint256 minUsdcOut = 2990e6; // Allow some slippage
        
        vm.deal(address(this), 1e18);
        uint256 usdcOut = swap.swapBnbForUsdc{value: 1e18}(minUsdcOut, address(this));
        
        assertGe(usdcOut, minUsdcOut, "insufficient USDC output");
        assertEq(usdc.balanceOf(address(this)), usdcOut, "USDC not transferred");
    }

    function test_swapUsdcForBnb() public {
        // Setup: Give contract some BNB liquidity
        vm.deal(address(swap), 10e18); // 10 BNB
        
        // User sends 3000 USDC (3000e6) at $3000/BNB
        // Expected BNB: (3000e6 * 1e18 * 1e8) / (1e6 * 3000e8) = 1e18
        usdc.mint(address(this), 3000e6);
        usdc.approve(address(swap), 3000e6);
        
        uint256 minBnbOut = 0.99e18; // Allow some slippage
        uint256 bnbOut = swap.swapUsdcForBnb(3000e6, minBnbOut, payable(address(this)));
        
        assertGe(bnbOut, minBnbOut, "insufficient BNB output");
        assertEq(address(this).balance, bnbOut, "BNB not transferred");
    }
}


