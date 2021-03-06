import { Entries } from '../types/entry-type'
import { groupParamsByKey } from './url-util'

export interface LocalStorage {
  filters?: Record<string, any>
}

export type LocalStorageKeys = keyof LocalStorage

const STORE_FORMAT_VERSION = chrome.runtime.getManifest()?.version ?? '1.0.0'

export const setStoredFilters = (
  filters: Record<string, any>
): Promise<void> => {
  const vals: LocalStorage = { filters }
  return new Promise((resolve) => {
    chrome.storage.local.set(vals, resolve)
  })
}

export const getStoredFilters = (): Promise<Record<string, any>> => {
  const keys: LocalStorageKeys[] = ['filters']
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.filters ?? {})
    })
  })
}

const upsertParams = (entries: Entries, params: Record<string, any>) => {
  const localEntries = entries || []
  Object.entries(params).map(([key, value]) => {
    const idx = localEntries?.findIndex(
      (obj) => obj.paramKey === key && obj.paramValue === value
    )

    if (idx > -1) {
      localEntries[idx] = {
        ...localEntries[idx],
        version: STORE_FORMAT_VERSION,
        count: localEntries[idx].count + 1,
        lastUpdatedAt: Date.now()
      }
    } else {
      localEntries.push({
        uuid: crypto.randomUUID(),
        createdAt: Date.now(),
        version: STORE_FORMAT_VERSION,
        paramKey: key,
        paramValue: value,
        count: 1,
        lastUpdatedAt: Date.now()
      })
    }
  })
  return localEntries
}

const pathnameToJsonRecursive = (
  json: Record<string, any>,
  arr: string[],
  params: Record<string, any>
): Record<string, any> | undefined => {
  // Get the first element of array
  const elem = arr.shift()

  // Exit condition
  if (!elem) return

  // If JSON key exists, use the existing object, otherwise an empty object
  // is created. Or upserting param count if json[elem] is an array.
  if (!json[elem] || (Array.isArray(json[elem]) && json[elem].length >= 0)) {
    json[elem] = arr.length === 0 ? upsertParams(json[elem], params) : {}
  }

  return pathnameToJsonRecursive(json[elem], arr, params)
}

export const upsertFilter = (url: string) => {
  const { hostname, pathname, search } = new URL(url)
  const params = new URLSearchParams(search)
  const groupedParams = groupParamsByKey(params)

  const subdir = pathname.split('/').filter((v) => !!v)
  getStoredFilters().then((filters) => {
    if (!filters[hostname]) {
      filters[hostname] = {}
    }
    pathnameToJsonRecursive(filters[hostname], subdir, groupedParams)
    setStoredFilters(filters)
  })
}
