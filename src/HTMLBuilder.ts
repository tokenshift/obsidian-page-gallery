type NestedBuilder =
  ((ctx: BuilderElement) => Promise<void>) |
  ((ctx: BuilderElement) => void) |
  void

class BuilderContext {
  root: DocumentFragment | HTMLElement

  appendChild (child: HTMLElement | DocumentFragment) {
    this.root.appendChild(child)
  }

  async element (tagName: string, attrs: object = {}, fn: NestedBuilder | void = undefined) {
    const el = document.createElement(tagName)
    this.root.appendChild(el)

    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val)
    }

    if (fn) {
      const child = new BuilderElement(el)
      await fn(child)
    }
  }

  text (...texts: Array<string>) {
    for (const text of texts) {
      this.root.appendText(text)
    }
  }

  a (attrs: object = {}, fn: NestedBuilder) { this.element('a', attrs, fn) }
  br () { this.element('br') }
  div (attrs: object = {}, fn: NestedBuilder) { this.element('div', attrs, fn) }
  pre (attrs: object = {}, fn: NestedBuilder) { this.element('pre', attrs, fn) }
  span (attrs: object = {}, fn: NestedBuilder) { this.element('span', attrs, fn) }
}

class BuilderFragment extends BuilderContext {
  root: DocumentFragment

  constructor (root: DocumentFragment) {
    super()

    this.root = root
  }
}

class BuilderElement extends BuilderContext {
  root: HTMLElement

  constructor (root: HTMLElement) {
    super()

    this.root = root
  }

  style (attrs: object) {
    for (const [key, val] of Object.entries(attrs)) [
      this.root.style.setProperty(key, val)
    ]
  }
}

export async function element (tagName: string, attrs: object = {}, fn: NestedBuilder | void = undefined) {
  const root = document.createDocumentFragment()
  const ctx = new BuilderFragment(root)
  await ctx.element(tagName, attrs, fn)
  return ctx.root
}

export function a (attrs: object = {}, fn: NestedBuilder) { return element('a', attrs, fn) }
export function br () { return element('br') }
export function div (attrs: object = {}, fn: NestedBuilder) { return element('div', attrs, fn) }
export function pre (attrs: object = {}, fn: NestedBuilder) { return element('pre', attrs, fn) }
export function span (attrs: object = {}, fn: NestedBuilder) { return element('span', attrs, fn) }