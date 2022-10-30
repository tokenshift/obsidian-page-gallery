import mime from 'mime-types'
import { DataviewApi } from 'obsidian-dataview'

import Config, { Page } from './Config'
import * as builder from './HTMLBuilder'
import MarkdownGalleryItem from './MarkdownGalleryItem'
import PageGalleryPlugin from './PageGalleryPlugin'

export default class PageGallery {
  plugin: PageGalleryPlugin
  config: Config

  constructor (plugin: PageGalleryPlugin, config: Config) {
    this.plugin = plugin
    this.config = config
  }

  async render (api: DataviewApi) {
    const pages = Array.from(this.config.from ? api.pages(this.config.from) : api.pages())
    pages.sort(this.config.getSortFn())

    return await builder.div({ class: 'page-gallery' }, async div => {
      div.style({
        'grid-template-columns': `repeat(auto-fill, minmax(${this.config.image.width}, 1fr))`
      })

      let count = 0
      for (const page of pages) {
        if (this.config.limit && count >= this.config.limit) {
          break
        }

        const item = await this.getItem(page)
        const rendered = await item?.render(api)
        if (rendered) {
          div.appendChild(rendered)
          ++count
        }

      }
    })
  }

  async getItem (page: Page) {
    const mimeType = mime.lookup(page.file.path)

    if (mimeType === 'text/markdown') {
      return new MarkdownGalleryItem(this.plugin, this.config, page)
    } else {
      return null
    }
  }
}