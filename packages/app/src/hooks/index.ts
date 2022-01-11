import { useReducer } from "react";

export * from "./blockchain";
export * from "./wallet";
export * from "./token";

export function useRefresh() {
  const [token, dispatch] = useReducer(a => a * -1, 1);

  return {
    refreshToken: token,
    refresh: dispatch
  };
}
