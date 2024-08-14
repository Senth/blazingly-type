import { StateCreator } from "zustand";

export interface MiddlewareOptions {
  name: string; // Needs to be unique for each instance
  cacheExpiryInMinutes?: number; // Default is 30 minutes
}

export function dbCacheMiddleware<T extends unknown>(
  config: StateCreator<T>,
  options: MiddlewareOptions,
): StateCreator<T> {
  return (set, get, api) =>
    config(
      (args) => {
        // Proceed with the standard operation
        set(args);

        // Defer the execution of saving to cache and DB to avoid blocking UI updates
        setTimeout(() => {
          const state = get();
          updateLocalStorage(state, options.name);
          updateFirestore(state, options.name);
        }, 0);
      },
      get,
      api,
    );
}

function updateLocalStorage<T>(state: T, name: string) {
  localStorage.setItem(name, JSON.stringify(state));
}

function updateFirestore<T>(state: T, name: string) {
  // TODO Update Firestore here
}

function readFromLocalStorage<T>(name: string): T | undefined {
  const item = localStorage.getItem(name);
  if (!item) return undefined;

  return JSON.parse(item) as T;
}

function readFromFirestore<T>(name: string): T | undefined {
  // Read from Firestore here
  return undefined;
}
