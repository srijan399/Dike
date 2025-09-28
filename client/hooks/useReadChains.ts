import { useReadContract } from "wagmi";
import { Dike_SEPOLIA_ADDRESS, DikeAbi } from "@/app/abi";

export default function useReadChains() {
    const { data: chains, isLoading: isChainsLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserChains",
    });
}
