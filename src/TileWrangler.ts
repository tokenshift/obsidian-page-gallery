import mime from 'mime'
import objectPath from 'object-path'

import { Component, MarkdownPreviewView, TFile } from 'obsidian'
import type { DataviewApi } from "obsidian-dataview"

import type PageGalleryPlugin from './PageGalleryPlugin'

export const IMG_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp'
]

export type TileGroup = {
  name: string | null
  href?: string
  tiles: Tile[]
}

export type Tile = {
  group: string

  href: string
  filename: string
  path: string

  image: {
    src: string | null
    size: string | null
    position: string | null
    repeat: string | null
  }

  fields: Field[]
}

export type Field = {
  expression: string
  value: string
  html: string
}

export type TileWranglerOptions = {
  parentPage: Page
  plugin: PageGalleryPlugin
  component: Component
  api: DataviewApi

  from: string | null
  where: string | null
  limit: number | null
  fields: string[]

  groupBy: string | null
  sortBy: string[]
}

export type Page = Record<string, any>

type PageWithFieldValues = {
  page: Page,
  fields: Record<string, any>
}
export default class TileWrangler {
  parentPage: Page
  plugin: PageGalleryPlugin
  component: Component
  api: DataviewApi

  from: string | null
  where: string | null
  limit: number | null
  fields: string[]
  groupBy: string | null

  _filter: {
    raw: string
    parsed: string[]
  }

  _sortBy: { field: string, reverse: boolean }[]

  constructor (options: TileWranglerOptions) {
    this.parentPage = options.parentPage
    this.plugin = options.plugin
    this.component = options.component
    this.api = options.api
    this.from = options.from || null
    this.where = options.where || null
    this.limit = options.limit
    this.fields = options.fields
    this.groupBy = options.groupBy || null
    this.sortBy = options.sortBy || []

    this._filter = {
      raw: '',
      parsed: []
    }
  }

  get filter (): string { return this._filter.raw }
  set filter (input: string) {
    this._filter.raw = input.trim()
    this._filter.parsed = this._filter.raw.split(/\s+/).map(p => p.toLowerCase())
  }

  set sortBy (fields: string[]) {
    this._sortBy = fields
      .map(f => f.trim().toLowerCase())
      .map(field => field.startsWith('-')
        ? { field: field.substring(1), reverse: true }
        : { field, reverse: false })
  }

  async getTileGroups (): Promise<TileGroup[]> {
    // Get all pages matching the `from` query and `where` clause,
    // filtered by path and/or tags.
    const pages = this.getFilteredPages()

    // Compute the `groupBy` and `sortBy` values for each page.
    const pagesWithMeta = await Promise.all(
      pages.map(async page => ({
        page,
        fields: this.getFieldValues(page)
      })))

    // Sort the pages based on their `groupBy` and `sortBy` metadata.
    const sortFn = this.getSortFn()
    const sorted: PageWithFieldValues[] = Array.from(pagesWithMeta).sort(sortFn)

    // Truncate the list based on `limit`.
    const filtered = this.limit == null ? sorted : sorted.slice(0, this.limit)

    // Convert remaining pages into tiles.
    const tiles = await Promise.all(filtered.map(p => this.getTileInfo(p)))

    // Group tiles into TileGroups and return.
    const groups: TileGroup[] = []
    let group: TileGroup | null = null
    for (const tile of tiles) {
      if (group === null || tile.group !== group.name) {
        group = {
          name: tile.group,
          tiles: [tile]
        }
        groups.push(group)
      } else {
        group.tiles.push(tile)
      }
    }

    return groups
  }

  /**
   * Get all pages matching the `from` query.
   */
  getPages () {
    const pages = this.from
      ? this.api.pages(this.from)
      : this.api.pages()

    if (this.where) {
      return pages.filter(p => this.evaluate(this.where as string, p) == true)
    } else {
      return pages
    }
  }

  /**
   * Get all pages matching the `from` and `where` options, filtered by the
   * current filter query.
   */
  getFilteredPages () {
    const pages = this.getPages()
    return pages.filter(p => this.matchFilter(p))
  }

  /**
   * Check whether a page matches the current filter query.
   */
  matchFilter (page: Page): boolean {
    for (const pattern of this._filter.parsed) {
      if (pattern.startsWith('#')) {
        // Match tags
        for (const tag of page.file.tags) {
          if (tag.toLowerCase().startsWith(pattern)) {
            return true
          }
        }

        return false
      } else {
        // Match path
        if (!page.file.path.toLowerCase().contains(pattern)) {
          return false
        }
      }
    }

    return true
  }

