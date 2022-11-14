import mime from 'mime'
import objectPath from 'object-path'
import { ulid } from 'ulid'

import { debounce, MarkdownPreviewView, MarkdownRenderChild, TFile } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'

import type  Config from './Config'
import type PageGalleryPlugin from './PageGalleryPlugin'

import PageGallery from './views/PageGallery.svelte'
import { writable, type Writable } from 'svelte/store'

const DEBOUNCE_RENDER_TIME = 100

const IMG_MIME_TYPES = [
  'image/jpeg',
  'image/png'
]

type Page = Record<string, any>

export type TileInfo = {
  href: string
  imageUrl: string | null
  filename: string
  path: string
  fields: FieldInfo[]
}

export type FieldInfo = {
  name: string
  value: string
  rendered: string
}

export type FilterState = {
  query: Writable<string>
  parsed: string[]
}

export default class PageGalleryRenderChild extends MarkdownRenderChild {
  id: string = ulid()
  plugin: PageGalleryPlugin
  config: Config
  api: DataviewApi
  gallery: PageGallery

  filter: FilterState

  constructor (plugin: PageGalleryPlugin, config: Config, api: DataviewApi, el: HTMLElement) {
    super(el)

    this.plugin = plugin
    this.config = config
    this.api = api

    this.filter = {
      query: writable(''),
      parsed: []
    }
  }

  updateTiles = debounce(async () => {
    try {
      const pages = await this.getMatchingPages()
      const tiles = await Promise.all(pages.map(p => this.getTileInfo(p)))
      this.gallery.$set({ tiles })
    } catch (err) {
      console.error(err)
    }
  }, DEBOUNCE_RENDER_TIME, true)

  async onload () {
    const tiles: TileInfo[] = []

    this.gallery = new PageGallery({
      target: this.containerEl,
      props: {
        config: this.config.image,
        query: this.filter.query,
        tiles
      }
    })

    this.filter.query.subscribe(q => {
      this.filter.parsed = q.split(/\s+/).map(p => p.toLowerCase())
      this.updateTiles()
    })

    this.updateTiles()

    this.registerEvent(this.plugin.app.metadataCache.on('dataview:metadata-change' as 'resolved', async () => {
      await this.updateTiles()
    }))

    this.registerEvent(this.plugin.app.metadataCache.on('dataview:index-ready' as 'resolved', async () => {
      await this.updateTiles()
    }))
  }

  async getMatchingPages (): Promise<Array<Page>> {
    const pages = Array.from(this.config.from
      ? this.api.pages(this.config.from)
      : this.api.pages())
    pages.sort(this.config.getSortFn())
    const filtered = pages.filter(p => this.matchFilter(p))
    return filtered.slice(0, this.config.limit)
  }

  matchFilter (page: Page) {
    for (const pattern of this.filter.parsed) {
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

  async getTileInfo (page: Page): Promise<TileInfo> {
    const tile: TileInfo = {
      href: page.file.path,
      imageUrl: await this.getFirstImageSrc(page),
      filename: page.file.name,
      path: page.file.path,
      fields: []
    }

    if (this.config.fields) {
      tile.fields = await Promise.all(
        this.config.fields.map(f => ({
          name: f,
          value: objectPath.get(page, f)
        }))
        .filter(({ value }) => value)
        .filter(({ value }) => !Array.isArray(value) || value.length)
        .map(async f => ({
          ...f,
          rendered: await this.renderFieldValue(tile, f.value)
        })))
    } else {
      tile.fields = []
    }

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
      MarkdownPreviewView.renderMarkdown(source, rendered, page.file.path, this)

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

    return null
  }

  async renderFieldValue (tile: TileInfo, fieldValue: string) {
    const temp = document.createElement('div')
    await this.api.renderValue(fieldValue, temp, this, tile.path, true)
    return temp.innerHTML
  }
}
