const DEFAULT_CACHE_LIMIT = 1000

type CacheEntry<TValue> = {
  key: string
  value: TValue
  pred: CacheEntry<TValue> | null
  succ: CacheEntry<TValue> | null
}

export type Result<TValue> = { ok: true, value: TValue } | { ok: false }

function Value<TValue> (value: TValue): Result<TValue> {
  return { ok: true, value }
}

function Missing<TValue> (): Result<TValue> {
  return { ok: false }
}

export default class LRUCache<TValue> {
  _cache: Record<string, CacheEntry<TValue>> = {}
  _head: CacheEntry<TValue> | null = null
  _tail: CacheEntry<TValue> | null = null

  limit: number

  constructor (options: {
    limit?: number
  } = {}) {
    this.limit = options.limit || DEFAULT_CACHE_LIMIT
  }

  /** Removes the tail of the list until the total count is <= the limit. */
  _applyLimit () {
    while (this._tail && Object.keys(this._cache).length > this.limit) {
      const { key, pred } = this._tail

      // The tail's predecessor is now the tail and has no successor.
      if (pred) {
        pred.succ = null
        this._tail = pred
      } else {
        this._head = null
        this._tail = null
      }

      delete this._cache[key]
    }
  }

  /** Check whether the cache contains the given key. */
  contains (key: string): boolean {
    return key in this._cache
  }

  /** Get a cached value, if it exists. */
  get (key: string): Result<TValue> {
    if (this.contains(key)) {
      const { value } = this._cache[key]
      this.poke(key)
      return Value(value)
    } else {
      return Missing()
    }
  }

  /** Remove a key from the cache. */
  remove (key: string): boolean {
    if (!this.contains(key)) { return false }

    const entry = this._cache[key]
    const { pred, succ } = entry

    if (pred) { pred.succ = succ }
    else { this._head = succ }

    if (succ) { succ.pred = pred }
    else { this._tail = pred }

    return true
  }

  /** Update the least-recently-used timestamp of the given key. If the key
   * doesn't exist in the cache, this is ignored.
   */
  poke (key: string): boolean {
    if (!this.contains(key)) { return false }

    const entry = this._cache[key]

    this.remove(key)
    this.put(key, entry.value)

    return true
  }

  /** Insert a value into the cache, overwriting any existing value for the key
   * if there is one.
   */
  put (key: string, value: TValue) {
    if (this.contains(key)) { this.remove(key) }

    const entry = { key, value, pred: null, succ: this._head }
    this._cache[key] = entry

    if (this._head) { this._head.pred = entry }
    this._head = entry
    if (!this._tail) { this._tail = entry }

    this._applyLimit()
  }

  /** Gets a value from the cache if it exists, or calls the provided
   * fallback function and caches & returns its result.
   */
  fetch (key: string, fallback: () => TValue): TValue {
    const result = this.get(key)
    if (result.ok) { return result.value }

    const value = fallback()
    this.put(key, value)

    this._applyLimit()

    return value
  }
}
