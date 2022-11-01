import { MarkdownPostProcessorContext, Notice, Plugin } from 'obsidian'
import { DataviewApi, getAPI } from 'obsidian-dataview'

import Config from './Config'
import * as notices from './notices'
import PageGalleryRenderChild from './PageGalleryRenderChild'

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
		try {
			const config = Config.parse(source)
			const child = new PageGalleryRenderChild(this, config, this.api, el)
			ctx.addChild(child)

			child.render(config, this.api)
		} catch (err) {
			const pre = document.createElement('pre')
			pre.innerText = err.stack ? err.stack : err.message
			el.append(pre)
		}

		// const reRender = debounce(async () => {
		// 	try {
		// 		const config = Config.parse(source)
		// 		const gallery = await this.getPageGallery(config)
		// 		const rendered = gallery.render()

		// 		// while (el.firstChild) {	el.removeChild(el.firstChild)	}
		// 		el.appendChild(rendered)
		// 	} catch (err) {
		// 		const pre = document.createElement('pre')
		// 		pre.innerText = err.stack ? err.stack : err.message

		// 		// while (el.firstChild) {	el.removeChild(el.firstChild)	}
		// 		el.append(pre)
		// 	}
		// }, DEBOUNCE_RENDER_TIME)

		// this.registerEvent(this.app.metadataCache.on('dataview:index-ready', () => {
		// 	console.log('dataview:index-ready')
		// 	reRender()
		// }))

		// this.registerEvent(this.app.metadataCache.on('dataview:metadata-change', () => {
		// 	console.log('dataview:metadata-change')
		// 	reRender()
		// }))

		// reRender()
	}
}