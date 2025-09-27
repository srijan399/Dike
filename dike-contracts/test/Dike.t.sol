// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {MultiversePrediction} from "src/Dike.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";

contract DikeTest is Test {
    ERC20Mock pyUSD;
    MultiversePrediction dike;

    address deployer = address(0xA11CE);
    address creator = address(0xC0FFEE);
    address investorYes = address(0xBEEF01);
    address investorNo = address(0xBEEF02);

    uint256 constant DECIMALS = 1e6;

    function setUp() public {
        vm.startPrank(deployer);
        pyUSD = new ERC20Mock();
        dike = new MultiversePrediction(address(pyUSD));
        vm.stopPrank();

        // Mint funds for creator and investors
        pyUSD.mint(creator, 1_000_000 * DECIMALS);
        pyUSD.mint(investorYes, 1_000_000 * DECIMALS);
        pyUSD.mint(investorNo, 1_000_000 * DECIMALS);

        // Approvals
        vm.prank(creator);
        pyUSD.approve(address(dike), type(uint256).max);
        vm.prank(investorYes);
        pyUSD.approve(address(dike), type(uint256).max);
        vm.prank(investorNo);
        pyUSD.approve(address(dike), type(uint256).max);
    }

    // ============ createPrediction ============
    function test_CreatePrediction_Success() public {
        vm.prank(creator);
        uint256 resolution = block.timestamp + 7 days;
        uint256 initialLiquidity = 20 * DECIMALS; // >= MINIMUM_LIQUIDITY (10e6)
        uint256 id = dike.createPrediction("Title", "Cat", "meta", resolution, initialLiquidity);

        (MultiversePrediction.Prediction memory p,,) = dike.getPredictionWithPrices(id);
        assertEq(p.id, id);
        assertEq(p.creator, creator);
        assertEq(p.initialLiquidity, initialLiquidity);
        assertEq(p.yesLiquidity, initialLiquidity / 2);
        assertEq(p.noLiquidity, initialLiquidity / 2);
        assertTrue(p.active);
        assertFalse(p.resolved);
    }

    function test_CreatePrediction_Revert_InsufficientLiquidity() public {
        vm.prank(creator);
        vm.expectRevert(bytes("Insufficient initial liquidity"));
        dike.createPrediction("T", "C", "M", block.timestamp + 1, 9 * DECIMALS);
    }

    function test_CreatePrediction_Revert_PastResolution() public {
        vm.prank(creator);
        vm.expectRevert(bytes("Resolution date must be in the future"));
        dike.createPrediction("T", "C", "M", block.timestamp, 20 * DECIMALS);
    }

    function test_CreatePrediction_Revert_EmptyTitle() public {
        vm.prank(creator);
        vm.expectRevert(bytes("Title cannot be empty"));
        dike.createPrediction("", "C", "M", block.timestamp + 1, 20 * DECIMALS);
    }

    // ============ investInPrediction ============
    function _createBasePrediction() internal returns (uint256 id, uint256 resolution, uint256 initialLiquidity) {
        resolution = block.timestamp + 7 days;
        initialLiquidity = 100 * DECIMALS;
        vm.prank(creator);
        id = dike.createPrediction("Title", "Cat", "meta", resolution, initialLiquidity);
    }

    function test_Invest_Success_YesSide_WithSlippageGuard() public {
        (uint256 id,,) = _createBasePrediction();

        // At start, yesPrice = noPrice = 0.5e18
        (uint256 yesPrice, uint256 noPrice) = dike.getCurrentPrices(id);
        assertEq(yesPrice, 5e17);
        assertEq(noPrice, 5e17);

        uint256 amount = 50 * DECIMALS;
        // expectedVotes = amount * 1e18 / yesPrice = amount * 2
        uint256 minExpectedVotes = (amount * 1e18) / yesPrice;

        vm.prank(investorYes);
        dike.investInPrediction(id, amount, true, minExpectedVotes);

        (MultiversePrediction.Prediction memory p,,) = dike.getPredictionWithPrices(id);
        // initial yesLiquidity was 50 * DECIMALS; after investing 50, it becomes 100
        assertEq(p.yesLiquidity, 100 * DECIMALS);
        assertEq(p.noLiquidity, 100 * DECIMALS / 2); // initial was split 50/50
    }

    function test_Invest_Revert_AmountZero() public {
        (uint256 id,,) = _createBasePrediction();
        vm.prank(investorYes);
        vm.expectRevert(bytes("Amount must be greater than 0"));
        dike.investInPrediction(id, 0, true, 0);
    }

    function test_Invest_Revert_NotActive() public {
        // Use a non-existent prediction id to trigger the "Prediction not active" require
        uint256 nonexistentId = 999999;
        vm.prank(investorYes);
        vm.expectRevert(bytes("Prediction not active"));
        dike.investInPrediction(nonexistentId, 1, true, 0);
    }

    function test_Invest_Revert_Resolved() public {
        (uint256 id, uint256 resolution,) = _createBasePrediction();
        vm.warp(resolution);
        vm.prank(dike.owner());
        dike.resolvePrediction(id, true);

        vm.prank(investorYes);
        vm.expectRevert(bytes("Prediction already resolved"));
        dike.investInPrediction(id, 1, true, 0);
    }

    function test_Invest_Revert_Expired() public {
        (uint256 id, uint256 resolution,) = _createBasePrediction();
        vm.warp(resolution + 1);
        vm.prank(investorYes);
        vm.expectRevert(bytes("Prediction expired"));
        dike.investInPrediction(id, 1, true, 0);
    }

    function test_Invest_Revert_Slippage() public {
        (uint256 id,,) = _createBasePrediction();

        // Set minExpectedVotes higher than achievable (overly strict)
        (uint256 yesPrice,) = dike.getCurrentPrices(id);
        uint256 amount = 10 * DECIMALS;
        uint256 minExpectedVotes = ((amount * 1e18) / yesPrice) + 1;

        vm.prank(investorYes);
        vm.expectRevert(bytes("Slippage tolerance exceeded"));
        dike.investInPrediction(id, amount, true, minExpectedVotes);
    }

    // ============ getters ============
    function test_Getters_PricesAndTotals() public {
        (uint256 id,,) = _createBasePrediction();
        (uint256 yesPrice, uint256 noPrice) = dike.getCurrentPrices(id);
        assertEq(yesPrice, 5e17);
        assertEq(noPrice, 5e17);

        uint256 total = dike.getTotalLiquidity(id);
        assertEq(total, 100 * DECIMALS);
    }

    function test_Getters_UserChainAndInvestments() public {
        (uint256 id,,) = _createBasePrediction();

        vm.prank(investorYes);
        dike.investInPrediction(id, 30 * DECIMALS, true, 1);
        vm.prank(investorNo);
        dike.investInPrediction(id, 20 * DECIMALS, false, 1);

        (uint256[] memory preds, uint256 totalInvested, uint256 totalClaimed) = dike.getUserChain(investorYes);
        assertEq(preds.length, 1);
        assertEq(preds[0], id);
        assertEq(totalInvested, 30 * DECIMALS);
        assertEq(totalClaimed, 0);

        (uint256 totalAmt, uint256 yesAmt, uint256 noAmt) = dike.getUserTotalInvestmentInPrediction(investorYes, id);
        assertEq(totalAmt, 30 * DECIMALS);
        assertEq(yesAmt, 30 * DECIMALS);
        assertEq(noAmt, 0);

        MultiversePrediction.Investment[] memory invsUser = dike.getUserInvestmentsInPrediction(investorYes, id);
        assertEq(invsUser.length, 1);

        MultiversePrediction.Investment[] memory invsPred = dike.getPredictionInvestments(id);
        assertEq(invsPred.length, 2);
    }

    function test_GetActivePredictions() public {
        // create 3 predictions
        for (uint256 i = 0; i < 3; i++) {
            vm.prank(creator);
            dike.createPrediction("T", "C", "M", block.timestamp + 1 days + i, 20 * DECIMALS);
        }

        uint256[] memory active = dike.getActivePredictions();
        assertEq(active.length, 3);
    }

    // ============ resolvePrediction ============
    function test_ResolvePrediction_SuccessByOwner_AfterResolutionDate() public {
        (uint256 id, uint256 resolution,) = _createBasePrediction();
        vm.warp(resolution);

        address ownerAddr = dike.owner();
        vm.prank(ownerAddr);
        dike.resolvePrediction(id, true);

        MultiversePrediction.Prediction memory p = dike.getPrediction(id);
        assertTrue(p.resolved);
        assertTrue(p.outcome);
    }

    function test_ResolvePrediction_Revert_OnlyOwner() public {
        (uint256 id, uint256 resolution,) = _createBasePrediction();
        vm.warp(resolution);

        vm.prank(investorYes);
        vm.expectRevert(); // Ownable error message varies by OZ version; generic expectRevert is fine
        dike.resolvePrediction(id, false);
    }

    function test_ResolvePrediction_Revert_TooEarly() public {
        (uint256 id,,) = _createBasePrediction();
        vm.prank(dike.owner());
        vm.expectRevert(bytes("Cannot resolve before resolution date"));
        dike.resolvePrediction(id, true);
    }
}


