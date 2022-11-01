import debounce from 'debounce'
import mime from 'mime-types'
import objectPath from 'object-path'
import path from 'path'
import { ulid } from 'ulid'

import { MarkdownPreviewView, MarkdownRenderChild, TFile } from 'obsidian';
import { DataviewApi } from 'obsidian-dataview';

import Config from './Config';
import PageGalleryPlugin from './PageGalleryPlugin';
import PageGalleryView, { PageGalleryTile } from './PageGalleryView';

const DEBOUNCE_RENDER_TIME = 500

const IMG_MIME_TYPES = [
	'image/jpeg',
	'image/png'
]

type Page = Record<string, any>
type RenderFunc = () => Promise<void>

export default class PageGalleryRenderChild extends MarkdownRenderChild {
  id = ulid()
  plugin: PageGalleryPlugin
  config: Config
  api: DataviewApi

  constructor (plugin: PageGalleryPlugin, config: Config, api: DataviewApi, el: HTMLElement) {
    super(el)

    this.plugin = plugin
    this.config = config
    this.api = api
  }

  onload () {
		this.registerEvent(this.plugin.app.metadataCache.on('dataview:metadata-change' as 'resolved', async () => {
			await this.render()
		}))

		this.registerEvent(this.plugin.app.metadataCache.on('dataview:index-ready' as 'resolved', async () => {
			await this.render()
		}))
  }

  clear () {
    while (this.containerEl.firstChild) {
      this.containerEl.removeChild(this.containerEl.firstChild)
    }
  }

  render: RenderFunc = debounce(async () => {
    const gallery = await this.getPageGallery(this.config)
		const rendered = gallery.render()
    this.clear()
    this.containerEl.appendChild(rendered)

  }, DEBOUNCE_RENDER_TIME)

	async getPageGallery (config: Config): Promise<PageGalleryView> {
		const pages = await this.getMatchingPages(config)
		return new PageGalleryView({
			config: config.image,
			tiles: await Promise.all(pages.map(p => this.getPageGalleryTile(config, p)))
		})
	}

	async getMatchingPages (config: Config): Promise<Array<Page>> {
    const pages = Array.from(config.from ? this.api.pages(config.from) : this.api.pages())
    pages.sort(config.getSortFn())
		return pages.slice(0, config.limit)
	}

	async getPageGalleryTile (config: Config, page: Page): Promise<PageGalleryTile> {
		return {
			href: page.file.path,
			imageUrl: await this.getFirstImageSrc(page),
			filename: page.file.name,
			fields: config.fields?.map(f => ({
				name: f,
				value: objectPath.get(page, f)
			}))
				.filter(({ value }) => value)
				.filter(({ value }) => !Array.isArray(value) || value.length > 0)
				.map(field => {
					return {
						...field,
						render: (container: HTMLElement) => {
							this.api.renderValue(field.value, container, this, page.file.path, true)
						}
					}
				})
		}
	}

	async getFirstImageSrc (page: Page): Promise<string | null> {
		const file = this.plugin.app.vault.getAbstractFileByPath(page.file.path)
		if (!file) { return null }

    const source = await this.plugin.app.vault.cachedRead(file as TFile)
    const rendered = document.createElement('div')
    MarkdownPreviewView.renderMarkdown(source, rendered, page.file.path, this)

    for (const el of rendered.findAll('.internal-embed[src], img[src]')) {
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
