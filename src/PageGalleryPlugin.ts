import mime from 'mime-types'
import objectPath from 'object-path'
import * as path from 'path';
import { MarkdownPostProcessorContext, MarkdownPreviewView, Notice, Plugin, TFile } from 'obsidian'
import { DataviewApi, getAPI } from 'obsidian-dataview'
import Config from './Config'
import * as notices from './notices'
import PageGallery, { PageGalleryTile } from './PageGallery'

export const IMG_MIME_TYPES = [
	'image/jpeg',
	'image/png'
]

type Page = Record<string, any>

export default class PageGalleryPlugin extends Plugin {
	api: DataviewApi

	async onload () {
		const api = getAPI()
		if (api) {
			this.api = api
		} else {
			new Notice(await notices.missingObsidianDataview())
			return
		}

		this.registerMarkdownCodeBlockProcessor('page-gallery', (source, el, ctx) => this.handlePageGalleryBlock(source, el, ctx))
	}

	async handlePageGalleryBlock (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		const api = getAPI()
		if (!api) {
			new Notice(await notices.missingObsidianDataview())
			return
		}

		try {
			const config = Config.parse(source)
			const gallery = await this.getPageGallery(config)
			el.appendChild(gallery.render())

			// el.append(await gallery.render(api))
		} catch (err) {
			const pre = document.createElement('pre')
			pre.innerText = err.stack ? err.stack : err.message
			el.append(pre)
		}
	}

	async getPageGallery (config: Config): Promise<PageGallery> {
		const pages = await this.getMatchingPages(config)
		return new PageGallery({
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
		const file = this.app.vault.getAbstractFileByPath(page.file.path)
		if (!file) { return null }

    const source = await this.app.vault.cachedRead(file as TFile)
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

      const file = this.app.vault.getFiles().find(f => f.path.endsWith(src))
      if (!file) { continue }
      return this.app.vault.getResourcePath(file)
    }

    return null
	}
}