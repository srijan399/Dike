import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
} from "wagmi";
import { DikeAbi, Dike_SEPOLIA_ADDRESS } from "@/app/abi";

export type PredictionStruct = {
  id: bigint;
  creator: `0x${string}`;
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
};

export type OpportunityNode = {
  id: string; // prediction id as string
  title: string;
  type: "root" | "opportunity" | "sub-opportunity";
  ownership: number; // percent 0..100
  value: number; // current position value for user
  description?: string;
  valuation: { positive: number; negative: number }; // normalized 0..1
};

export type ChainTree = {
  parentId: string;
  title: string;
  description?: string;
  nodes: OpportunityNode[];
  edges: Array<{ from: string; to: string }>;
};

export type VerseSummary = {
  id: string; // parent id
  title: string;
  ownership: number;
  totalValue: number;
  icon: string;
  status: "active" | "resolving" | "pending";
  opportunities: number; // number of nodes in tree
  universeDescription: string;
};

type IPFSMetadata = {
  title?: string;
  category?: string;
  description?: string;
  tags?: string[];
  image?: string;
  createdAt?: number;
  version?: string;
};

function safeDiv(n: bigint, d: bigint): number {
  if (d === BigInt(0)) return 0;
  // return as floating number with 6 decimals precision to avoid overflow
  const scale = BigInt(1000000);
  return Number((n * scale) / d) / 1_000_000;
}

function bi(n?: bigint | null): bigint {
  return typeof n === "bigint" ? n : BigInt(0);
}

