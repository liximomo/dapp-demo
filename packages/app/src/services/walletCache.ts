const KEY = "wallet";

export function saveSelectedWallet(value: string) {
  localStorage.setItem(KEY, value);
}

export function getSelectedWallet() {
  return localStorage.getItem(KEY);
}

export function clear() {
  localStorage.removeItem(KEY);
}
