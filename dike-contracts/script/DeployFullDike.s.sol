// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.28;

// import {Script, console} from "forge-std/Script.sol";
// import {FullDike} from "../src/FullDike.sol";

// contract DeployFullDikeScript is Script {
//     FullDike public fullDike;

//     // Network-specific configurations
//     address public constant USDC_MAINNET =
//         0xA0B86A33e6441b8C4c8C0e1234567890AbcdEF12; // Replace with actual USDC mainnet address
//     address public constant USDC_SEPOLIA =
//         0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9; // Replace with actual USDC sepolia address
//     address public constant USDC_ANVIL = address(0); // Will be deployed as mock token

//     // Treasury addresses (should be set to actual treasury addresses)
//     address public constant TREASURY_MAINNET =
//         0x1234567890123456789012345678901234567890; // Replace with actual treasury
//     address public constant TREASURY_SEPOLIA =
//         0x2345678901234567890123456789012345678901; // Replace with actual treasury
//     address public constant TREASURY_ANVIL = address(0); // Will be set to deployer

//     // AI Oracle addresses (should be set to actual AI oracle addresses)
//     address public constant AI_ORACLE_MAINNET =
//         0x3456789012345678901234567890123456789012; // Replace with actual AI oracle
//     address public constant AI_ORACLE_SEPOLIA =
//         0x4567890123456789012345678901234567890123; // Replace with actual AI oracle
//     address public constant AI_ORACLE_ANVIL = address(0); // Will be set to deployer

//     function setUp() public {}

//     function run() public {
//         // Get the network name
//         string memory network = vm.envString("NETWORK");

//         address usdcAddress;
//         address treasuryAddress;
//         address aiOracleAddress;

//         // Set addresses based on network
//         if (
//             keccak256(abi.encodePacked(network)) ==
//             keccak256(abi.encodePacked("mainnet"))
//         ) {
//             usdcAddress = USDC_MAINNET;
//             treasuryAddress = TREASURY_MAINNET;
//             aiOracleAddress = AI_ORACLE_MAINNET;
//         } else if (
//             keccak256(abi.encodePacked(network)) ==
//             keccak256(abi.encodePacked("sepolia"))
//         ) {
//             usdcAddress = USDC_SEPOLIA;
//             treasuryAddress = TREASURY_SEPOLIA;
//             aiOracleAddress = AI_ORACLE_SEPOLIA;
//         } else {
//             // For local networks (anvil, hardhat, etc.), deploy mock USDC and use deployer as treasury/ai oracle
//             usdcAddress = deployMockUSDC();
//             treasuryAddress = msg.sender; // Use deployer as treasury for testing
//             aiOracleAddress = msg.sender; // Use deployer as AI oracle for testing
//         }

//         console.log("Deploying FullDike on network:", network);
//         console.log("Using USDC address:", usdcAddress);
//         console.log("Using Treasury address:", treasuryAddress);
//         console.log("Using AI Oracle address:", aiOracleAddress);

//         vm.startBroadcast();

//         // Deploy the FullDike contract
//         fullDike = new FullDike(usdcAddress, treasuryAddress, aiOracleAddress);

//         vm.stopBroadcast();

//         console.log("FullDike deployed at:", address(fullDike));
//         console.log("Owner:", fullDike.owner());
//         console.log("USDC token:", address(fullDike.usdc()));
//         console.log("Treasury:", fullDike.treasury());
//         console.log("AI Oracle:", fullDike.aiOracle());
//         console.log("Protocol Fee Rate:", fullDike.PROTOCOL_FEE_RATE());
//         console.log("LP Fee Rate:", fullDike.LP_FEE_RATE());
//         console.log(
//             "Validator Stake Requirement:",
//             fullDike.validatorStakeRequirement()
//         );
//     }

//     function deployMockUSDC() internal returns (address) {
//         console.log("Deploying mock USDC token for local testing...");

//         vm.startBroadcast();

//         // Deploy a simple mock ERC20 token
//         MockUSDC mockUSDC = new MockUSDC();

//         vm.stopBroadcast();

//         console.log("Mock USDC deployed at:", address(mockUSDC));
//         return address(mockUSDC);
//     }
// }

// // Simple mock ERC20 token for local testing
// contract MockUSDC {
//     mapping(address => uint256) public balanceOf;
//     mapping(address => mapping(address => uint256)) public allowance;

//     uint256 public totalSupply = 10000000 * 10 ** 6; // 10M tokens with 6 decimals
//     string public name = "Mock USDC";
//     string public symbol = "USDC";
//     uint8 public decimals = 6;

//     event Transfer(address indexed from, address indexed to, uint256 value);
//     event Approval(
//         address indexed owner,
//         address indexed spender,
//         uint256 value
//     );

//     constructor() {
//         balanceOf[msg.sender] = totalSupply;
//         emit Transfer(address(0), msg.sender, totalSupply);
//     }

//     function transfer(address to, uint256 amount) public returns (bool) {
//         require(balanceOf[msg.sender] >= amount, "Insufficient balance");
//         balanceOf[msg.sender] -= amount;
//         balanceOf[to] += amount;
//         emit Transfer(msg.sender, to, amount);
//         return true;
//     }

//     function transferFrom(
//         address from,
//         address to,
//         uint256 amount
//     ) public returns (bool) {
//         require(balanceOf[from] >= amount, "Insufficient balance");
//         require(
//             allowance[from][msg.sender] >= amount,
//             "Insufficient allowance"
//         );

//         balanceOf[from] -= amount;
//         balanceOf[to] += amount;
//         allowance[from][msg.sender] -= amount;

//         emit Transfer(from, to, amount);
//         return true;
//     }

//     function approve(address spender, uint256 amount) public returns (bool) {
//         allowance[msg.sender][spender] = amount;
//         emit Approval(msg.sender, spender, amount);
//         return true;
//     }

//     // Mint function for testing
//     function mint(address to, uint256 amount) public {
//         balanceOf[to] += amount;
//         totalSupply += amount;
//         emit Transfer(address(0), to, amount);
//     }

//     // Burn function for testing
//     function burn(address from, uint256 amount) public {
//         require(balanceOf[from] >= amount, "Insufficient balance");
//         balanceOf[from] -= amount;
//         totalSupply -= amount;
//         emit Transfer(from, address(0), amount);
//     }
// }
