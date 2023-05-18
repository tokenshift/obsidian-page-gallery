import type { DataviewApi } from 'obsidian-dataview'

import type ExpressionCache from './ExpressionCache'

export type Page = Record<string, any>

export type PageGroup = {
  value: any
  comparable: any
  href?: string
  pages: Page[]
}

export default class PageService {
  api: DataviewApi
  cache: ExpressionCache
  parentPage: string

  constructor(options: {
    api: DataviewApi,
    cache: ExpressionCache
    parentPage: string
  }) {
    this.api = options.api
    this.cache = options.cache
    this.parentPage = options.parentPage
  }

  async getPageGroups (options: {
    from: string,
    where: string,
    filter: string,
    sortBy: string[],
    groupBy: string | null,
    limit: number | null
  }) {
    const {
      from,
      where,
      filter,
      sortBy,
      groupBy,
      limit
    } = options

    console.log('HERE')
    let pages = from
      ? this.api.pages(from, this.parentPage)
      : this.api.pages()

    if (where) {
      pages = pages.filter(p => this.cache.evaluate(where, p))
    }

    if (filter && filter.trim() != '') {
      pages = pages.filter(p => this.matchFilter(filter, p))
    }

    const sortFn = this.getSortFn({ sortBy })
    const sorted: Page[] = Array.from(pages).sort(sortFn)

    const groups = this.getGroupedPages(groupBy, sorted)

    if (limit && limit > -1) {
      const truncated = []
      let count = 0

      for (const group of groups) {
        if (count + group.pages.length <= limit) {
          truncated.push(group)
          count += group.pages.length
        } else if (count < limit) {
          const truncatedGroup = {
            ...group,
            pages: group.pages.slice(0, limit - count)
          }

          truncated.push(truncatedGroup)
          break
        } else {
          break
        }
      }

      return truncated
    } else {
      return groups
    }
  }

  matchFilter (filter: string, page: Page): boolean {
    const patterns = filter.split(/\s+/).map(p => p.toLowerCase())

    // *All* of the defined patterns must match for the filter as a whole to
    // match. Patterns can match tags, filenames/paths, or other page metadata
    // defined either in frontmatter or inline (obsidian-dataview style).
    for (const pattern of patterns) {
      if (pattern.startsWith('#')) {
        // Match tags
        if (!page.file.tags.find((t: string) => t.toLowerCase().startsWith(pattern))) {
          return false
        }
      } else {
        // Match page pat
        if (page.file.path.toLowerCase().contains(pattern)) {
          continue
        }

        // Match other page metadata
        const match = Object.keys(page)
          .filter(k => k != 'file')
          .map(key => page[key])
          .flatMap(val => Array.isArray(val) ? val : [val])
          .map(val => typeof val === 'object' && 'path' in val ? val.path : val)
          .filter(val => typeof val !== 'object' && typeof val !== 'undefined')
          .find(val => val.toString().toLowerCase().contains(pattern))
        if (match) {
          continue
        }

        return  false
      }
    }

    return true
  }

  getSortFn (options: {
    sortBy: string[]
  }) {
    const sortBy = options.sortBy
      .map(field => field.trim().toLowerCase())
      .map(field => field.startsWith('-')
        ? { field: field.substring(1), reverse: true }
        : { field, reverse: false })

    return (a: Page, b: Page): -1 | 0 | 1 => {
      for (const { field, reverse } of sortBy) {
        const aval = this.cache.evaluate(field, a),
              bval = this.cache.evaluate(field, b)

        if (aval != null && bval != null) {
          if (aval < bval) { return reverse ? 1 : -1 }
          else if (aval > bval) { return reverse ? -1 : 1 }
        } else if (aval != null) {
          // Defined before undefined
          return reverse ? 1 : -1
        } else if (bval != null) {
          // Defined before undefined
          return reverse ? -1 : 1
        }
      }

      // Everything matched
      return 0
    }
  }

  getGroupedPages (groupBy: string | null, pages: Page[]): PageGroup[] {
    const groups: Record<string, PageGroup> = {}

    for (const page of pages) {
      const groupValue = groupBy
        ? this.cache.evaluate<string>(groupBy, page)
        : null

      const groupValues = Array.isArray(groupValue)
        ? groupValue
        : [groupValue]

      for (const groupValue of groupValues) {
        const groupComparable = groupValue === null
          ? ''
          : comparableExpressionValue(groupValue, false)

          if (groupComparable in groups) {
            groups[groupComparable].pages.push(page)
          } else {
            groups[groupComparable] = {
              value: groupValue,
              comparable: groupComparable,
              pages: [page]
            }
          }
      }
    }

    return Object.values(groups).sort(({ comparable: a}, { comparable: b }) => {
      if (a === '') { return 1 }
      else if (b === '') { return -1 }
      else if (a < b) { return -1 }
      else { return +1 }
    })
  }
}

/** Given the result of evaluating an obsidian-dataview expression, returns
 * a value that's sortable/comparable. For primitive values (strings, numbers,
 * etc), it just returns the value as-is, while for objects, it attempts to
 * convert them to a comparable primitive value, usually by using one or more
 * of its fields.
 */
function comparableExpressionValue (value: any, caseSensitive = true): string {
  if (typeof value !== 'object' || value === null) { return value }
  else if (value.hasOwnProperty('path')) {
    // Links
    return caseSensitive
      ? value.path as string
      : value.path.toLowerCase() as string
  } else {
    // Fallback/default; render the value as JSON.
    return caseSensitive
      ? JSON.stringify(value)
      : JSON.stringify(value).toLowerCase()
  }
}
