import { MarkdownPostProcessorContext, Notice, Plugin } from 'obsidian'
import { DataviewApi, getAPI } from 'obsidian-dataview'
import PageGallery from './PageGallery'
import Config from './Config'
import * as notices from './notices'

export const IMG_MIME_TYPES = [
	'image/jpeg',
	'image/png'
]

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

	async handlePageGalleryBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		const api = getAPI()
		if (!api) {
			new Notice(await notices.missingObsidianDataview())
			return
		}

		try {
			const config = Config.parse(source)
			const gallery =  new PageGallery(this, config)

			el.append(await gallery.render(api))
		} catch (err) {
			const pre = document.createElement('pre')
			pre.innerText = err.stack ? err.stack : err.message
			el.append(pre)
		}
	}
}
