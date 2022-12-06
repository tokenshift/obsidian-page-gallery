import merge from 'ts-deepmerge'
import validate from 'validate.js'

import { parseYaml } from 'obsidian'

export const DEFAULT_CONFIG = {
  fields: [],
  limit: 100,
  filter: true,
  sortBy: ['file.path']
}

export const GOLDEN_RATIO = 1.618

export const SCHEMA = {
  debug: { type: 'boolean' },
  from: { presence: { allowEmpty: false}, type: 'string' },
  fields: { type: 'array' },
  limit: { type: 'number' },
  groupBy: { type: 'string' },
  sortBy: { type: 'array' },
  filter: { type: 'boolean' },
  columns: { type: 'number' },
  gutterSize: { type: 'string' },
  orientation: { type: 'string', inclusion: ['portrait', 'landscape'] },
  height: { type: 'string' },
  width: { type: 'string' },
  size: { type: 'string' },
  position: { type: 'string' },
  repeat: { type: 'string' }
}
export default class Config {
  debug: boolean

  from: string
  fields: string[]
  limit: number | null
  groupBy: string | null
  sortBy: string[]
  filter: boolean

  columns: number | null
  gutterSize: string | null
  orientation: string | null
  height: string |  null
  width: string | null

  size: string | null
  position: string | null
  repeat: string | null

  constructor (config: any) {
    config = merge(DEFAULT_CONFIG, config)

    for (const arrayField of ['fields', 'sortBy']) {
      if (config[arrayField] && !Array.isArray(config[arrayField])) {
        config[arrayField] = [config[arrayField]]
      }
    }

    const errors = validate(config, SCHEMA)

    if (errors) {
      throw new Error(`Invalid config: ${errors}`)
    }

    this.debug = config.debug
    this.from = config.from.trim().replace(/[\n\r]+/g, ' ')
    this.fields = config.fields
    this.limit = config.limit
    this.groupBy = config.groupBy
    this.sortBy = config.sortBy
    this.filter = config.filter
    this.height = config.height
    this.width = config.width
    this.columns = config.columns
    this.gutterSize = config.gutterSize
    this.orientation = config.orientation
    this.size = config.size
    this.position = config.position
    this.repeat = config.repeat
  }

  static parse (source: string): Config {
    const parsed = parseYaml(source)
    return new Config(parsed)
  }

  get aspectRatio () {
    if (!this.orientation || this.orientation === 'portrait') {
      return GOLDEN_RATIO
    } else if (this.orientation === 'landscape') {
      return 1 / GOLDEN_RATIO
    } else {
      return null
    }
  }
}
