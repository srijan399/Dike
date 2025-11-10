// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {MultiversePrediction} from "../src/Dike.sol";

contract DeployDikeScript is Script {
    MultiversePrediction public multiversePrediction;

    // Network-specific configurations
    address public constant USDC_BNB_TESTNET =
        0x64544969ed7EBf5f083679233325356EbE738930;
    address public constant USDC_MAINNET =
        0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;
    address public constant USDC_ANVIL = address(0);

    function setUp() public {}

    function run() public {
        // Get the network name
        string memory network = vm.envString("NETWORK");

        address usdcAddress;

        // Set USDC address based on network
        // If NETWORK is provided, use real USDC addresses, otherwise deploy mock
        if (
            keccak256(abi.encodePacked(network)) ==
            keccak256(abi.encodePacked("bsc_testnet"))
        ) {
            usdcAddress = USDC_BNB_TESTNET;
        } else if (
            keccak256(abi.encodePacked(network)) ==
            keccak256(abi.encodePacked("bsc_mainnet"))
        ) {
            usdcAddress = USDC_MAINNET;
        } else {}

        console.log("Deploying MultiversePrediction on network:", network);
        console.log("Using USDC address:", usdcAddress);

        vm.startBroadcast();

        // Deploy the MultiversePrediction contract
        multiversePrediction = new MultiversePrediction(usdcAddress);

        vm.stopBroadcast();

        console.log(
            "MultiversePrediction deployed at:",
            address(multiversePrediction)
        );
        console.log("Owner:", multiversePrediction.owner());
        console.log("USDC token:", address(multiversePrediction.usdc()));
    }

    function deployMockUSDC(
        uint256 deployerPrivateKey
    ) internal returns (address) {
        console.log("Deploying mock USDC token for local testing...");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy a simple mock ERC20 token
        MockUSDC mockUSDC = new MockUSDC();

        vm.stopBroadcast();

        console.log("Mock USDC deployed at:", address(mockUSDC));
        return address(mockUSDC);
    }
}

// Simple mock ERC20 token for local testing
contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    uint256 public totalSupply = 1000000 * 10 ** 6; // 1M tokens with 6 decimals
    string public name = "Mock USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(
            allowance[from][msg.sender] >= amount,
            "Insufficient allowance"
        );

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    // Mint function for testing
    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
}