export default function useOpportunitiesTree() {
  const { address } = useAccount();

  // 1) All active predictions (for labels/metadata and fallback when not connected)
  const {
    data: activePredsData,
    isLoading: loadingActive,
    refetch: refetchActive,
  } = useReadContract({
    address: Dike_SEPOLIA_ADDRESS,
    abi: DikeAbi,
    functionName: "getActivePredictions",
    args: [],
  });

  const activePredictions = (activePredsData as PredictionStruct[] | undefined) || [];

  // 2) User parent prediction IDs (roots of chains)
  const {
    data: parentIdsData,
    isLoading: loadingParents,
  } = useReadContract({
    address: Dike_SEPOLIA_ADDRESS,
    abi: DikeAbi,
    functionName: "getUserParentPredictionIds",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const parentIds = (parentIdsData as bigint[] | undefined) || [];

  // 3) For each parent, fetch collateral position to get child IDs
  const collateralCalls = address
    ? parentIds.map((pid) => ({
        address: Dike_SEPOLIA_ADDRESS as any,
        abi: DikeAbi as any,
        functionName: "getUserCollateralPosition",
        args: [address, pid] as const,
      }))
    : [];

  const { data: collateralPositions, isLoading: loadingCollateral } =
    useReadContracts({
      contracts: collateralCalls as any,
      query: { enabled: !!address && parentIds.length > 0 },
    });

  const allInvolvedIds = useMemo(() => {
    const set = new Set<string>();
    for (const pid of parentIds) set.add(pid.toString());
    if (collateralPositions) {
      for (const res of collateralPositions) {
        if (res.status === "success" && res.result) {
          const anyRes = res.result as any;
          // Support both named property and tuple index position for childIds (3rd return value)
          const childArr: unknown = anyRes?.childIds ?? anyRes?.[2];
          if (Array.isArray(childArr)) {
            for (const cid of childArr as bigint[]) set.add(cid.toString());
          }
        }
      }
    }
    // Fallback: if user not connected, include some active predictions
    if (set.size === 0 && activePredictions.length > 0) {
      for (const p of activePredictions.slice(0, 8)) set.add(p.id.toString());
    }
    return Array.from(set).map((s) => BigInt(s));
  }, [parentIds, collateralPositions, activePredictions]);

  // 4) Batched fetches for all involved prediction IDs
  const predictionCalls = allInvolvedIds.map((id) => ({
    address: Dike_SEPOLIA_ADDRESS as any,
    abi: DikeAbi as any,
    functionName: "getPrediction",
    args: [id] as const,
  }));

  const priceCalls = allInvolvedIds.map((id) => ({
    address: Dike_SEPOLIA_ADDRESS as any,
    abi: DikeAbi as any,
    functionName: "getCurrentPrices",
    args: [id] as const,
  }));

  const userTotalCalls = address
    ? allInvolvedIds.map((id) => ({
        address: Dike_SEPOLIA_ADDRESS as any,
        abi: DikeAbi as any,
        functionName: "getUserTotalInvestmentInPrediction",
        args: [address, id] as const,
      }))
    : [];

  const totalLiquidityCalls = allInvolvedIds.map((id) => ({
    address: Dike_SEPOLIA_ADDRESS as any,
    abi: DikeAbi as any,
    functionName: "getTotalLiquidity",
    args: [id] as const,
  }));

  const positionValueCalls = address
    ? allInvolvedIds.map((id) => ({
        address: Dike_SEPOLIA_ADDRESS as any,
        abi: DikeAbi as any,
        functionName: "getCurrentPositionValue",
        args: [address, id] as const,
      }))
    : [];

  const { data: predictionResults, isLoading: loadingPredictions } =
    useReadContracts({ contracts: predictionCalls as any, query: { enabled: allInvolvedIds.length > 0 } });

  const { data: priceResults, isLoading: loadingPrices } = useReadContracts({
    contracts: priceCalls as any,
    query: { enabled: allInvolvedIds.length > 0 },
  });

  const { data: userTotalsResults, isLoading: loadingUserTotals } =
    useReadContracts({
      contracts: userTotalCalls as any,
      query: { enabled: !!address && allInvolvedIds.length > 0 },
    });

  const { data: totalLiquidityResults, isLoading: loadingTotalLiquidity } =
    useReadContracts({
      contracts: totalLiquidityCalls as any,
      query: { enabled: allInvolvedIds.length > 0 },
    });

  const { data: positionValueResults, isLoading: loadingPositionValues } =
    useReadContracts({
      contracts: positionValueCalls as any,
      query: { enabled: !!address && allInvolvedIds.length > 0 },
    });

  // --- IPFS metadata fetching (CID -> JSON) ---
  const [ipfsMeta, setIpfsMeta] = useState<Record<string, IPFSMetadata | null>>({});

  const uniqueCids = useMemo(() => {
    const set = new Set<string>();
    for (const p of activePredictions) {
      const cid = (p.metadata || "").trim();
      if (cid) set.add(cid);
    }
    // Also include CIDs from fetched predictions map
    // Note: predById is defined later; we can derive CIDs from predictionResults directly, too.
    (predictionResults || []).forEach((res) => {
      if (res.status === "success" && res.result) {
        const pred = res.result as any;
        const cid = (pred?.metadata || "").trim();
        if (cid) set.add(cid);
      }
    });
    return Array.from(set);
  }, [activePredictions, predictionResults]);

  useEffect(() => {
    const toFetch = uniqueCids.filter((cid) => !(cid in ipfsMeta));
    if (toFetch.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries: Array<[string, IPFSMetadata | null]> = await Promise.all(
        toFetch.map(async (cid) => {
          try {
            const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
            if (!res.ok) return [cid, null] as [string, IPFSMetadata | null];
            const json = (await res.json()) as IPFSMetadata;
            return [cid, json];
          } catch {
            return [cid, null];
          }
        })
      );
      if (!cancelled) setIpfsMeta((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    })();
    return () => {
      cancelled = true;
    };
  }, [uniqueCids, ipfsMeta]);

  const getMetaForPrediction = (idStr: string): IPFSMetadata | undefined => {
    const p = predById.get(idStr) || activePredictions.find((x) => x.id.toString() === idStr);
    const cid = (p?.metadata || "").trim();
    if (!cid) return undefined;
    return ipfsMeta[cid] || undefined;
  };

  // Build a reliable map: parentId -> childIds from collateralPositions
  const childrenByParentId = useMemo(() => {
    const map = new Map<string, bigint[]>();
    if (!collateralPositions) return map;
    collateralPositions.forEach((res, i) => {
      if (res.status === "success" && res.result) {
        const anyRes = res.result as any;
        const parent = anyRes?.parentId ?? anyRes?.[0] ?? parentIds[i];
        const rawChildIds = anyRes?.childIds ?? anyRes?.[2];
        const childIds: bigint[] = Array.isArray(rawChildIds) ? (rawChildIds as bigint[]) : [];
        const key = (typeof parent === "bigint" ? parent : BigInt(parent ?? 0)).toString();
        map.set(key, childIds);
      }
    });
    return map;
  }, [collateralPositions, parentIds]);

  // Assemble lookup maps
  const predById = useMemo(() => {
    const map = new Map<string, PredictionStruct>();
    if (!predictionResults) return map;
    predictionResults.forEach((res, i) => {
      if (res.status === "success" && res.result) {
        map.set(allInvolvedIds[i].toString(), res.result as unknown as PredictionStruct);
      }
    });
    return map;
  }, [predictionResults, allInvolvedIds]);

  const priceById = useMemo(() => {
    const map = new Map<string, { yesPrice: bigint; noPrice: bigint }>();
    if (!priceResults) return map;
    priceResults.forEach((res, i) => {
      if (res.status === "success" && res.result) {
        const [yesPrice, noPrice] = res.result as unknown as [bigint, bigint];
        map.set(allInvolvedIds[i].toString(), { yesPrice, noPrice });
      }
    });
    return map;
  }, [priceResults, allInvolvedIds]);

  const userTotalsById = useMemo(() => {
    const map = new Map<string, { totalAmount: bigint; yesAmount: bigint; noAmount: bigint }>();
    if (!userTotalsResults) return map;
    userTotalsResults.forEach((res, i) => {
      if (res.status === "success" && res.result) {
        const r = res.result as unknown as { totalAmount: bigint; yesAmount: bigint; noAmount: bigint };
        map.set(allInvolvedIds[i].toString(), r);
      }
    });
    return map;
  }, [userTotalsResults, allInvolvedIds]);

  const totalLiquidityById = useMemo(() => {
    const map = new Map<string, bigint>();
    if (!totalLiquidityResults) return map;
    totalLiquidityResults.forEach((res, i) => {
      if (res.status === "success" && typeof res.result === "bigint") {
        map.set(allInvolvedIds[i].toString(), res.result as bigint);
      }
    });
    return map;
  }, [totalLiquidityResults, allInvolvedIds]);

  const positionValueById = useMemo(() => {
    const map = new Map<string, bigint>();
    if (!positionValueResults) return map;
    positionValueResults.forEach((res, i) => {
      if (res.status === "success" && typeof res.result === "bigint") {
        map.set(allInvolvedIds[i].toString(), res.result as bigint);
      }
    });
    return map;
  }, [positionValueResults, allInvolvedIds]);

  // Build trees per parent
  const trees: ChainTree[] = useMemo(() => {
    const out: ChainTree[] = [];
    // If user not connected, surface standalone active predictions as single-node trees
    if (!address || parentIds.length === 0) {
      for (const p of activePredictions) {
        const idStr = p.id.toString();
        const price = priceById.get(idStr);
        const yes = bi(price?.yesPrice);
        const no = bi(price?.noPrice);
        const sum = yes + no;
  const pos = sum === BigInt(0) ? 0.5 : safeDiv(yes, sum);
        const neg = 1 - pos;
        const userTotals = userTotalsById.get(idStr);
  const totalLiq = totalLiquidityById.get(idStr) || BigInt(0);
  const ownership = totalLiq === BigInt(0) ? 0 : Math.min(100, Math.max(0, safeDiv(bi(userTotals?.totalAmount), totalLiq) * 100));
  const value = Number(positionValueById.get(idStr) || BigInt(0));
        const meta = getMetaForPrediction(idStr);
        out.push({
          parentId: idStr,
          title: p.title,
          description: meta?.description || p.category,
          nodes: [
            {
              id: idStr,
              title: p.title,
              type: "root",
              ownership,
              value,
              description: meta?.description || p.category,
              valuation: { positive: pos, negative: neg },
            },
          ],
          edges: [],
        });
      }
      return out;
    }

    // Connected user: construct from collateral positions
    for (let i = 0; i < parentIds.length; i++) {
      const parentId = parentIds[i];
      const parentIdStr = parentId.toString();
      const pred = predById.get(parentIdStr) || activePredictions.find((p) => p.id === parentId);
      if (!pred) continue;
      const parentMeta = getMetaForPrediction(parentIdStr);
      const childIds: bigint[] = childrenByParentId.get(parentIdStr) || [];

      const nodeIds = [parentIdStr, ...childIds.map((c) => c.toString())];
      const nodes: OpportunityNode[] = nodeIds.map((idStr, idx) => {
        const pred = predById.get(idStr) || activePredictions.find((p) => p.id.toString() === idStr);
        const meta = getMetaForPrediction(idStr);
        const price = priceById.get(idStr);
        const yes = bi(price?.yesPrice);
        const no = bi(price?.noPrice);
        const sum = yes + no;
  const pos = sum === BigInt(0) ? 0.5 : safeDiv(yes, sum);
        const neg = 1 - pos;
        const userTotals = userTotalsById.get(idStr);
  const totalLiq = totalLiquidityById.get(idStr) || BigInt(0);
  const ownership = totalLiq === BigInt(0) ? 0 : Math.min(100, Math.max(0, safeDiv(bi(userTotals?.totalAmount), totalLiq) * 100));
  const value = Number(positionValueById.get(idStr) || BigInt(0));
        return {
          id: idStr,
          title: pred?.title || `Prediction #${idStr}`,
          type: idx === 0 ? "root" : "opportunity",
          ownership,
          value,
          description: meta?.description || pred?.category || "",
          valuation: { positive: pos, negative: neg },
        };
      });

      const edges = childIds.map((cid) => ({ from: parentIdStr, to: cid.toString() }));

      out.push({
        parentId: parentIdStr,
        title: pred.title,
        description: parentMeta?.description || pred.category,
        nodes,
        edges,
      });
    }

    return out;
  }, [
    address,
    parentIds,
    collateralPositions,
    activePredictions,
    predById,
    priceById,
    userTotalsById,
    totalLiquidityById,
    positionValueById,
  ]);

  // Summaries to feed Verse cards
  const verses: VerseSummary[] = useMemo(() => {
    return trees.map((tree) => {
      const root = tree.nodes.find((n) => n.type === "root") || tree.nodes[0];
      const nowSec = Math.floor(Date.now() / 1000);
      const p = predById.get(tree.parentId);
      const status: VerseSummary["status"] = p
        ? p.resolved
          ? "pending"
          : Number(p.resolutionDate) - nowSec < 7 * 24 * 3600
          ? "resolving"
          : "active"
        : "active";
      return {
        id: tree.parentId,
        title: tree.title,
        ownership: Math.round(root?.ownership || 0),
        totalValue: Math.round(root?.value || 0),
        icon: "🔮",
        status,
        opportunities: tree.nodes.length - 1, // children count
        universeDescription: tree.description || "",
      };
    });
  }, [trees, predById]);

  const treesByParent = useMemo(() => {
    const map = new Map<string, ChainTree>();
    for (const t of trees) map.set(t.parentId, t);
    return map;
  }, [trees]);

  const isLoading =
    loadingActive ||
    loadingParents ||
    loadingCollateral ||
    loadingPredictions ||
    loadingPrices ||
    loadingUserTotals ||
    loadingTotalLiquidity ||
    loadingPositionValues;

  return {
    activePredictions,
    parentIds: parentIds.map((x) => x.toString()),
    trees,
    treesByParent,
    verses,
    isLoading,
    refetchActive,
  };
}
