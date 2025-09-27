// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {Swap} from "../src/Swap.sol";

/// @notice Deploys Swap pointing to Pyth on Sepolia
/// Run:
/// forge script script/DeploySwap.s.sol:DeploySwap --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
contract DeploySwap is Script {
    // Sepolia Pyth contract address
    address constant SEPOLIA_PYTH = 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21;
    // Sepolia PYUSD token address
    address constant SEPOLIA_PYUSD = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9;

    function run() external {
        vm.startBroadcast();
        Swap swap = new Swap(SEPOLIA_PYTH, SEPOLIA_PYUSD);
        vm.stopBroadcast();

        swap; // silence
    }
}


