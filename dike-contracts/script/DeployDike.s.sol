// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {MultiversePrediction} from "../src/Dike.sol";

contract DeployDikeScript is Script {
    MultiversePrediction public multiversePrediction;

    // Network-specific configurations
    address public constant PYUSD_MAINNET =
        0x6c3ea9036406852006290770BEdFcAbA0e23A0e8;
    address public constant PYUSD_SEPOLIA =
        0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9;
    address public constant PYUSD_ANVIL = address(0);

    function setUp() public {}

    function run() public {
        // Get the network name
        string memory network = vm.envString("NETWORK");

        address pyUSDAddress;

        // Set pyUSD address based on network
        // If NETWORK is provided, use real pyUSD addresses, otherwise deploy mock
        if (
            keccak256(abi.encodePacked(network)) ==
            keccak256(abi.encodePacked("mainnet"))
        ) {
            pyUSDAddress = PYUSD_MAINNET;
        } else if (
            keccak256(abi.encodePacked(network)) ==
            keccak256(abi.encodePacked("sepolia"))
        ) {
            pyUSDAddress = PYUSD_SEPOLIA;
        } else {}

        console.log("Deploying MultiversePrediction on network:", network);
        console.log("Using pyUSD address:", pyUSDAddress);

        vm.startBroadcast();

        // Deploy the MultiversePrediction contract
        multiversePrediction = new MultiversePrediction(pyUSDAddress);

        vm.stopBroadcast();

        console.log(
            "MultiversePrediction deployed at:",
            address(multiversePrediction)
        );
        console.log("Owner:", multiversePrediction.owner());
        console.log("pyUSD token:", address(multiversePrediction.pyUSD()));
    }

    function deployMockPyUSD(
        uint256 deployerPrivateKey
    ) internal returns (address) {
        console.log("Deploying mock pyUSD token for local testing...");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy a simple mock ERC20 token
        MockPyUSD mockPyUSD = new MockPyUSD();

        vm.stopBroadcast();

        console.log("Mock pyUSD deployed at:", address(mockPyUSD));
        return address(mockPyUSD);
    }
}

// Simple mock ERC20 token for local testing
contract MockPyUSD {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    uint256 public totalSupply = 1000000 * 10 ** 6; // 1M tokens with 6 decimals
    string public name = "Mock pyUSD";
    string public symbol = "pyUSD";
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
