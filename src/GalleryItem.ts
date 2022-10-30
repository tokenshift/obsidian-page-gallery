import { DataviewApi } from "obsidian-dataview";
import Config, { Page } from "./Config";
import PageGalleryPlugin from "./PageGalleryPlugin";

export default abstract class GalleryItem {
  plugin: PageGalleryPlugin
  config: Config
  page: Page

  constructor (plugin: PageGalleryPlugin, config: Config, page: Page) {
    this.plugin = plugin
    this.config = config
    this.page = page
  }

  abstract render (api: DataviewApi): Promise<DocumentFragment | HTMLElement | null>
}