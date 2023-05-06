import mime from 'mime'
import { Component, MarkdownPreviewView, TFile } from 'obsidian'

import * as path from './path'
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

  constructor(options: {
    plugin: PageGalleryPlugin,
    component: Component
  }) {
    this.plugin = options.plugin
    this.component = options.component
  }

  async getContent (page: Page): Promise<string | null> {
    const file = this.plugin.app.vault.getAbstractFileByPath(page.file.path)

    if (!(file instanceof TFile)) {
      return null
    }

    const content = await this.plugin.app.vault.cachedRead(file as TFile)

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

  /**
   * While external images render as <img> tags via MarkdownPreviewView.renderMarkdown,
   * internal images are rendered as <span> tags with the image src as an attribute.
   * This function calls `getRenderedContent(page)` then replaces the content of
   * all .internal-embed[src] elements with img[src] elements.
   */
  async getRenderedContentWithImages (page: Page): Promise<HTMLElement | null> {
    const rendered = await this.getRenderedContent(page)
    if (!rendered) { return null }

    for (const el of rendered.findAll('.internal-embed[src]')) {
      const src = el.getAttribute('src')
      if (!src) { continue }

      const ext = src.split('.').pop()
      if (!ext) { continue }

      const mimeType = mime.getType(ext)
      if (!mimeType || !IMG_MIME_TYPES.contains(mimeType)) { continue }

      const file = this.getClosestMatchingImageSrc(src, page)
      if (!file) { continue }

      const imageSrc = this.plugin.app.vault.getResourcePath(file)

      el.innerHTML = ''
      const img = document.createElement('img')
      img.setAttribute('alt', el.getAttribute('alt') || '')
      img.setAttribute('src', imageSrc)
      el.appendChild(img)
    }

    return rendered
  }

  /** Attempts to find the *right* matching image, in the event that there's
   * multiple matching the `src`, by picking the "closest".
   *
   * No idea if this is how Obsidian figures out what image to use. I can't find
   * anything exposed in the Obsidian API that does this correctly, though.
   *
   * TODO: See if I can figure out how Obsidian actually picks an image when a
   * link like `![[example.png]]` matches multiple files.
   */
  getClosestMatchingImageSrc (src: string, page: Page): TFile | null {
    src = src.normalize()

    const dirname = path.dirname(page.file.path)
    const matching = this.plugin.app.vault.getFiles().filter(f => f.path.normalize().endsWith(src))

    matching.sort((a, b) => {
      // Sort files that are descendants (or siblings) of the current page's folder first,
      // then by standard string comparison on their absolute paths.
      if (a.path.startsWith(dirname)) {
        if (b.path.startsWith(dirname)) {
          return a < b ? -1 :1
        } else {
          return -1
        }
      } else {
        if (b.path.startsWith(dirname)) {
          return 1
        } else {
          return a < b ? -1 : 1
        }
      }
    })

    if (matching.length > 0) {
      return matching[0]
    } else {
      return null
    }
  }

  async getFirstImageSrc (page: Page): Promise<string | null> {
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

      const file = this.getClosestMatchingImageSrc(src, page)
      if (!file) { continue }

      return this.plugin.app.vault.getResourcePath(file)
    }

    return null
  }
}
