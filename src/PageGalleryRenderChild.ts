import { ulid } from 'ulid'

import { debounce, MarkdownRenderChild } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'
import { writable } from 'svelte/store'

import type Config from './Config'
import type PageGalleryPlugin from './PageGalleryPlugin'
import PageGallery from './views/PageGallery.svelte'
import TileWrangler, { type Page } from './TileWrangler'

const DEBOUNCE_RENDER_TIME = 100

export type PageGalleryRenderChildOptions = {
  sourcePath: string
  plugin: PageGalleryPlugin
  element: HTMLElement
  api: DataviewApi
  config: Config
}

export default class PageGalleryRenderChild extends MarkdownRenderChild {
  id: string = ulid()

  sourcePath: string
  plugin: PageGalleryPlugin
  config: Config
  gallery: PageGallery

  wrangler: TileWrangler

  constructor (options: PageGalleryRenderChildOptions) {
    const {
      sourcePath,
      plugin,
      element,
      api,
      config
    } = options

    super(element)

    this.plugin = plugin
    this.config = config
    this.sourcePath = sourcePath

    const parentPage = api.page(this.sourcePath)


    this.wrangler = new TileWrangler({
      ...config,
      parentPage: parentPage as Page,
      plugin,
      component: this,
      api
    })
  }

  updateTiles = debounce(async () => {
    try {
      const groups = await this.wrangler.getTileGroups()
      this.gallery.$set({ groups })
    } catch (err) {
      console.error(err)
    }
  }, DEBOUNCE_RENDER_TIME, true)

  async onload () {
    const filter = writable('')
    this.gallery = new PageGallery({
      target: this.containerEl,
      props: {
        config: this.config,
        filter: filter,
        groups: []
      }
    })

    filter.subscribe(f => {
      this.wrangler.filter = f
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
}
