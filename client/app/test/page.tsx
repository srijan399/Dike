"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { DikeAbi, PYUSD_ABI } from "../abi";
import { useAccount } from "wagmi";

// Contract address
const Dike_SEPOLIA_ADDRESS = "0x4b0fe8D4512F94771D6B04c0BCD7602A0c095C16";
const PYUSD_SEPOLIA_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PyUSD on Sepolia

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  result?: any;
  error?: string;
  gasUsed?: string;
}

interface Prediction {
  id: bigint;
  creator: string;
  title: string;
  category: string;
  metadata: string;
  resolutionDate: bigint;
  initialLiquidity: bigint;
  yesLiquidity: bigint;
  noLiquidity: bigint;
  resolved: boolean;
  outcome: boolean;
  createdAt: bigint;
  active: boolean;
}

export default function ContractTestPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [pyUSDContract, setPyUSDContract] = useState<ethers.Contract | null>(
    null
  );
  const [account, setAccount] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const { address } = useAccount();

  // Helper function to format PyUSD/USDC values (6 decimals)
  const formatUSDC = (value: string | bigint): string => {
    try {
      const formatted = ethers.formatUnits(value.toString(), 6);
      return `${parseFloat(formatted).toFixed(2)} USDC`;
    } catch (error) {
      return `${value.toString()} (raw)`;
    }
  };

  // Connect to wallet and ensure Sepolia testnet
  const connectWallet = async () => {
    try {
      if (typeof (window as any).ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider((window as any).ethereum);

        // Check if we're on Sepolia testnet (Chain ID: 11155111)
        const network = await provider.getNetwork();
        const sepoliaChainId = BigInt(11155111);

        if (network.chainId !== sepoliaChainId) {
          try {
            // Request to switch to Sepolia testnet
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
            });
          } catch (switchError: any) {
            // If the chain hasn't been added to MetaMask, add it
            if (switchError.code === 4902) {
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0xaa36a7",
                    chainName: "Sepolia Testnet",
                    nativeCurrency: {
                      name: "SepoliaETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: [
                      "https://eth-sepolia.g.alchemy.com/v2/XH65vLeu_CE11N3S1H3g1",
                    ],
                    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }

        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          Dike_SEPOLIA_ADDRESS,
          DikeAbi,
          signer
        );
        const pyUSDContract = new ethers.Contract(
          PYUSD_SEPOLIA_ADDRESS,
          PYUSD_ABI,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setPyUSDContract(pyUSDContract);
        setAccount(accounts[0]);
        setIsConnected(true);

        console.log("Connected to Sepolia testnet");
        console.log("PyUSD contract initialized:", PYUSD_SEPOLIA_ADDRESS);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert(
        "Failed to connect to Sepolia testnet. Please check your wallet settings."
      );
    }
  };

  // Check and approve PyUSD tokens for contract spending
  const checkAndApproveTokens = async (amount: string) => {
    if (!pyUSDContract || !signer || !account) {
      throw new Error("PyUSD contract not initialized");
    }

    try {
      // Check current balance
      const balance = await pyUSDContract.balanceOf(account);
      const amountWei = ethers.parseUnits(amount, 6); // PyUSD has 6 decimals

      console.log(`PyUSD Balance: ${ethers.formatUnits(balance, 6)} PyUSD`);
      console.log(`Required Amount: ${amount} PyUSD`);

      if (balance < amountWei) {
        throw new Error(
          `Insufficient PyUSD balance. Required: ${amount}, Available: ${ethers.formatUnits(
            balance,
            6
          )}`
        );
      }

      // Check current allowance
      const allowance = await pyUSDContract.allowance(
        account,
        Dike_SEPOLIA_ADDRESS
      );
      console.log(
        `Current Allowance: ${ethers.formatUnits(allowance, 6)} PyUSD`
      );

      if (allowance < amountWei) {
        console.log("Requesting PyUSD approval...");
        const approveTx = await pyUSDContract.approve(
          Dike_SEPOLIA_ADDRESS,
          amountWei
        );
        console.log("Approval transaction sent:", approveTx.hash);

        const receipt = await approveTx.wait();
        console.log("Approval confirmed in block:", receipt.blockNumber);

        return {
          approved: true,
          txHash: approveTx.hash,
          blockNumber: receipt.blockNumber,
        };
      } else {
        console.log("Sufficient allowance already exists");
        return {
          approved: true,
          txHash: null,
          blockNumber: null,
        };
      }
    } catch (error) {
      console.error("Token approval error:", error);
      throw error;
    }
  };

  // Helper function to get updated prediction data after investment
  const getUpdatedPredictionData = async (predictionId: number) => {
    if (!address) return null;

    const results: any = {};

    try {
      // Get current prices
      const prices = await contract?.getCurrentPrices(predictionId);
      results.currentPrices = {
        yesPrice: formatUSDC(prices[0]),
        noPrice: formatUSDC(prices[1]),
      };

      // Get total liquidity
      const totalLiquidity = await contract?.getTotalLiquidity(predictionId);
      results.totalLiquidity = formatUSDC(totalLiquidity);

      // Get user's total investment in this prediction
      const userTotalInvestment =
        await contract?.getUserTotalInvestmentInPrediction(
          account,
          predictionId
        );
      results.userInvestment = {
        totalAmount: formatUSDC(userTotalInvestment[0]),
        yesAmount: formatUSDC(userTotalInvestment[1]),
        noAmount: formatUSDC(userTotalInvestment[2]),
      };

      // Get prediction with prices
      const predictionWithPrices = await contract?.getPredictionWithPrices(
        predictionId
      );
      results.predictionInfo = {
        id: predictionWithPrices[0].id.toString(),
        title: predictionWithPrices[0].title,
        yesLiquidity: formatUSDC(predictionWithPrices[0].yesLiquidity),
        noLiquidity: formatUSDC(predictionWithPrices[0].noLiquidity),
        resolved: predictionWithPrices[0].resolved,
        active: predictionWithPrices[0].active,
      };

      return results;
    } catch (error: any) {
      console.error("Error getting updated prediction data:", error);
      return { error: error.message };
    }
  };

  // Helper function to update test results
  const updateTestResult = (
    name: string,
    status: "pending" | "success" | "error",
    result?: any,
    error?: string,
    gasUsed?: string
  ) => {
    setTestResults((prev) => {
      const existing = prev.find((t) => t.name === name);
      if (existing) {
        return prev.map((t) =>
          t.name === name ? { ...t, status, result, error, gasUsed } : t
        );
      } else {
        return [...prev, { name, status, result, error, gasUsed }];
      }
    });
  };

  // Test basic contract information
  const testBasicContractInfo = async () => {
    if (!contract) return;

    // Test MINIMUM_LIQUIDITY
    try {
      updateTestResult("MINIMUM_LIQUIDITY", "pending");
      const minLiquidity = await contract.MINIMUM_LIQUIDITY();
      updateTestResult(
        "MINIMUM_LIQUIDITY",
        "success",
        formatUSDC(minLiquidity)
      );
    } catch (error: any) {
      updateTestResult("MINIMUM_LIQUIDITY", "error", null, error.message);
    }

    // Test predictionCounter
    try {
      updateTestResult("predictionCounter", "pending");
      const counter = await contract.predictionCounter();
      updateTestResult("predictionCounter", "success", counter.toString());
    } catch (error: any) {
      updateTestResult("predictionCounter", "error", null, error.message);
    }

    // Test owner
    try {
      updateTestResult("owner", "pending");
      const owner = await contract.owner();
      updateTestResult("owner", "success", owner);
    } catch (error: any) {
      updateTestResult("owner", "error", null, error.message);
    }

    // Test pyUSD
    try {
      updateTestResult("pyUSD", "pending");
      const pyUSD = await contract.pyUSD();
      updateTestResult("pyUSD", "success", pyUSD);
    } catch (error: any) {
      updateTestResult("pyUSD", "error", null, error.message);
    }
  };

  // Test creating a prediction
  const testCreatePrediction = async () => {
    if (!contract) return;

    try {
      updateTestResult("createPrediction", "pending");
      const title = "Test Prediction " + Date.now();
      const category = "Test";
      const metadata = "Test metadata";
      const resolutionDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const initialLiquidity = ethers.parseUnits("10", 6); // 10 PyUSD (6 decimals)

      // Check and approve PyUSD tokens before creating prediction
      console.log("Checking PyUSD approval for 10 PyUSD...");
      const approvalResult = await checkAndApproveTokens("10");

      if (approvalResult.txHash) {
        console.log("PyUSD approval completed:", approvalResult.txHash);
      }

      console.log("Creating prediction with approved tokens...");
      const tx = await contract.createPrediction(
        title,
        category,
        metadata,
        resolutionDate,
        initialLiquidity
      );
      const receipt = await tx.wait();
      updateTestResult(
        "createPrediction",
        "success",
        {
          txHash: tx.hash,
          predictionId: "Check events for ID",
          initialLiquidity: formatUSDC(initialLiquidity),
          approvalTx: approvalResult.txHash,
        },
        undefined,
        receipt.gasUsed.toString()
      );
    } catch (error: any) {
      updateTestResult("createPrediction", "error", null, error.message);
    }
  };

  // Test view functions
  const testViewFunctions = async () => {
    if (!contract) return;

    // Test getActivePredictions
    try {
      updateTestResult("getActivePredictions", "pending");
      const activePredictions = await contract.getActivePredictions();
      updateTestResult(
        "getActivePredictions",
        "success",
        activePredictions.map((id: bigint) => id.toString())
      );
    } catch (error: any) {
      updateTestResult("getActivePredictions", "error", null, error.message);
    }

    // Test getUserChain
    try {
      updateTestResult("getUserChain", "pending");
      const userChain = await contract.getUserChain(account);
      updateTestResult("getUserChain", "success", {
        predictionIds: userChain[0].map((id: bigint) => id.toString()),
        totalInvested: formatUSDC(userChain[1]),
        totalClaimed: formatUSDC(userChain[2]),
      });
    } catch (error: any) {
      updateTestResult("getUserChain", "error", null, error.message);
    }
  };

  // Test prediction-specific functions (if predictions exist)
  const testPredictionFunctions = async () => {
    if (!contract) return;

    try {
      const counter = await contract.predictionCounter();
      const predictionCount = Number(counter);

      if (predictionCount > 0) {
        const predictionId = 1; // Test with first prediction

        // Test getPrediction
        try {
          updateTestResult("getPrediction", "pending");
          const prediction = await contract.getPrediction(predictionId);
          updateTestResult("getPrediction", "success", {
            id: prediction.id.toString(),
            creator: prediction.creator,
            title: prediction.title,
            category: prediction.category,
            resolved: prediction.resolved,
            active: prediction.active,
          });
        } catch (error: any) {
          updateTestResult("getPrediction", "error", null, error.message);
        }

        // Test getCurrentPrices
        try {
          updateTestResult("getCurrentPrices", "pending");
          const prices = await contract.getCurrentPrices(predictionId);
          updateTestResult("getCurrentPrices", "success", {
            yesPrice: formatUSDC(prices[0]),
            noPrice: formatUSDC(prices[1]),
          });
        } catch (error: any) {
          updateTestResult("getCurrentPrices", "error", null, error.message);
        }

        // Test getPredictionWithPrices
        try {
          updateTestResult("getPredictionWithPrices", "pending");
          const predictionWithPrices = await contract.getPredictionWithPrices(
            predictionId
          );
          updateTestResult("getPredictionWithPrices", "success", {
            prediction: {
              id: predictionWithPrices[0].id.toString(),
              title: predictionWithPrices[0].title,
              resolved: predictionWithPrices[0].resolved,
            },
            yesPrice: formatUSDC(predictionWithPrices[1]),
            noPrice: formatUSDC(predictionWithPrices[2]),
          });
        } catch (error: any) {
          updateTestResult(
            "getPredictionWithPrices",
            "error",
            null,
            error.message
          );
        }

        // Test getTotalLiquidity
        try {
          updateTestResult("getTotalLiquidity", "pending");
          const totalLiquidity = await contract.getTotalLiquidity(predictionId);
          updateTestResult(
            "getTotalLiquidity",
            "success",
            formatUSDC(totalLiquidity)
          );
        } catch (error: any) {
          updateTestResult("getTotalLiquidity", "error", null, error.message);
        }

        // Test getPredictionInvestments
        try {
          updateTestResult("getPredictionInvestments", "pending");
          const investments = await contract.getPredictionInvestments(
            predictionId
          );
          updateTestResult(
            "getPredictionInvestments",
            "success",
            investments.length.toString() + " investments"
          );
        } catch (error: any) {
          updateTestResult(
            "getPredictionInvestments",
            "error",
            null,
            error.message
          );
        }

        // Test getUserInvestmentsInPrediction
        try {
          updateTestResult("getUserInvestmentsInPrediction", "pending");
          const userInvestments = await contract.getUserInvestmentsInPrediction(
            account,
            predictionId
          );
          updateTestResult(
            "getUserInvestmentsInPrediction",
            "success",
            userInvestments.length.toString() + " user investments"
          );
        } catch (error: any) {
          updateTestResult(
            "getUserInvestmentsInPrediction",
            "error",
            null,
            error.message
          );
        }

        // Test getUserTotalInvestmentInPrediction
        try {
          updateTestResult("getUserTotalInvestmentInPrediction", "pending");
          const totalInvestment =
            await contract.getUserTotalInvestmentInPrediction(
              account,
              predictionId
            );
          updateTestResult("getUserTotalInvestmentInPrediction", "success", {
            totalAmount: formatUSDC(totalInvestment[0]),
            yesAmount: formatUSDC(totalInvestment[1]),
            noAmount: formatUSDC(totalInvestment[2]),
          });
        } catch (error: any) {
          updateTestResult(
            "getUserTotalInvestmentInPrediction",
            "error",
            null,
            error.message
          );
        }
      } else {
        updateTestResult(
          "Prediction Functions",
          "error",
          null,
          "No predictions exist to test"
        );
      }
    } catch (error: any) {
      updateTestResult("Prediction Functions", "error", null, error.message);
    }
  };

  // Test state-changing functions
  const testStateChangingFunctions = async () => {
    if (!contract) return;

    // Test createPrediction
    try {
      updateTestResult("createPrediction", "pending");
      const title = "Test Prediction " + Date.now();
      const category = "Test";
      const metadata = "Test metadata";
      const resolutionDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const initialLiquidity = ethers.parseUnits("10", 6); // 10 PyUSD (6 decimals)

      const tx = await contract.createPrediction(
        title,
        category,
        metadata,
        resolutionDate,
        initialLiquidity
      );
      const receipt = await tx.wait();
      updateTestResult(
        "createPrediction",
        "success",
        {
          txHash: tx.hash,
          predictionId: "Check events for ID",
          initialLiquidity: formatUSDC(initialLiquidity),
          approvalTx: null,
        },
        undefined,
        receipt.gasUsed.toString()
      );
    } catch (error: any) {
      updateTestResult("createPrediction", "error", null, error.message);
    }

    // Test investInPrediction (if predictions exist)
    try {
      const counter = await contract.predictionCounter();
      const predictionCount = Number(counter);

      if (predictionCount > 0) {
        updateTestResult("investInPrediction", "pending");
        const predictionId = predictionCount; // Use latest prediction
        const amount = ethers.parseUnits("1", 6); // 1 PyUSD
        const side = true; // Yes
        const minExpectedVotes = 0;

        const tx = await contract.investInPrediction(
          predictionId,
          amount,
          side,
          minExpectedVotes
        );
        const receipt = await tx.wait();
        updateTestResult(
          "investInPrediction",
          "success",
          {
            txHash: tx.hash,
            amount: formatUSDC(amount),
            side: side ? "Yes" : "No",
          },
          undefined,
          receipt.gasUsed.toString()
        );
      } else {
        updateTestResult(
          "investInPrediction",
          "error",
          null,
          "No predictions exist to invest in"
        );
      }
    } catch (error: any) {
      updateTestResult("investInPrediction", "error", null, error.message);
    }
  };

  // Test investment functionality
  const testInvestmentFunctions = async () => {
    if (!contract) return;

    try {
      const counter = await contract.predictionCounter();
      const predictionCount = Number(counter);

      if (predictionCount > 0) {
        updateTestResult("investInPrediction", "pending");
        const predictionId = 1; // Invest in first prediction
        const amount = ethers.parseUnits("10", 6); // 10 USDC (6 decimals)
        const side = false; // Yes
        const minExpectedVotes = 0;

        // Check and approve USDC tokens before investing
        console.log("Checking USDC approval for 10 USDC investment...");
        const approvalResult = await checkAndApproveTokens("10");

        if (approvalResult.txHash) {
          console.log("USDC approval completed:", approvalResult.txHash);
        }

        console.log(
          `Investing ${formatUSDC(amount)} in prediction ID ${predictionId} (${
            side ? "Yes" : "No"
          } side)...`
        );
        const tx = await contract.investInPrediction(
          predictionId,
          amount,
          side,
          minExpectedVotes
        );
        const receipt = await tx.wait();

        // Get updated prediction data after investment
        console.log("Getting updated prediction data after investment...");
        const updatedData = await getUpdatedPredictionData(predictionId);

        updateTestResult(
          "investInPrediction",
          "success",
          {
            txHash: tx.hash,
            predictionId: predictionId,
            amount: formatUSDC(amount),
            side: side ? "Yes" : "No",
            approvalTx: approvalResult.txHash,
            updatedPredictionData: updatedData,
          },
          undefined,
          receipt.gasUsed.toString()
        );
      } else {
        updateTestResult(
          "investInPrediction",
          "error",
          null,
          "No predictions exist to invest in"
        );
      }
    } catch (error: any) {
      updateTestResult("investInPrediction", "error", null, error.message);
    }
  };

  // Run all tests in logical order: Create -> Get -> Interact
  const runAllTests = async () => {
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsRunningTests(true);
    setTestResults([]);

    try {
      // Step 1: Test basic contract info (no dependencies)
      console.log("Step 1: Testing basic contract information...");
      await testBasicContractInfo();

      // Step 2: Create a prediction (prerequisite for other tests)
      console.log("Step 2: Creating a test prediction...");
      await testCreatePrediction();

      // Step 3: Test view functions (now that we have created data)
      console.log("Step 3: Testing view functions with created data...");
      await testViewFunctions();

      // Step 4: Test prediction-specific functions (requires existing predictions)
      console.log("Step 4: Testing prediction-specific functions...");
      await testPredictionFunctions();

      // Step 5: Test investment functions (requires existing predictions)
      console.log("Step 5: Testing investment functions...");
      await testInvestmentFunctions();

      console.log("All tests completed successfully!");
    } catch (error) {
      console.error("Error running tests:", error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          MultiversePrediction Contract Test Suite
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Testing on Sepolia Testnet
        </p>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          {isConnected ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ Connected to Sepolia Testnet</p>
              <p className="text-sm text-gray-600">Account: {account}</p>
              <p className="text-sm text-gray-600">
                Contract: {Dike_SEPOLIA_ADDRESS}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-600 mb-4">❌ Not connected</p>
              <button
                onClick={connectWallet}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Connect Wallet (Sepolia)
              </button>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={runAllTests}
              disabled={!isConnected || isRunningTests}
              className={`px-6 py-2 rounded font-medium ${
                !isConnected || isRunningTests
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-700 text-white"
              }`}
            >
              {isRunningTests ? "Running Tests..." : "Run All Tests"}
            </button>
            <button
              onClick={() => setTestResults([])}
              disabled={isRunningTests}
              className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              Clear Results
            </button>
          </div>
          {!isConnected && (
            <p className="text-sm text-gray-600 mt-2">
              Please connect to Sepolia testnet to run tests
            </p>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    test.status === "success"
                      ? "border-green-200 bg-green-50"
                      : test.status === "error"
                      ? "border-red-200 bg-red-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{test.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        test.status === "success"
                          ? "bg-green-200 text-green-800"
                          : test.status === "error"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  {test.result && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-600">
                        Result:
                      </p>
                      {test.name === "investInPrediction" &&
                      test.result.updatedPredictionData ? (
                        <div className="space-y-3">
                          {/* Investment Details */}
                          <div className="bg-blue-50 p-3 rounded">
                            <h4 className="font-medium text-blue-800 mb-2">
                              Investment Details
                            </h4>
                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Amount:</strong> {test.result.amount}
                              </p>
                              <p>
                                <strong>Side:</strong> {test.result.side}
                              </p>
                              <p>
                                <strong>Transaction:</strong>{" "}
                                {test.result.txHash}
                              </p>
                              {test.result.approvalTx && (
                                <p>
                                  <strong>Approval TX:</strong>{" "}
                                  {test.result.approvalTx}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Updated Prediction Data */}
                          {test.result.updatedPredictionData &&
                            !test.result.updatedPredictionData.error && (
                              <div className="bg-green-50 p-3 rounded">
                                <h4 className="font-medium text-green-800 mb-2">
                                  Updated Prediction Data
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="font-medium">
                                      Current Prices:
                                    </p>
                                    <p>
                                      Yes:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .currentPrices?.yesPrice
                                      }
                                    </p>
                                    <p>
                                      No:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .currentPrices?.noPrice
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      Total Liquidity:
                                    </p>
                                    <p>
                                      {
                                        test.result.updatedPredictionData
                                          .totalLiquidity
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      Your Investment:
                                    </p>
                                    <p>
                                      Total:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .userInvestment?.totalAmount
                                      }
                                    </p>
                                    <p>
                                      Yes:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .userInvestment?.yesAmount
                                      }
                                    </p>
                                    <p>
                                      No:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .userInvestment?.noAmount
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      Prediction Info:
                                    </p>
                                    <p>
                                      Title:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .predictionInfo?.title
                                      }
                                    </p>
                                    <p>
                                      Yes Liquidity:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .predictionInfo?.yesLiquidity
                                      }
                                    </p>
                                    <p>
                                      No Liquidity:{" "}
                                      {
                                        test.result.updatedPredictionData
                                          .predictionInfo?.noLiquidity
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          {test.result.updatedPredictionData?.error && (
                            <div className="bg-red-50 p-3 rounded">
                              <p className="text-red-700 text-sm">
                                Error getting updated data:{" "}
                                {test.result.updatedPredictionData.error}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                          {typeof test.result === "object"
                            ? JSON.stringify(test.result, null, 2)
                            : test.result}
                        </pre>
                      )}
                    </div>
                  )}

                  {test.error && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-red-600">Error:</p>
                      <p className="text-sm text-red-700 bg-red-100 p-2 rounded">
                        {test.error}
                      </p>
                    </div>
                  )}

                  {test.gasUsed && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Gas Used: {test.gasUsed}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Instructions
          </h3>
          <ul className="text-blue-700 space-y-1">
            <li>
              1. Connect your wallet and ensure you&apos;re on Sepolia testnet
            </li>
            <li>2. Make sure you have some Sepolia ETH for gas fees</li>
            <li>3. Ensure you have PyUSD tokens on Sepolia for testing</li>
            <li>
              4. Click &quot;Run All Tests&quot; to execute the complete test
              suite
            </li>
            <li>
              5. Tests will run in logical order: Basic Info → Create → View →
              Interact
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
