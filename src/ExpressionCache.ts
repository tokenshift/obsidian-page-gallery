import type { Component } from 'obsidian'
import type { DataviewApi } from 'obsidian-dataview'

export type Page = Record<string, any>

export default class ExpressionCache {
  component: Component
  api: DataviewApi
  parentPage: Page

  constructor (options: { component: Component, api: DataviewApi, parentPage: Page }) {
    this.component = options.component
    this.api = options.api
    this.parentPage = options.parentPage
  }

  evaluate<TResult> (expression: string, targetPage: Page) {
    // TODO: Cache these results based on parentPage and targetPage mod times.
    const result = this.api.evaluate(expression, {
      ...targetPage,
      this: this.parentPage
    })

    return result.successful
      ? result.value as TResult
      : null

  }

  async renderFieldValue (page: Page, value: any): Promise<string | null> {
    if (!value) { return null }

    // if (value && expression !== 'file.name')
    const temp = document.createElement('div')
    await this.api.renderValue(value, temp, this.component, page.file.path, true)
    return temp.innerHTML
  }
}
