import merge from 'ts-deepmerge'
import * as toml from 'toml'

const DEFAULT_CONFIG = {
  fields: [],
  limit: 100,
  image: {}
}

export type Page = Record<string, any>

export type ImageConfig = {
  columns?: number
  height?: string
  width?: string
  position?: string
  repeat?: string
  fit?: string
}

export default class Config {
  from?: string
  fields?: Array<string>
  limit?: number

  image: ImageConfig

  constructor (attrs: object = {}) {
    Object.assign(this, merge(DEFAULT_CONFIG, attrs))
  }

  static parse (source: string) {
    try {
      const parsed = toml.parse(source)
      return new Config(parsed)
    } catch (err) {
      console.trace(err)
      throw new Error('Invalid page-gallery config!')
    }
  }

  // TODO: Add sort options to config. Right now, it just sorts
  // by filename.
  getSortFn () {
    return (a: Page, b: Page) => {
      return a.file.path.localeCompare(b.file.path)
    }
  }
}