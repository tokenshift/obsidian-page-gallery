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

  constructor(options: {
    api: DataviewApi,
    cache: ExpressionCache
  }) {
    this.api = options.api
    this.cache = options.cache
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

    let pages = from
      ? this.api.pages(from)
      : this.api.pages()

    if (where) {
      pages = pages.filter(p => this.cache.evaluate(where, p))
    }

    if (filter && filter.trim() != '') {
      pages = pages.filter(p => this.matchFilter(filter, p))
    }

    const sortFn = this.getSortFn({ sortBy, groupBy })
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

    for (const pattern of patterns) {
      if (pattern.startsWith('#')) {
        // Match tags
        for (const tag of page.file.tags) {
          if (tag.toLowerCase().startsWith(pattern)) {
            return true
          }
        }

        return false
      } else {
        // Match path
        if (!page.file.path.toLowerCase().contains(pattern)) {
          return false
        }
      }
    }

    return true
  }

  getSortFn (options: {
    sortBy: string[],
    groupBy: string | null
  }) {
    const {
      groupBy
    } = options

    const sortBy = options.sortBy
      .map(field => field.trim().toLowerCase())
      .map(field => field.startsWith('-')
        ? { field: field.substring(1), reverse: true }
        : { field, reverse: false })

    return (a: Page, b: Page): -1 | 0 | 1 => {
      // TODO: This function is really slow--and happens pre-pagination/lazy-
      // loading, so it really needs to be optimized.

      // Sort by `groupBy` first...
      if (groupBy) {
        const aval = comparableExpressionValue(this.cache.evaluate(groupBy, a)),
              bval = comparableExpressionValue(this.cache.evaluate(groupBy, b))

        if (aval && bval) {
          if (aval < bval) { return -1 }
          else if (aval > bval) { return 1 }
        } else if (aval) {
          // List pages w/ group-by values first (i.e. where the group-by field
          // isn't null/missing)
          return -1
        } else if (bval) {
          return 1
        }
      }

      // ...then by `sortBy` fields.
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
    const groups: PageGroup[] = []
    let currentGroup: PageGroup | null = null

    for (const page of pages) {
      const groupValue = groupBy
        ? this.cache.evaluate<string>(groupBy, page)
        : null

      const groupComparable = groupValue === null
        ? null
        : comparableExpressionValue(groupValue)

      if (currentGroup === null || groupComparable != currentGroup.comparable) {
        currentGroup = {
          value: groupValue,
          comparable: groupComparable,
          pages: [page]
        }

        groups.push(currentGroup)
      } else {
        currentGroup.pages.push(page)
      }
    }

    return groups
  }
}

/** Given the result of evaluating an obsidian-dataview expression, returns
 * a value that's sortable/comparable. For primitive values (strings, numbers,
 * etc), it just returns the value as-is, while for objects, it attempts to
 * convert them to a comparable primitive value, usually by using one or more
 * of its fields.
 */
function comparableExpressionValue (value: any) {
  if (typeof value !== 'object' || value === null) { return value }
  else if (value.hasOwnProperty('path')) {
    // Links
    return value.path
  } else {
    // Fallback/default; render the value as JSON.
    return JSON.stringify(value)
  }
}
