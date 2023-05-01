import { ulid } from 'ulid'

import { debounce, MarkdownRenderChild } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'

import type Config from './Config'
import type PageGalleryPlugin from './PageGalleryPlugin'
import PageGallery from './views/PageGallery.svelte'

const DEBOUNCE_RENDER_TIME = 500

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

    this.sourcePath = sourcePath
    this.plugin = plugin
    this.api = api
    this.config = config
  }

  refresh = debounce(async () => {
    try {
      if (!this.parentPage) {
        this.parentPage = this.api.page(this.sourcePath) as Record<string, any>
      }

      if (!this.parentPage) { return }

      if (!this.root) {
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
      }

      this.root.refresh()
    } catch (err) {
      console.error(err)
    }
  }, DEBOUNCE_RENDER_TIME, true)

  async onload () {
    this.registerEvent(this.plugin.app.metadataCache.on('dataview:metadata-change' as 'resolved', () => {
      this.refresh()
    }))

    this.registerEvent(this.plugin.app.metadataCache.on('dataview:index-ready' as 'resolved', () => {
      this.refresh()
    }))

    this.refresh()
  }
}
