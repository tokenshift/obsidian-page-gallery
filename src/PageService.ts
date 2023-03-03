import mime from 'mime'
import { Component, MarkdownPreviewView, TFile } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'

import type ExpressionCache from './ExpressionCache'
import type PageGalleryPlugin from './PageGalleryPlugin'

export const IMG_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp'
]

export type Page = Record<string, any>

export type PageGroup = {
  name: string | null
  href?: string
  pages: Page[]
}

export default class PageService {
  plugin: PageGalleryPlugin
  component: Component
  api: DataviewApi
  cache: ExpressionCache

  constructor(options: {
    plugin: PageGalleryPlugin,
    component: Component,
    api: DataviewApi,
    cache: ExpressionCache
  }) {
    this.plugin = options.plugin
    this.component = options.component
    this.api = options.api
    this.cache = options.cache
  }

  async getPageGroups (options: {
    from: string,
    where: string,
    filter: string,
    sortBy: string[],
    groupBy: string | null
  }) {
    const {
      from,
      where,
      filter,
      sortBy,
      groupBy
    } = options

    let pages = from
      ? this.api.pages(from)
      : this.api.pages()

    if (where) {
      pages.filter(p => this.cache.evaluate(where, p) == true)
    }

    if (filter && filter.trim() != '') {
      pages = pages.filter(p => this.matchFilter(filter, p))
    }

    const sortFn = this.getSortFn({ sortBy, groupBy })
    const sorted: Page[] = Array.from(pages).sort(sortFn)

    // TODO: Group
    const grouped = this.getGroupedPages(groupBy, sorted)

    // TODO: Truncate (limit)

    return grouped
  }

  matchFilter (filter: string, page: Page): boolean {
    const patterns = filter.split(/\s+/).map(p => p.toLowerCase())

    for (const pattern of patterns) {
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

  getSortFn (options: {
    sortBy: string[],
    groupBy: string | null
  }) {
    const {
      groupBy
    } = options

    const sortBy = options.sortBy
      .map(field => field.trim().toLowerCase())
      .map(field => field.startsWith('-')
        ? { field: field.substring(1), reverse: true }
        : { field, reverse: false })

    return (a: Page, b: Page): -1 | 0 | 1 => {
      // Sort by `groupBy` first...
      if (groupBy) {
        const aval = this.cache.evaluate(groupBy, a),
              bval = this.cache.evaluate(groupBy, b)

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
      for (const { field, reverse } of sortBy) {
        const aval = this.cache.evaluate(field, a),
              bval = this.cache.evaluate(field, b)

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

  getGroupedPages (groupBy: string | null, pages: Page[]): PageGroup[] {
    const groups: PageGroup[] = []
    let currentGroup: PageGroup | null = null

    for (const page of pages) {
      const group = groupBy
        ? this.cache.evaluate<string>(groupBy, page)
        : null

      if (currentGroup === null || group !== currentGroup.name) {
        currentGroup = {
          name: group,
          pages: [page]
        }

        groups.push(currentGroup)
      } else {
        currentGroup.pages.push(page)
      }
    }

    return groups
  }

  async getFirstImageSrc (page: Page): Promise<string | null> {
    // TODO: Cache this (move to ExpressionCache, or a new PageContentService?)
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
}