  getFieldValues (page: Page, existing: Record<string, any> = {}, all = false): Record<string, any> {
    let fieldNames = this._sortBy.map(({ field }) => field)

    if (this.groupBy) {
      fieldNames.push(this.groupBy)
    }

    // If `all` == true, then also go through the `fields` list and evaluate
    // those. This is separated out so that we can skip all of the remaining
    // fields until after sorting & grouping (and truncating) is dealt with.
    if (all) {
      fieldNames = fieldNames.concat(this.fields)
    }

    for (const field of fieldNames) {
      // Don't re-evaluate the field if it's a duplicate. This can easily happen
      // since we evaluate "fields" from `groupBy`, `sortBy`, and `fields`, any of
      // which might use the same expression. If the same expression shows up
      // more than once, just re-use the previous result.
      if (existing.hasOwnProperty(field)) { continue }

      existing[field] = this.evaluate(field, page)
    }

    return existing
  }

  evaluate<TResult> (field: string, page: Page): TResult | null {
    const result = this.api.evaluate(field, {
      this: this.parentPage,
      ...page
    })
    // console.log('Field:', field, 'Page:', page.file.path, 'Context:', this.context.file.path, 'Value:', result)
    return result.successful
      ? result.value as TResult
      : null
  }

  getSortFn () {
    return (a: PageWithFieldValues, b: PageWithFieldValues): -1 | 0 | 1 => {
      // Sort by `groupBy` first...
      if (this.groupBy) {
        const aval = a.fields[this.groupBy],
              bval = b.fields[this.groupBy]

        if (aval && bval) {
          if (aval < bval) { return -1 }
          else if (aval > bval) { return 1 }
        } else if (aval) {
          // List pages w/ group-by values first (i.e. where the group-by field
          // isn't null/missing)
          return -1
        } else if (bval) {
          return 1
        }
      }

      // ...then by `sortBy` fields.
      for (const { field, reverse } of this._sortBy) {
        const aval = a.fields[field],
              bval = b.fields[field]

        if (aval && bval) {
          if (aval < bval) { return reverse ? 1 : -1 }
          else if (aval > bval) { return reverse ? -1 : 1 }
        } else if (aval) {
          // Defined before undefined
          return reverse ? 1 : -1
        } else if (bval) {
          // Defined before undefined
          return reverse ? -1 : 1
        }
      }

      // Everything matched
      return 0
    }
  }

  async getTileInfo ({ page, fields }: PageWithFieldValues): Promise<Tile> {
    const tile: Tile = {
      group: this.groupBy
        ? fields[this.groupBy]
        : null,
      href: page.file.path,
      path: page.file.path,
      filename: page.file.name,
      image: {
        src: await this.getFirstImageSrc(page),
        position: objectPath.get(page, 'pageGallery.position'),
        repeat: objectPath.get(page, 'pageGallery.repeat'),
        size: objectPath.get(page, 'pageGallery.size')
      },
      fields: []
    }

    // Render the group name, if there is one
    if (this.groupBy && tile.group) {
      tile.group = await this.renderFieldValue({ expression: this.groupBy, value: tile.group }, page.file.path)
    }

    // Fetch/evaluate all remaining field values
    fields = this.getFieldValues(page, fields, true)

    tile.fields = await Promise.all(
      Object.entries(fields).map(([expression, value]) => ({
        expression,
        value
      })).filter(({ value }) => value !== null)
      .map(async ({ expression, value }) => ({
        expression,
        value,
        html: await this.renderFieldValue({ expression, value }, page.file.path)
      })))

    return tile
  }

  async getFirstImageSrc (page: Page): Promise<string | null> {
    try {
      const file = this.plugin.app.vault.getAbstractFileByPath(page.file.path)

      if (!(file instanceof TFile)) {
        return null
      }

      const source = await this.plugin.app.vault.cachedRead(file as TFile)
      const rendered = document.createElement('div')
      // The .render-bypass class is included so that we can detect elsewhere
      // if we're inside another page gallery render call, to short-circuit
      // recursive rendering.
      rendered.classList.add('render-bypass')
      MarkdownPreviewView.renderMarkdown(source, rendered, page.file.path, this.component)

      for (const el of rendered.findAll('.internal-embed[src], img[src]')) {
        const src = el.getAttribute('src')
        if (!src) { continue }

        if (el.tagName === 'IMG' && src.match(/^https?:\/\//)) {
          return src
        }

        const ext = src.split('.').pop()
        if (!ext) { continue }

        const mimeType = mime.getType(ext)
        if (!mimeType || !IMG_MIME_TYPES.contains(mimeType)) { continue }

        const file = this.plugin.app.vault.getFiles().find(f => f.path.endsWith(src))
        if (!file) { continue }
        return this.plugin.app.vault.getResourcePath(file)
      }

      return null
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async renderFieldValue (field: { expression: string, value: string}, path: string): Promise<string> {
    if (field.expression === 'file.name') {
      // Don't "render" filenames as markdown.
      // TODO: There's probably a bunch of other file metadata that this
      // should apply to. Either that, or "don't render" is the default,
      // and there's a specific list of exceptions.
      return field.value
    }

    const temp = document.createElement('div')
    await this.api.renderValue(field.value, temp, this.component, path, true)
    return temp.innerHTML
  }
}
