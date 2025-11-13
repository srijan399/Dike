// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {Swap} from "../src/Swap.sol";

/// @notice Deploys Swap pointing to Pyth on Sepolia
/// Run:
/// forge script script/DeploySwap.s.sol:DeploySwap --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
contract DeploySwap is Script {
    // Sepolia Pyth contract address
    address constant CHAINLINK_PRICE_FEED_BNB_USD = 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526;
    // Sepolia PYUSD token address
    address constant BNB_USDC = 0x64544969ed7EBf5f083679233325356EbE738930;

    function run() external {
        vm.startBroadcast();
        Swap swap = new Swap(CHAINLINK_PRICE_FEED_BNB_USD, BNB_USDC);
        vm.stopBroadcast();

        swap; // silence
    }
}


