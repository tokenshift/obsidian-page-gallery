import mime from 'mime'
// import NodeCache from 'node-cache'
import { Component, MarkdownPreviewView, TFile } from 'obsidian'

import type PageGalleryPlugin from './PageGalleryPlugin'
import type { Page } from './PageService'

// const CACHE_TTL = 60

export const IMG_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp'
]

export default class PageContentService {
  plugin: PageGalleryPlugin
  component: Component

  constructor(options: {
    plugin: PageGalleryPlugin,
    component: Component
  }) {
    this.plugin = options.plugin
    this.component = options.component
  }

  // _contentCache = new NodeCache({ stdTTL: CACHE_TTL })
  async getContent (page: Page): Promise<string | null> {
    // const cacheKey = JSON.stringify([
    //   page.file.path,
    //   page.file.mtime,
    //   page.file.size
    // ])

    // const cached = this._contentCache.get<string | null>(cacheKey)
    // if (cached !== undefined) { return cached }

    const file = this.plugin.app.vault.getAbstractFileByPath(page.file.path)

    if (!(file instanceof TFile)) {
      return null
    }

    const content = await this.plugin.app.vault.cachedRead(file as TFile)

    // this._contentCache.set(cacheKey, content)
    return content
  }

  async getRenderedContent (page: Page): Promise<HTMLElement | null> {
    const source = await this.getContent(page)
    if (!source) { return null }

    const rendered = document.createElement('div')

    // The .render-bypass class is included so that we can detect elsewhere
    // if we're inside another page gallery render call, to short-circuit
    // recursive rendering.
    rendered.classList.add('render-bypass')

    MarkdownPreviewView.renderMarkdown(source, rendered, page.file.path, this.component)

    return rendered
  }

  // _firstImageSrcCache = new NodeCache({ stdTTL: CACHE_TTL })
  async getFirstImageSrc (page: Page): Promise<string | null> {
    // const cacheKey = JSON.stringify([
    //   page.file.path,
    //   page.file.mtime,
    //   page.file.size
    // ])

    // const cached = this._firstImageSrcCache.get<string | null>(cacheKey)
    // if (cached !== undefined) { return cached }

    const rendered = await this.getRenderedContent(page)
    if (!rendered) {
      // this._firstImageSrcCache.set(cacheKey, null)
      return null
    }

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

      const path = this.plugin.app.vault.getResourcePath(file)

      // this._firstImageSrcCache.set(cacheKey, path)
      return path
    }

    // this._firstImageSrcCache.set(cacheKey, null)
    return null
  }
}
