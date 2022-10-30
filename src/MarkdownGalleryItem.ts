import mime from 'mime-types'
import objectPath from 'object-path'
import {  MarkdownPreviewView } from "obsidian";
import { DataviewApi, getAPI } from "obsidian-dataview";
import * as path from 'path';
import GalleryItem from "./GalleryItem";
import * as builder from './HTMLBuilder'
import { IMG_MIME_TYPES } from './PageGalleryPlugin';

export const TAG_FIELDS = [
  'file.tags',
  'file.etags'
]

// TODO: Config option to pick image from content or frontmatter
// TODO: Pick first image found in content and use that, or rendered content
// as a fallback
// TODO: Config options to display additional fields from frontmatter
export default class MarkdownGalleryItem extends GalleryItem {
  async render (api: DataviewApi) {
    const file = this.plugin.app.vault.getFiles().find(f => f.path === this.page.file.path)
    if (!file) { return null }

    const source = await this.plugin.app.vault.cachedRead(file)
    const rendered = document.createElement('div')
    MarkdownPreviewView.renderMarkdown(source, rendered, this.page.file.path, this.plugin)

    return await builder.div({
      class: 'page-gallery__item',
      'data-page-gallery-item-type': 'markdown'
    }, async div => {
      div.style({
        width: this.config.image.width
      })

      const firstImageSrc = this.getFirstImageSrc(rendered)

      if (firstImageSrc) {
        await div.a({
          class: 'page-gallery__image internal-link',
          'data-href': this.page.file.path,
          href: this.page.file.path,
          target: '_blank',
          rel: 'noopener'
        }, a => {
          a.style({
            'background-position': this.config.image.position,
            'background-repeat': this.config.image.repeat,
            'background-size': this.config.image.size,
            height: this.config.image.height,
            width: this.config.image.width,
            'background-image': `url("${firstImageSrc}"), linear-gradient(to bottom right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))`
          })
        })
      } else {
        await div.a({
          class: 'page-gallery__fallback internal-link',
          'data-href': this.page.file.path,
          href: this.page.file.path,
          target: '_blank',
          rel: 'noopener'
        }, a => {
          a.style({
            height: this.config.image.height,
            width: this.config.image.width
          })

          a.text(this.page.file.name)
        })
      }

      if (Array.isArray(this.config.fields)) {
        await div.div({ class: 'page-gallery__fields' }, async div => {
          for (const fieldName of this.config.fields) {
            const value = objectPath.get(this.page, fieldName)

            if (!value) { continue }
            if (Array.isArray(value) && value.length === 0) { continue }

            await div.div({
              class: 'page-gallery__field',
              'data-page-gallery-field-name': fieldName
            }, async div => {
              api.renderValue(value, div.root, this.plugin, this.page.file.path, true)
            })
          }
        })
      }
    })
  }

  getFirstImageSrc (root: HTMLElement) {
    for (const el of root.findAll('.internal-embed[src], img[src]')) {
      const src = el.getAttribute('src')
      if (!src) { continue }

      if (el.tagName === 'IMG' && src.match(/^https?:\/\//)) {
        return src
      }

      const mimeType = mime.lookup(path.parse(src).ext)
      if (!mimeType || !IMG_MIME_TYPES.contains(mimeType)) { continue }

      const file = this.plugin.app.vault.getFiles().find(f => f.path.endsWith(src))
      if (!file) { continue }
      return this.plugin.app.vault.getResourcePath(file)
    }

    return null
  }
}
