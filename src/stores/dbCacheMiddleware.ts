// Purpose: Middleware to persist the state to both the Firestore database and the local storage.
// The local storage is used to cache the state and the Firestore database is used to let the
// user access the state from different devices.
//
// This code is a modified version of the original code from zustand persist middleware.
// The original code can be found at: https://github.com/pmndrs/zustand/blob/main/src/middleware/persist.ts
//
// MIT License
//
// Copyright (c) 2019 Paul Henschel, original zustand persist middleware
// Copyright (c) 2024 Matteus Magnusson, Firestore and cache middleware
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { doc, DocumentData, DocumentReference, getFirestore, setDoc, getDoc } from "firebase/firestore"
import { StateCreator, StoreApi, StoreMutatorIdentifier } from "zustand"

export interface StateStorage {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => unknown | Promise<unknown>
  removeItem: (name: string) => unknown | Promise<unknown>
}

export type StorageValue<S> = {
  state: S
  version?: number
  cacheExpiry?: number
}

export interface PersistStorage<S> {
  getItem: (name: string) => StorageValue<S> | null | Promise<StorageValue<S> | null>
  setItem: (name: string, value: StorageValue<S>) => unknown | Promise<unknown>
  removeItem: (name: string) => unknown | Promise<unknown>
}

type JsonStorageOptions = {
  reviver?: (key: string, value: unknown) => unknown
  replacer?: (key: string, value: unknown) => unknown
}

export function createJSONStorage<S>(
  getStorage: () => StateStorage,
  options?: JsonStorageOptions
): PersistStorage<S> | undefined {
  let storage: StateStorage | undefined
  try {
    storage = getStorage()
  } catch (_e) {
    // prevent error if the storage is not defined (e.g. when server side rendering a page)
    return
  }
  const persistStorage: PersistStorage<S> = {
    getItem: (name) => {
      const parse = (str: string | null) => {
        if (str === null) {
          return null
        }
        return JSON.parse(str, options?.reviver) as StorageValue<S>
      }
      const str = (storage as StateStorage).getItem(name) ?? null
      if (str instanceof Promise) {
        return str.then(parse)
      }
      return parse(str)
    },
    setItem: (name, newValue) => (storage as StateStorage).setItem(name, JSON.stringify(newValue, options?.replacer)),
    removeItem: (name) => (storage as StateStorage).removeItem(name),
  }
  return persistStorage
}

export interface PersistOptions<S, PersistedState = S> {
  /** Name of the storage (must be unique) */
  name: string
  /**
   * User to save the state to the Firestore database. If not set the state will be saved to the local storage only.
   */
  userId?: string
  /**
   * cacheExpiryInMinutes is the time in minutes that the cache will be valid for.
   * After it expires, it will try to fetch and restore the state from the Firestore database.
   *
   * @default 30 minutes
   */
  cacheExpiryInMinutes?: number
  /**
   * Use a custom persist storage.
   *
   * Combining `createJSONStorage` helps creating a persist storage
   * with JSON.parse and JSON.stringify.
   *
   * @default createJSONStorage(() => localStorage)
   */
  storage?: PersistStorage<PersistedState> | undefined
  /**
   * Filter the persisted value.
   *
   * @params state The state's value
   */
  partialize?: (state: S) => PersistedState
  /**
   * A function returning another (optional) function.
   * The main function will be called before the state rehydration.
   * The returned function will be called after the state rehydration or when an error occurred.
   */
  onRehydrateStorage?: (state: S) => ((state?: S, error?: unknown) => void) | void
  /**
   * If the stored state's version mismatch the one specified here, the storage will not be used.
   * This is useful when adding a breaking change to your store.
   */
  version?: number
  /**
   * A function to perform persisted state migration.
   * This function will be called when persisted state versions mismatch with the one specified here.
   */
  migrate?: (persistedState: unknown, version: number) => PersistedState | Promise<PersistedState>
  /**
   * A function to perform custom hydration merges when combining the stored state with the current one.
   * By default, this function does a shallow merge.
   */
  merge?: (persistedState: unknown, currentState: S) => S

  /**
   * An optional boolean that will prevent the persist middleware from triggering hydration on initialization,
   * This allows you to call `rehydrate()` at a specific point in your apps rendering life-cycle.
   *
   * This is useful in SSR application.
   *
   * @default false
   */
  skipHydration?: boolean
}

