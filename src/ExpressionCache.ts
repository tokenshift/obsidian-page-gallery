import type { Component } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'
import LRUCache from './LRUCache'
import type { Page } from './PageService'

export default class ExpressionCache {
  component: Component
  api: DataviewApi
  parentPage: Page

  _cache = new LRUCache<any>()

  constructor (options: { component: Component, api: DataviewApi, parentPage: Page }) {
    this.component = options.component
    this.api = options.api
    this.parentPage = options.parentPage
  }

  evaluate<TResult> (expression: string, page: Page) {
    const cacheKey = JSON.stringify({
      parent: {
        path: this.parentPage.file.path,
        mtime: this.parentPage.file.mtime.toMillis(),
        size: this.parentPage.file.size
      },
      page: {
        path: page.file.path,
        mtime: page.file.mtime.toMillis(),
        size: page.file.size
      },
      expression,
      operation: 'evaluate'
    })

    return this._cache.fetch(cacheKey, () => {
      const result = this.api.evaluate(expression, {
        ...page,
        this: this.parentPage
      })

      const value = result.successful
        ? result.value as TResult
        : null

      return value
    })
  }

  async renderFieldValue (expression: string, page: Page): Promise<string | null> {
    const cacheKey = JSON.stringify({
      parent: {
        path: this.parentPage.file.path,
        mtime: this.parentPage.file.mtime.toMillis(),
        size: this.parentPage.file.size
      },
      page: {
        path: page.file.path,
        mtime: page.file.mtime.toMillis(),
        size: page.file.size
      },
      expression,
      operation: 'renderFieldValue'
    })

    return this._cache.fetch(cacheKey, async () => {
      const value = this.evaluate(expression, page)
      if (!value) { return null }

      const temp = document.createElement('div')
      await this.api.renderValue(value, temp, this.component, page.file.path, true)

      return temp.innerHTML
      })
  }
}
