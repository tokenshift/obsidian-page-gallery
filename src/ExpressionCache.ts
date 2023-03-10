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

  /** Helper function to determine if a given value looks like it should be
   * rendered.
   */
  appearsRenderable (value: any) {
    if (value === null) { return false }
    if (typeof value === 'object') { return true }
    if (typeof value === 'string' && new RegExp('^#[0-9a-z-_/]+', 'i').exec(value)) { return true }
    return false
  }

  evaluate<TResult> (expression: string, page: Page | null = null) {
    const cacheKey = JSON.stringify({
      parent: {
        path: this.parentPage.file.path,
        mtime: this.parentPage.file.mtime.toMillis(),
        size: this.parentPage.file.size
      },
      page: {
        path: page?.file.path,
        mtime: page?.file.mtime.toMillis(),
        size: page?.file.size
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

  async renderExpression (expression: string, page: Page | null = null): Promise<string | null> {
    const cacheKey = JSON.stringify({
      parent: {
        path: this.parentPage.file.path,
        mtime: this.parentPage.file.mtime.toMillis(),
        size: this.parentPage.file.size
      },
      page: {
        path: page?.file.path,
        mtime: page?.file.mtime.toMillis(),
        size: page?.file.size
      },
      expression,
      operation: 'renderExpression'
    })

    return this._cache.fetch(cacheKey, async () => {
      const value = this.evaluate(expression, page)
      if (!value) { return null }

      return await this.renderFieldValue(value, page)
    })
  }

  async renderFieldValue (value: any, page: Page | null = null): Promise<string | null> {
    const cacheKey = JSON.stringify({
      parent: {
        path: this.parentPage.file.path,
        mtime: this.parentPage.file.mtime.toMillis(),
        size: this.parentPage.file.size
      },
      page: {
        path: page?.file.path,
        mtime: page?.file.mtime.toMillis(),
        size: page?.file.size
      },
      value,
      operation: 'renderFieldValue'
    })

    return this._cache.fetch(cacheKey, async () => {
      if (!value) { return null }

      const temp = document.createElement('div')
      await this.api.renderValue(value, temp, this.component, page?.file.path || this.parentPage.file.path, true)

      return temp.innerHTML
    })
  }
}
