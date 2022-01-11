export declare type Config = Record<string, any>;
export declare function setConfig(config: Config): void;
export declare function getConfig<T = any>(): T;
export declare function getConfig<T = any>(path: string, config?: Record<string, any>): T;