type PersistListener<S> = (state: S) => void

type StorePersist<S, Ps> = {
  persist: {
    setOptions: (options: Partial<PersistOptions<S, Ps>>) => void
    clearStorage: () => void
    rehydrate: () => Promise<void> | void
    hasHydrated: () => boolean
    onHydrate: (fn: PersistListener<S>) => () => void
    onFinishHydration: (fn: PersistListener<S>) => () => void
    getOptions: () => Partial<PersistOptions<S, Ps>>
  }
}

type Thenable<Value> = {
  then<V>(onFulfilled: (value: Value) => V | Promise<V> | Thenable<V>): Thenable<V>
  catch<V>(onRejected: (reason: Error) => V | Promise<V> | Thenable<V>): Thenable<V>
}

const toThenable =
  <Result, Input>(fn: (input: Input) => Result | Promise<Result> | Thenable<Result>) =>
  (input: Input): Thenable<Result> => {
    try {
      const result = fn(input)
      if (result instanceof Promise) {
        return result as Thenable<Result>
      }
      return {
        then(onFulfilled) {
          return toThenable(onFulfilled)(result as Result)
        },
        catch(_onRejected) {
          return this as Thenable<any>
        },
      }
    } catch (e: any) {
      return {
        then(_onFulfilled) {
          return this as Thenable<any>
        },
        catch(onRejected) {
          return toThenable(onRejected)(e)
        },
      }
    }
  }

