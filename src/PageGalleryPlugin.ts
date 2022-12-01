import type { MarkdownPostProcessorContext } from 'obsidian'
import { Notice, Plugin } from 'obsidian'
import { DataviewApi, getAPI } from 'obsidian-dataview'

import Config from './Config'
import MemoryTileCache from './MemoryTileCache'
import PageGalleryRenderChild from './PageGalleryRenderChild'
import type { TileCache } from './TileWrangler'

export default class PageGalleryPlugin extends Plugin {
  api: DataviewApi
  cache: TileCache

  async onload () {
    const api = getAPI()
    if (api) {
      this.api = api
    } else {
      this.showMissingDataviewNotice()
      return
    }

    this.cache = new MemoryTileCache()

    this.registerMarkdownCodeBlockProcessor('page-gallery', (source, el, ctx) => this.handlePageGalleryBlock(source, el, ctx))

    console.info(`PageGallery (${this.manifest.version}) plugin loaded`)
  }

  showMissingDataviewNotice () {
    const fragment = document.createDocumentFragment()
    fragment.appendText('Failed to load the Dataview API! Is the ')
    const a = document.createElement('a')
    a.setAttribute('href', 'https://github.com/blacksmithgu/obsidian-dataview')
    a.appendText('obsidian-dataview')
    fragment.appendChild(a)
    fragment.appendText(' plugin enabled?')

    new Notice(fragment)
  }

  async handlePageGalleryBlock (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    try {
      const config = Config.parse(source)
      const child = new PageGalleryRenderChild({
        plugin: this,
        config,
        api: this.api,
        element: el,
        cache: this.cache
      })
      ctx.addChild(child)
    } catch (err) {
      const pre = document.createElement('pre')
      pre.append(err.message)
      if (err.stack) {
        pre.append(err.stack)
      }
      el.append(pre)
    }
  }
}
