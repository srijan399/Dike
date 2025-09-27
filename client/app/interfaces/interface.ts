export interface Prediction {
    id: number;
    creator: string;
    title: string;
    category: string;
    metadata: string;
    resolutionDate: number | bigint;
    initialLiquidity: number | bigint;
    yesLiquidity: number | bigint;
    noLiquidity: number | bigint;
    resolved: boolean;
    outcome: boolean;
    createdAt: number | bigint;
    active: boolean;
}
