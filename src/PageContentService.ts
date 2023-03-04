import mime from 'mime'
import { Component, MarkdownPreviewView, TFile } from 'obsidian'

import PageCache from './PageCache'
import type PageGalleryPlugin from './PageGalleryPlugin'
import type { Page } from './PageService'

export const IMG_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp'
]

export default class PageContentService {
  _contentCache  = new PageCache<string | null>()
  _renderedCache = new PageCache<HTMLElement | null>()
  _imageSrcCache = new PageCache<string | null>()

  plugin: PageGalleryPlugin
  component: Component

  constructor(options: {
    plugin: PageGalleryPlugin,
    component: Component
  }) {
    this.plugin = options.plugin
    this.component = options.component
  }

  async getContent (page: Page) {
    return await this._contentCache.fetch(page, async () => {
      const file = this.plugin.app.vault.getAbstractFileByPath(page.file.path)

      if (!(file instanceof TFile)) {
        return null
      }

      return await this.plugin.app.vault.cachedRead(file as TFile)
    })
  }

  async getRenderedContent (page: Page) {
    return await this._renderedCache.fetch(page, async () => {
      const source = await this.getContent(page)
      if (!source) { return null }

      const rendered = document.createElement('div')

      // The .render-bypass class is included so that we can detect elsewhere
      // if we're inside another page gallery render call, to short-circuit
      // recursive rendering.
      rendered.classList.add('render-bypass')

      MarkdownPreviewView.renderMarkdown(source, rendered, page.file.path, this.component)

      return rendered
    })
  }

  async getFirstImageSrc (page: Page): Promise<string | null> {
    return await this._imageSrcCache.fetch(page, async () => {
      const rendered = await this.getRenderedContent(page)
      if (!rendered) { return null }

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
    })
  }
}