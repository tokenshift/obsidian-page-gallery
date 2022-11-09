import type { MarkdownPostProcessorContext } from 'obsidian'
import { Notice, Plugin } from 'obsidian'
import { DataviewApi, getAPI } from 'obsidian-dataview'

import Config from './Config'
import PageGalleryRenderChild from './PageGalleryRenderChild'

export default class PageGalleryPlugin extends Plugin {
  api: DataviewApi

  async onload () {
    const api = getAPI()
    if (api) {
      this.api = api
    } else {
      this.showMissingDataviewNotice()
      return
    }

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
      const child = new PageGalleryRenderChild(this, config, this.api, el)
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
