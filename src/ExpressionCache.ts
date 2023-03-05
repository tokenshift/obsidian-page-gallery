// import NodeCache from 'node-cache'
import type { Component } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'
import type { Page } from './PageService'

// const CACHE_TTL = 60

export default class ExpressionCache {
  component: Component
  api: DataviewApi
  parentPage: Page

  constructor (options: { component: Component, api: DataviewApi, parentPage: Page }) {
    this.component = options.component
    this.api = options.api
    this.parentPage = options.parentPage
  }

  // _evaluateCache = new NodeCache({ stdTTL: CACHE_TTL })
  evaluate<TResult> (expression: string, page: Page) {
    // const cacheKey = JSON.stringify([
    //   this.parentPage.file.mtime.toMillis(),
    //   this.parentPage.file.size,
    //   page.file.mtime.toMillis(),
    //   page.file.size,
    //   expression
    // ])

    // const cached = this._evaluateCache.get(cacheKey)
    // if (cached !== undefined) { return cached }

    const result = this.api.evaluate(expression, {
      ...page,
      this: this.parentPage
    })

    const value = result.successful
      ? result.value as TResult
      : null

    // this._evaluateCache.set(cacheKey, value)

    return value
  }

  // _renderCache = new NodeCache({ stdTTL: CACHE_TTL })
  async renderFieldValue (expression: string, page: Page): Promise<string | null> {
    // const cacheKey = JSON.stringify([
    //   this.parentPage.file.mtime.toMillis(),
    //   this.parentPage.file.size,
    //   page.file.mtime.toMillis(),
    //   page.file.size,
    //   expression
    // ])

    // const cached = this._renderCache.get(cacheKey)
    // if (cached !== undefined) { return cached as string | null }

    const value = this.evaluate(expression, page)
    if (!value) { return null }

    const temp = document.createElement('div')
    await this.api.renderValue(value, temp, this.component, page.file.path, true)

    // this._renderCache.set(cacheKey, temp.innerHTML)

    return temp.innerHTML
  }
}
