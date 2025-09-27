export interface Prediction {
    id: number;
    creator: string;
    title: string;
    category: string;
    metadata: string;
    resolutionDate: number;
    initialLiquidity: number;
    yesLiquidity: number;
    noLiquidity: number;
    resolved: boolean;
    outcome: boolean;
    createdAt: number;
    active: boolean;
}
