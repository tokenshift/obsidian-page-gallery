import merge from 'deepmerge'
import * as toml from 'toml'

const DEFAULT_CONFIG = {
  fields: [],
  limit: 100,

  image: {
    height: '18em',
    width: '12em',

    position: 'center',
    repeat: 'none',
    size: 'cover'
  }
}

export type Page = Record<string, any>

export default class Config {
  from?: string
  fields?: Array<string>
  limit?: number

  image: {
    height: string
    width: string
    position: string
    repeat: string
    size: string
  }

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