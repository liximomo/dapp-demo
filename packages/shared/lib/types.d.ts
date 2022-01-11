export declare type PartialKeys<T, K extends keyof T> = {
    [P in Exclude<keyof T, K>]: T[P];
} & {
    [P in K]?: T[P];
};