const newImpl: PersistImpl = (config, baseOptions) => (set, get, api) => {
  type S = ReturnType<typeof config>
  let options = {
    storage: createJSONStorage<S>(() => localStorage),
    partialize: (state: S) => state,
    cacheExpiry: 0,
    version: 0,
    merge: (persistedState: unknown, currentState: S) => ({
      ...currentState,
      ...(persistedState as object),
    }),
    ...baseOptions,
  }

  let hasHydrated = false
  const hydrationListeners = new Set<PersistListener<S>>()
  const finishHydrationListeners = new Set<PersistListener<S>>()
  let storage = options.storage

  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        )
        set(...args)
      },
      get,
      api
    )
  }

  const calculateCacheExpiryTime = (): number => {
    const expiryInMinutes = options.cacheExpiryInMinutes ?? 30
    return new Date().getTime() + expiryInMinutes * 60000
  }

  const setItem = () => {
    const state = options.partialize({ ...get() })

    // Save to Firestore
    if (options.userId) {
      setDoc(docRef(), convertToFSObject(state))
    }

    return (storage as PersistStorage<S>).setItem(options.name, {
      state,
      version: options.version,
      cacheExpiry: calculateCacheExpiryTime(),
    })
  }

  const convertToFSObject = (state: S): StorageValue<S> => {
    // Remove functions from the state
    const fsState = { ...state }
    for (const key in fsState) {
      if (typeof fsState[key] === "function") {
        delete fsState[key]
      }
    }

    return {
      state: fsState,
      version: options.version,
    }
  }

  const docRef = (): DocumentReference<DocumentData, DocumentData> => {
    if (!options.userId) {
      return doc(getFirestore(), "users", "default", "data", options.name)
    }

    return doc(getFirestore(), "users", options.userId, "data", options.name)
  }

  const updateLocalCache = async () => {
    getDoc(docRef()).then(async (doc) => {
      if (doc.exists()) {
        const data = doc.data() as StorageValue<S>
        if (data) {
          // Migrate the data
          if (data.version !== options.version && options.migrate) {
            const version = data.version ?? 0
            const result = options.migrate(data.state, version)
            if (result instanceof Promise) {
              data.state = await result
            } else {
              data.state = result
            }
          }

          // Update local cache
          ;(storage as PersistStorage<S>).setItem(options.name, {
            state: data.state,
            version: options.version,
            cacheExpiry: calculateCacheExpiryTime(),
          })

          set(() => {
            return {
              ...data.state,
            }
          })
        }
      }
    })
  }

  const savedSetState = api.setState

  api.setState = (state, replace) => {
    savedSetState(state, replace)
    void setItem()
  }

  const configResult = config(
    (...args) => {
      set(...args)
      void setItem()
    },
    get,
    api
  )

  api.getInitialState = () => configResult

  // a workaround to solve the issue of not storing rehydrated state in sync storage
  // the set(state) value would be later overridden with initial state by create()
  // to avoid this, we merge the state from localStorage into the initial state.
  let stateFromStorage: S | undefined

  // rehydrate initial state with existing stored state
  const hydrate = () => {
    if (!storage) return

    // On the first invocation of 'hydrate', state will not yet be defined (this is
    // true for both the 'asynchronous' and 'synchronous' case). Pass 'configResult'
    // as a backup  to 'get()' so listeners and 'onRehydrateStorage' are called with
    // the latest available state.

    hasHydrated = false
    hydrationListeners.forEach((cb) => cb(get() ?? configResult))

    const postRehydrationCallback = options.onRehydrateStorage?.(get() ?? configResult) || undefined

    // bind is used to avoid `TypeError: Illegal invocation` error
    return toThenable(storage.getItem.bind(storage))(options.name)
      .then((deserializedStorageValue) => {
        if (deserializedStorageValue) {
          if (
            typeof deserializedStorageValue.version === "number" &&
            deserializedStorageValue.version !== options.version
          ) {
            if (options.migrate) {
              return [true, options.migrate(deserializedStorageValue.state, deserializedStorageValue.version)] as const
            }
            console.error(`State loaded from storage couldn't be migrated since no migrate function was provided`)
          } else {
            // Update local cache if has expired
            const cacheExpiry = deserializedStorageValue.cacheExpiry ?? 0
            if (cacheExpiry < new Date().getTime()) {
              updateLocalCache()
            }
            return [false, deserializedStorageValue.state] as const
          }
        } else {
          updateLocalCache()
        }
        return [false, undefined] as const
      })
      .then((migrationResult) => {
        const [migrated, migratedState] = migrationResult
        stateFromStorage = options.merge(migratedState as S, get() ?? configResult)

        set(stateFromStorage as S, true)
        if (migrated) {
          return setItem()
        }
      })
      .then(() => {
        // TODO: In the asynchronous case, it's possible that the state has changed
        // since it was set in the prior callback. As such, it would be better to
        // pass 'get()' to the 'postRehydrationCallback' to ensure the most up-to-date
        // state is used. However, this could be a breaking change, so this isn't being
        // done now.
        postRehydrationCallback?.(stateFromStorage, undefined)

        // It's possible that 'postRehydrationCallback' updated the state. To ensure
        // that isn't overwritten when returning 'stateFromStorage' below
        // (synchronous-case only), update 'stateFromStorage' to point to the latest
        // state. In the asynchronous case, 'stateFromStorage' isn't used after this
        // callback, so there's no harm in updating it to match the latest state.
        stateFromStorage = get()
        hasHydrated = true
        finishHydrationListeners.forEach((cb) => cb(stateFromStorage as S))
      })
      .catch((e: Error) => {
        postRehydrationCallback?.(undefined, e)
      })
  }

  ;(api as StoreApi<S> & StorePersist<S, S>).persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions,
      }

      if (newOptions.storage) {
        storage = newOptions.storage
      }
    },
    clearStorage: () => {
      storage?.removeItem(options.name)
    },
    getOptions: () => options,
    rehydrate: () => hydrate() as Promise<void>,
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb)

      return () => {
        hydrationListeners.delete(cb)
      }
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb)

      return () => {
        finishHydrationListeners.delete(cb)
      }
    },
  }

  if (!options.skipHydration) {
    hydrate()
  }

  return stateFromStorage || configResult
}

const persistImpl: PersistImpl = (config, baseOptions) => {
  return newImpl(config, baseOptions)
}

type Persist = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  U = T,
>(
  initializer: StateCreator<T, [...Mps, ["zustand/persist", unknown]], Mcs>,
  options: PersistOptions<T, U>
) => StateCreator<T, Mps, [["zustand/persist", U], ...Mcs]>

type PersistImpl = <T>(
  storeInitializer: StateCreator<T, [], []>,
  options: PersistOptions<T, T>
) => StateCreator<T, [], []>

export const persistDBAndCache = persistImpl as unknown as Persist
