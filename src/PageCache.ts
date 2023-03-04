import type { Page } from './PageService'

export type CacheEntry<TValue> = {
  value: TValue
  mtime: number
  size: number
}

/** Helper class to cache arbitrary values until the page mtime or size changes. */
export default class PageCache<TValue> {
  _cache: Record<string, CacheEntry<TValue>> = {}

  async fetch (page: Page, fallback: () => Promise<TValue>): Promise<TValue> {
    const {
      path,
      mtime,
      size
    } = page.file

    const cached = this._cache[path] || null

    if (cached && mtime.toMillis() <= cached.mtime && size === cached.size) {
      return cached.value
    } else {
      delete this._cache[path]

      const value = await fallback()

      this._cache[path] = {
        mtime: mtime.toMillis(),
        size,
        value
      }

      return value
    }
  }
}
