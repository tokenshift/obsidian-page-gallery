import type { Component } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'

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

  evaluate<TResult> (expression: string, page: Page) {
    const result = this.api.evaluate(expression, {
      ...page,
      this: this.parentPage
    })

    const value = result.successful
      ? result.value as TResult
      : null

    return value
  }

  async renderExpression (expression: string, page: Page): Promise<string | null> {
    const value = this.evaluate(expression, page)
    if (!value) { return null }

    return await this.renderFieldValue(value, page)
  }

  async renderFieldValue (value: any, page: Page | null = null): Promise<string | null> {
    if (!value) { return null }

    const temp = document.createElement('div')
    await this.api.renderValue(value, temp, this.component, page?.file.path || this.parentPage.file.path, true)

    return temp.innerHTML
  }
}
