// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Swap} from "../src/Swap.sol";
import {MockPyth} from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20Mock is IERC20 {
    string public name = "PYUSD";
    string public symbol = "PYUSD";
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
    MockPyth private mockPyth;
    ERC20Mock private pyusd;

    bytes32 constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;

    function setUp() public {
        // validTimePeriod = 2 minutes, singleUpdateFeeInWei = 1 wei
        mockPyth = new MockPyth(120, 1);
        pyusd = new ERC20Mock();
        swap = new Swap(address(mockPyth), address(pyusd));
    }

    function test_getEthUsd_returns_price_after_update() public {
        // Build update data and push to MockPyth
        int64 price = 3000e8; // 3000.00 with expo = -8
        uint64 conf = 50_00000000; // 0.5 with expo = -8
        int32 expo = -8;
        uint64 publishTime = uint64(block.timestamp);
        uint64 prevPublishTime = publishTime; // avoid underflow in early blocks

        bytes memory update = mockPyth.createPriceFeedUpdateData(
            ETH_USD_PRICE_ID,
            price,
            conf,
            expo,
            price,
            conf,
            publishTime,
            prevPublishTime
        );

        bytes[] memory updates = new bytes[](1);
        updates[0] = update;

        mockPyth.updatePriceFeeds{value: mockPyth.getUpdateFee(updates)}(updates);

        // Read using unsafe method
        (int64 p, uint64 c, int32 e) = swap.getEthUsd();

        assertEq(p, price, "price mismatch");
        assertEq(c, conf, "conf mismatch");
        assertEq(e, expo, "expo mismatch");
    }
}


