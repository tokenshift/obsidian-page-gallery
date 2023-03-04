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

  evaluate<TResult> (expression: string, targetPage: Page) {
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

    const temp = document.createElement('div')
    await this.api.renderValue(value, temp, this.component, page.file.path, true)
    return temp.innerHTML
  }
}
