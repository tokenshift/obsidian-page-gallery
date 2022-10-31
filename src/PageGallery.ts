import merge from 'deepmerge'
import * as builder from './HTMLBuilder'

const DEFAULT_CONFIG: PageGalleryConfig = {
  height: '18em',
  width: '12em',
  position: 'center',
  repeat: 'none',
  size: 'cover'
}

export type PageGalleryConfig = {
  height?: string
  width?: string
  position?: string
  repeat?: string
  size?: string
}

export type PageGalleryTile = {
  href: string
  imageUrl: string | null
  filename: string
  fields?: Array<PageGalleryField>
}

export type PageGalleryField = {
  name: string
  value: string
  render: (container: HTMLElement) => void
}

export default class PageGalleryModel {
  config: PageGalleryConfig
  tiles: Array<PageGalleryTile>

  constructor (options: {
    config?: PageGalleryConfig,
    tiles?: Array<PageGalleryTile>
  } = {}) {
    this.config = merge(DEFAULT_CONFIG, options.config || {})
    this.tiles = options.tiles || []
  }

  render (): Node {
    return builder.div({ class: 'page-gallery' }, div => {
      div.style({
        'grid-template-columns': `repeat(auto-fill, minmax(${this.config.width}, 1fr))`
      })

      for (const tile of this.tiles) {
        div.div({ class: 'page-gallery__tile' }, div => {
          div.style({
            width: this.config.width
          })

          if (tile.imageUrl) {
            div.a({
              class: 'page-gallery__image internal-link',
              'data-href': tile.href,
              href: tile.href,
              target: '_blank',
              rel: 'noopener',
              style: {
                'background-position': this.config.position,
                'background-size': this.config.size,
                'background-image': `url('${tile.imageUrl}')`,
                'height': this.config.height,
                'width': this.config.width
              }
            })
          } else {
            div.a({
              class: 'page-gallery__fallback internal-link',
              'data-href': tile.href,
              href: tile.href,
              target: '_blank',
              rel: 'noopener',
              style: {
                height: this.config.height,
                width: this.config.width
              },
              text: tile.filename
            })
          }

          if (Array.isArray(tile.fields) && tile.fields.length > 0) {
            div.div({ class: 'page-gallery__fields' }, div => {
              for (const field of tile.fields as Array<PageGalleryField>) {
                div.div({
                  class: 'page-gallery__field',
                  'data-page-gallery-field-name': field.name
                }, div => {
                  field.render(div.root as HTMLElement)
                })
              }
            })
          }
        })
      }
    })
  }
}