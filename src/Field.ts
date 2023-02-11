import type { Component } from 'obsidian'
import { getAPI, type DataviewApi } from 'obsidian-dataview'
import type { Page } from './Gallery'

/**
 * Field names/expressions that should not be
 * rendered as HTML.
 */
export const PREVENT_RENDER_FIELDS = [
  'file.name'
]

// TODO: Add caching to this.
export default class Field {
  api: DataviewApi

  component: Component
  parentPage: Page
  targetPage: Page
  expression: string

  constructor(options: {
    component: Component
    parentPage: Page,
    targetPage: Page,
    expression: string
  }) {
    const api = getAPI()

    if (!api) {
      throw new Error('Failed to load the Dataview API! Is the obsidian-dataview plugin enabled?')
    }

    this.api = api
    this.component = options.component
    this.parentPage = options.parentPage
    this.targetPage = options.targetPage
    this.expression = options.expression
  }

  get value () {
    // TODO
  }

  get unwrappedValue () {
    // TODO
  }

  get renderedValue () {
    return (async () => {
      if (PREVENT_RENDER_FIELDS.contains(this.expression)) {
        return this.unwrappedValue
      }

      const temp = document.createElement('div')
      await this.api.renderValue(this.value, temp, this.component, this.targetPage.file.path, true)
      return temp.innerHTML
    })
  }
}
