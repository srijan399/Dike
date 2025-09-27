"use client";
import {
    DikeAbi,
    PYUSD_ABI,
    PYUSD_SEPOLIA_ADDRESS,
    Dike_SEPOLIA_ADDRESS,
} from "@/app/abi";
import { Button } from "@/components/ui/button";
import {
    useAccount,
    useBalance,
    useReadContract,
    useWriteContract,
} from "wagmi";
import useCreatePrediction from "@/hooks/createOpportunity";

export default function TestV2() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const createPrediction = useCreatePrediction();

    const balance = useBalance({
        chainId: 11155111,
        address: address,
        token: PYUSD_SEPOLIA_ADDRESS,
    });

    const approveWallet = async () => {
        const tx = await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "approve",
            args: ["0x4b0fe8d4512f94771d6b04c0bcd7602a0c095c16", "1000000000"],
        });
        console.log(tx);
    };

    const { data: allowance } = useReadContract({
        address: PYUSD_SEPOLIA_ADDRESS,
        abi: PYUSD_ABI,
        functionName: "allowance",
        args: [
            "0x05B3e60D51c5eDD49DE869bF74038c1323e2cA65",
            "0x3B2272d912290DC26CCbf550eb49eF539D9CFC6a",
        ],
    });

    const sendTokens = async () => {
        const tx = await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "transferFrom",
            args: [
                "0x3B2272d912290DC26CCbf550eb49eF539D9CFC6a",
                "0x4b0fe8D4512F94771D6B04c0BCD7602A0c095C16",
                "1000000",
            ],
        });
        console.log(tx);
    };

    const createPred = async () => {
        await createPrediction();
    };

    const { data: predictions, refetch: refetchPredictions } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getActivePredictions",
        args: [],
    });

    return (
        <>
            <div>TestV2</div>
            <Button onClick={() => console.log(balance.data)}>
                Check Balance
            </Button>

            <Button onClick={() => console.log(allowance)}>
                Check Allowance
            </Button>

            <Button onClick={() => approveWallet()}>Approve Wallet</Button>

            <Button onClick={() => sendTokens()}>Send Tokens</Button>

            <Button onClick={() => createPred()}>Create Prediction</Button>

            <Button onClick={() => refetchPredictions()}>
                Get Predictions
            </Button>
        </>
    );
}
