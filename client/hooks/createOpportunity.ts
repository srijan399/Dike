import {
    Dike_SEPOLIA_ADDRESS,
    DikeAbi,
    PYUSD_ABI,
    PYUSD_SEPOLIA_ADDRESS,
} from "@/app/abi";
import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";

const useCreatePrediction = () => {
    const { writeContractAsync } = useWriteContract();
    const { address } = useAccount();

    const createFunction = async () => {
        await writeContractAsync({
            address: Dike_SEPOLIA_ADDRESS,
            abi: DikeAbi,
            functionName: "createPrediction",
            args: [
                "Title",
                "Category",
                "metadata",
                1759996535,
                parseUnits("10", 6),
            ],
        });
    };

    return createFunction;
};

export default useCreatePrediction;
