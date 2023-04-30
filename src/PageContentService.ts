import mime from 'mime'
import { Component, MarkdownPreviewView, MarkdownRenderer, TFile } from 'obsidian'

import LRUCache from './LRUCache'
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
  plugin: PageGalleryPlugin
  component: Component

  _cache = new LRUCache()

  constructor(options: {
    plugin: PageGalleryPlugin,
    component: Component
  }) {
    this.plugin = options.plugin
    this.component = options.component
  }

  async getContent (page: Page): Promise<string | null> {
    const cacheKey = JSON.stringify({
      operation: 'getContent',
      page: {
        path: page.file.path,
        mtime: page.file.mtime,
        size: page.file.size
      }
    })

    return this._cache.fetch(cacheKey, async (): Promise<string | null> => {
      const file = this.plugin.app.vault.getAbstractFileByPath(page.file.path)

      if (!(file instanceof TFile)) {
        return null
      }

      const content = await this.plugin.app.vault.cachedRead(file as TFile)

      return content
    }) as Promise<string | null>
  }

  async getRenderedContent (page: Page): Promise<HTMLElement | null> {
    const cacheKey = JSON.stringify({
      operation: 'getRenderedContent',
      page: {
        path: page.file.path,
        mtime: page.file.mtime,
        size: page.file.size
      }
    })

    return this._cache.fetch(cacheKey, async (): Promise<HTMLElement | null> => {
      const source = await this.getContent(page)
      if (!source) { return null }

      const rendered = document.createElement('div')

      // The .render-bypass class is included so that we can detect elsewhere
      // if we're inside another page gallery render call, to short-circuit
      // recursive rendering.
      rendered.classList.add('render-bypass')

      MarkdownPreviewView.renderMarkdown(source, rendered, page.file.path, this.component)

      return rendered
    }) as Promise<HTMLElement | null>
  }

  /**
   * While external images render as <img> tags via MarkdownPreviewView.renderMarkdown,
   * internal images are rendered as <span> tags with the image src as an attribute.
   * This function calls `getRenderedContent(page)` then replaces the content of
   * all .internal-embed[src] elements with img[src] elements.
   */
  async getRenderedContentWithImages (page: Page): Promise<HTMLElement | null> {
    const cacheKey = JSON.stringify({
      operation: 'getRenderedContentWithImages',
      page: {
        path: page.file.path,
        mtime: page.file.mtime,
        size: page.file.size
      }
    })

    return this._cache.fetch(cacheKey, async (): Promise<HTMLElement | null> => {
      const rendered = await this.getRenderedContent(page)
      if (!rendered) { return null }

      for (const el of rendered.findAll('.internal-embed[src]')) {
        const src = el.getAttribute('src')
        if (!src) { continue }

        const ext = src.split('.').pop()
        if (!ext) { continue }

        const mimeType = mime.getType(ext)
        if (!mimeType || !IMG_MIME_TYPES.contains(mimeType)) { continue }

        const file = this.plugin.app.vault.getFiles().find(f => f.path.endsWith(src))
        if (!file) { continue }

        const imageSrc = this.plugin.app.vault.getResourcePath(file)

        el.innerHTML = ''
        const img = document.createElement('img')
        img.setAttribute('alt', el.getAttribute('alt') || '')
        img.setAttribute('src', imageSrc)
        el.appendChild(img)
      }

      return rendered
    }) as Promise<HTMLElement | null>
  }

  async getFirstImageSrc (page: Page): Promise<string | null> {
    const cacheKey = JSON.stringify({
      operation: 'getFirstImageSrc',
      page: {
        path: page.file.path,
        mtime: page.file.mtime,
        size: page.file.size
      }
    })

    return this._cache.fetch(cacheKey, async (): Promise<string | null> => {
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
    }) as string | null
  }
}
