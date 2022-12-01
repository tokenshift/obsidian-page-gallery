import type { Page, Tile, TileCache } from "./TileWrangler";

type CacheKey = string

type CacheEntry = {
  tile: Tile
  mtime: number
  size: number
}

export default class MemoryTileCache implements TileCache {
  _cache: Record<CacheKey, CacheEntry>

  constructor () {
    this._cache = {}
  }

  async fetch (page: Page, fallback: () => Promise<Tile>): Promise<Tile> {
    const {
      path,
      mtime,
      size
    } = page.file


    const cached = this._cache[path] || null

    if (cached && mtime.toMillis() <= cached.mtime && size === cached.size) {
      return cached.tile
    } else {
      delete this._cache[path]

      const tile = await fallback()
      this._cache[path] = {
        mtime: mtime.toMillis(),
        size,
        tile
      }

      return tile
    }
  }
}
