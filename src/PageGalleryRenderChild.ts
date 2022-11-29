import mime from 'mime'
import objectPath from 'object-path'
import { ulid } from 'ulid'

import { debounce, MarkdownPreviewView, MarkdownRenderChild, TFile } from 'obsidian'
import type { DataviewApi, Result, Success } from 'obsidian-dataview'

import type Config from './Config'
import type PageGalleryPlugin from './PageGalleryPlugin'

import PageGallery from './views/PageGallery.svelte'
import { writable, type Writable } from 'svelte/store'

const DEBOUNCE_RENDER_TIME = 100

const IMG_MIME_TYPES = [
  'image/jpeg',
  'image/png'
]

export type Page = Record<string, any>

export type Tile = {
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
  name: string
  value: string
  html: string
}

export default class PageGalleryRenderChild extends MarkdownRenderChild {
  id: string = ulid()
  plugin: PageGalleryPlugin
  config: Config
  api: DataviewApi
  gallery: PageGallery

  filter: {
    raw: Writable<string>
    parsed: string[]
  }

  constructor (plugin: PageGalleryPlugin, config: Config, api: DataviewApi, el: HTMLElement) {
    super(el)

    this.plugin = plugin
    this.config = config
    this.api = api

    this.filter = {
      raw: writable(''),
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
    const tiles: Tile[] = []

    this.gallery = new PageGallery({
      target: this.containerEl,
      props: {
        config: this.config,
        filter: this.filter.raw,
        tiles
      }
    })

    this.filter.raw.subscribe(q => {
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
    const sortFn = this.config.getSortFn()
    pages.sort(sortFn)
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

  async getTileInfo (page: Page): Promise<Tile> {
    const tile: Tile = {
      href: page.file.path,
      path: page.file.path,
      filename: page.file.name,
      image: {
        src: await this.getFirstImageSrc(page),
        position: objectPath.get(page, 'pageGallery.position'),
        repeat: objectPath.get(page, 'pageGallery.repeat'),
        size: objectPath.get(page, 'pageGallery.size')
      },
      fields: [],
    }

    tile.fields = await Promise.all(this.config.fields.map(name => ({
      name,
      result: this.api.evaluate(name, page)
    }))
    .filter(({result}) => result.successful)
    .map(({name, result}) => ({
      name,
      value: (result as Success<any, string>).value
    }))
    .map(async ({name, value}) => ({
      name,
      value,
      html: await this.renderFieldValue({ name, value }, page.file.path)
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
  }

  async renderFieldValue (field: { name: string, value: string}, path: string): Promise<string> {
    if (field.name === 'file.name') {
      // Don't "render" filenames as markdown.
      // TODO: There's probably a bunch of other file metadata that this
      // should apply to. Either that, or "don't render" is the default,
      // and there's a specific list of exceptions.
      return field.value
    }

    const temp = document.createElement('div')
    await this.api.renderValue(field.value, temp, this, path, true)
    return temp.innerHTML
  }
}
