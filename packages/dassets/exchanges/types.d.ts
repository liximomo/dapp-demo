import { IToken } from "../tokens/types";
export interface IFlip extends IToken {
    pid: number;
    address: string;
}
export interface IExchange {
    name: string;
    MasterChef: string;
    Factory: string;
    Router: string;
    LpTokens: {
        pid: number;
        address: string;
        name: string;
        symbol?: string;
    }[];
}
