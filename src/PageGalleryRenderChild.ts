import { ulid } from 'ulid'

import { debounce, MarkdownRenderChild } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'
import { writable } from 'svelte/store'

import type Config from './Config'
import type PageGalleryPlugin from './PageGalleryPlugin'
import PageGallery from './views/PageGallery.svelte'

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
  plugin: PageGalleryPlugin
  api: DataviewApi
  sourcePath: string
  parentPage: Record<string, any>
  config: Config
  root: PageGallery

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
    this.api = api
    this.parentPage = api.page(sourcePath) as Record<string, any>
    this.config = config
  }

  updateTiles = debounce(async () => {
    try {
      // TODO: How do I force the gallery to update now?
    } catch (err) {
      console.error(err)
    }
  }, DEBOUNCE_RENDER_TIME, true)

  async onload () {
    this.root = new PageGallery({
      target: this.containerEl,
      props: {
        plugin: this.plugin,
        component: this,
        api: this.api,
        config: this.config,
        parentPage: this.parentPage
      }
    })

    this.registerEvent(this.plugin.app.metadataCache.on('dataview:metadata-change' as 'resolved', async () => {
      await this.updateTiles()
    }))

    this.registerEvent(this.plugin.app.metadataCache.on('dataview:index-ready' as 'resolved', async () => {
      await this.updateTiles()
    }))

    this.updateTiles()
  }
}
