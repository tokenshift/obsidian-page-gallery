import merge from 'ts-deepmerge'
import validate from 'validate.js'

import { parseYaml } from 'obsidian'

import type { Page } from './PageGalleryRenderChild'
import sortBy from './sortBy'

export const DEFAULT_CONFIG = {
  fields: [],
  limit: 100
}

export function defaultSort (a: Page, b: Page) {
  return a.file.path.localeCompare(b.file.path)
}

export const SCHEMA = {
  from: { presence: { allowEmpty: false}, type: 'string' },
  fields: { type: 'array' },
  limit: { type: 'number' },
  groupBy: { type: 'array' },
  sortBy: { type: 'array' },
  height: { type: 'string' }
}
export default class Config {
  from: string
  fields: string[] | null
  limit: number
  groupBy: string[] | null
  sortBy: string[] | null
  height: string |  null

  constructor (config: any) {
    config = merge(DEFAULT_CONFIG, config)

    for (const arrayField of ['fields', 'groupBy', 'sortBy']) {
      if (config[arrayField] && !Array.isArray(config[arrayField])) {
        config[arrayField] = [config[arrayField]]
      }
    }

    const errors = validate(config, SCHEMA)

    if (errors) {
      throw new Error(`Invalid config: ${errors}`)
    }

    this.from = config.from
    this.fields = config.fields
    this.limit = config.limit
    this.groupBy = config.groupBy
    this.sortBy = config.sortBy
    this.height = config.height
  }

  static parse (source: string): Config {
    const parsed = parseYaml(source)
    return new Config(parsed)
  }

  getSortFn () {
    if (Array.isArray(this.sortBy) && this.sortBy.length > 0) {
      return sortBy(this.sortBy)
    } else {
      return defaultSort
    }
  }
}
