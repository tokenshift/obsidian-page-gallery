import type { Component } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'

import LRUCache from './LRUCache'
import type { Page } from './PageService'

export default class ExpressionCache {
  component: Component
  api: DataviewApi
  parentPage: Page

  constructor (options: { component: Component, api: DataviewApi, parentPage: Page }) {
    this.component = options.component
    this.api = options.api
    this.parentPage = options.parentPage
  }

  /** Helper function to determine if a given value looks like it should be
   * rendered.
   */
  appearsRenderable (value: any) {
    const renderableStringPatterns = [
      /^#[0-9a-z-_/]+/i,
      /\[\[.*\]\]/,
      /\[.*\]\(.*\)/
    ]

    if (value === null) { return false }
    if (typeof value === 'object') { return true }
    if (typeof value === 'string') {
      if (renderableStringPatterns.find(p => p.exec(value))) {
        return true
      }
    }
    return false
  }

  _evaluateCache = new LRUCache<any>()
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
      expression
    })

    return this._evaluateCache.fetch(cacheKey, () => {
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

  _renderExpressionCache = new LRUCache<Promise<string | null>>()
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
      expression
    })

    return this._renderExpressionCache.fetch(cacheKey, async () => {
      const value = this.evaluate(expression, page)
      if (!value) { return null }

      return await this.renderFieldValue(value, page)
    })
  }

  _renderFieldValueCache = new LRUCache<Promise<string | null>>()
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
      value
    })

    return this._renderFieldValueCache.fetch(cacheKey, async () => {
      if (!value) { return null }

      const temp = document.createElement('div')
      await this.api.renderValue(value, temp, this.component, page?.file.path || this.parentPage.file.path, true)

      return temp.innerHTML
    })
  }
}
