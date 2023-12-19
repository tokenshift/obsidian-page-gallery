import { parseYaml } from 'obsidian'
import merge from 'ts-deepmerge'
import validate from 'validate.js'

export const DEFAULT_VIEW_CONFIG = {
  mode: 'auto',
  fields: [],
  limit: 100,
  sortBy: ['file.path']
}

export const GOLDEN_RATIO = 1.618

export const VIEW_CONFIG_SCHEMA = {
  name: { type: 'string' },
  from: { presence: { allowEmpty: false}, type: 'string' },
  where: { type: 'string' },
  fields: { type: 'array' },
  limit: { type: 'number' },
  groupBy: { type: 'string' },
  sortBy: { type: 'array' },
  filter: { type: 'boolean' },
  count: { type: 'boolean' },
  columns: { type: 'number' },
  gutterSize: { type: 'string' },
  orientation: { type: 'string', inclusion: {
    within: ['portrait', 'landscape', 'square'],
    message: 'must be "portrait" (default), "landscape", or "square"'
  } },
  radius: { type: 'string' },
  height: { type: 'string' },
  width: { type: 'string' },
  mode: { type: 'string', inclusion: {
    within: ['auto', 'content', 'image'],
    message: 'must be "auto" (default), "content", or "image"'
  } },
  size: { type: 'string' },
  position: { type: 'string' },
  repeat: { type: 'string' }
}

export class ViewConfig {
    name: string
    mode: string
    count: boolean

    from: string
    where: string

    fields: string[]
    limit: number | null
    groupBy: string | null
    sortBy: string[]

    columns: number | null
    gutterSize: string | null
    orientation: string | null
    radius: string | null
    height: string |  null
    width: string | null

    size: string | null
    position: string | null
    repeat: string | null

  constructor (options: any, fallback: any = {}) {
    options = merge.withOptions({
      mergeArrays: false
    }, DEFAULT_VIEW_CONFIG, fallback, options)

    for (const arrayField of ['fields', 'sortBy']) {
      if (options[arrayField] && !Array.isArray(options[arrayField])) {
        options[arrayField] = [options[arrayField]]
      }
    }

    const errors = validate(options, VIEW_CONFIG_SCHEMA, { format: 'flat' })

    if (errors) {
      throw new Error(`Invalid config: ${errors}`)
    }

    this.name = options.name
      ? options.name.trim()
      : null
    this.mode = options.mode

    this.from = options.from.trim().replace(/[\n\r]+/g, ' ')
    this.where = options.where
      ? options.where.trim().replace(/[\n\r]+/g, ' ')
      : null

    this.fields = options.fields
    this.limit = options.limit
    this.groupBy = options.groupBy
    this.sortBy = options.sortBy

    this.columns = options.columns
    this.gutterSize = options.gutterSize
    this.orientation = options.orientation
    this.radius = options.radius
    this.height = options.height
    this.width = options.width

    this.size = options.size
    this.position = options.position
    this.repeat = options.repeat
  }

  get aspectRatio () {
    switch (this.orientation) {
      case 'portrait':
        return GOLDEN_RATIO
      case 'landscape':
        return 1 / GOLDEN_RATIO
      case 'square':
        return 1
      default:
        return GOLDEN_RATIO
    }
  }
}

/**
 * The Page Gallery config consists of a list of ViewConfig items, which hold
 * all of the options for an individual view (or tab). If there's no `views`
 * attribute in the root config, then the gallery is assumed to have a single
 * view, with all of its options provided in the root config; otherwise, any
 * options provided in the root config are used as default/fallback values for
 * the defined views, so that individual views only have to define whatever
 * options are unique to that view.
 */
export default class Config {
  views: ViewConfig[] = []

  title: string | null
  filter: boolean
  count: boolean
  debug: boolean

  constructor (options: Record<string, any>) {
    if (Array.isArray(options.views)) {
      this.views = options.views.map(v => new ViewConfig(v, options))
    } else {
      this.views = [new ViewConfig(options, {})]
    }

    for (let i = 0; i < this.views.length; ++i) {
      if (!this.views[i].name) {
        this.views[i].name = `View ${i+1}`
      }
    }

    this.title = options.hasOwnProperty('title')
      ? options.title.toString()
      : null

    this.filter = options.hasOwnProperty('filter')
      ? options.filter == true
      : true

    this.count = options.hasOwnProperty('count')
      ? options.count == true
      : true

    this.debug = options.hasOwnProperty('debug')
      ? options.debug == true
      : false
  }

  static parse (source: string) {
    const parsed = parseYaml(source)
    return new Config(parsed)
  }
}
