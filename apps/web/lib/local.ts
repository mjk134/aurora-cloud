import { LocalStorageSchema } from "../types";

export function setTypedStorageItem<T extends keyof LocalStorageSchema>(
  key: T,
  value: LocalStorageSchema[T],
): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getTypedStorageItem<T extends keyof LocalStorageSchema>(
  key: T,
): LocalStorageSchema[T] | null {
  const item = window.localStorage.getItem(key);
  return !item ? null : (JSON.parse(item) as LocalStorageSchema[T]);
}
