type NestedFn = (el: Context<HTMLElement>) => void | void

export class Context<NodeType extends HTMLElement | DocumentFragment> {
  root: NodeType

  constructor (root: NodeType) {
    this.root = root
  }

  element (tagName: string, attrs: object = {}, fn: NestedFn | void = undefined): void {
    const el = document.createElement(tagName)

    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'style' && typeof val === 'object') {
        for (const [cssKey, cssVal] of Object.entries(val)) {
          el.style.setProperty(cssKey, cssVal as string | null)
        }
      } else if (key === 'text') {
        if (Array.isArray(val)) {
          for (const text of val) {
            el.appendText(text)
          }
        } else {
          el.appendText(val)
        }
      } else {
        el.setAttribute(key, val)
      }
    }

    if (fn) {
      const ctx = new Context(el)
      fn(ctx)
    }

    this.root.appendChild(el)
  }

  style (attrs: object): void {
    if (!this.root.instanceOf(HTMLElement)) { return }

    for (const [cssKey, cssVal] of Object.entries(attrs)) {
      this.root.style.setProperty(cssKey, cssVal as string | null)
    }
  }

  text (...texts: Array<string>): void {
    for (const text of texts) {
      this.root.appendText(text)
    }
  }

  a (attrs: object = {}, fn: NestedFn | void = undefined) { this.element('a', attrs, fn) }
  div (attrs: object = {}, fn: NestedFn | void = undefined) { this.element('div', attrs, fn) }
  span (attrs: object = {}, fn: NestedFn | void = undefined) { this.element('span', attrs, fn) }
}

export function element(tagName: string, attrs: object = {}, fn: NestedFn | void = undefined): DocumentFragment {
  const ctx = new Context(new DocumentFragment())
  ctx.element(tagName, attrs, fn)
  return ctx.root
}

export function a (attrs: object = {}, fn: NestedFn | void = undefined) { return element('a', attrs, fn) }
export function div (attrs: object = {}, fn: NestedFn | void = undefined) { return element('div', attrs, fn) }
export function span (attrs: object = {}, fn: NestedFn | void = undefined) { return element('span', attrs, fn) }