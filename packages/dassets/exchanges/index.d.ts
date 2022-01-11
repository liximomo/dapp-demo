import { IFlip, IExchange } from "./types";
import { GetterOverridesOptions } from "../types";
export type { IFlip, IExchange };
export declare function getExchange(exchange: string, options?: GetterOverridesOptions): IExchange;
export declare function getFlip(exchange: string, id: string, options?: GetterOverridesOptions): IFlip;
