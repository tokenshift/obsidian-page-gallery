import type { Page } from './PageService'

export default class NestedCache<TValue> {
  page: Page | null = null

  _cache: Record<string, any> = {}
  _nested: Record<string, NestedCache<TValue>> = {}

  constructor (page: Page | null = null) {
    this.page = page
  }

  get mtime () { return this.page?.file.mtime }
  get size () { return this.page?.file.size }

  /** Returns a nested cache, invalidating it if the given page has
   * been updated since it was cached.
   */
  nested (page: Page) {
    const {
      file: {
        path,
        mtime,
        size
      }
    } = page

    if (path in this._nested
      && this._nested[path].mtime == mtime.toMillis()
      && this._nested[path].size == size) {
      return this._nested[path]
    } else {
      const cache = new NestedCache<TValue>(page)
      this._nested[path] = cache
      return cache
    }
  }

  fetch (key: string, fallback: () => TValue): TValue {
    if (key in this._cache) {
      return this._cache[key]
    }
    else {
      const result = fallback()
      this._cache[key] = result
      return result
    }
  }
}
