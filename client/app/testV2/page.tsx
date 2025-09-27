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

export default function TestV2() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

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
            args: [address, "100000000"],
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
        </>
    );
}
