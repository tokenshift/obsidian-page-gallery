import { ulid } from 'ulid'

import { debounce, MarkdownRenderChild } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'
import { writable } from 'svelte/store'

import type Config from './Config'
import type PageGalleryPlugin from './PageGalleryPlugin'
import PageGallery from './views/PageGallery.svelte'
import TileWrangler from './TileWrangler'

const DEBOUNCE_RENDER_TIME = 100

export default class PageGalleryRenderChild extends MarkdownRenderChild {
  id: string = ulid()

  plugin: PageGalleryPlugin
  config: Config
  gallery: PageGallery

  wrangler: TileWrangler

  constructor (plugin: PageGalleryPlugin, config: Config, api: DataviewApi, el: HTMLElement) {
    super(el)

    this.wrangler = new TileWrangler({
      ...config,
      plugin,
      component: this,
      api,
    })

    this.plugin = plugin
    this.config = config
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
