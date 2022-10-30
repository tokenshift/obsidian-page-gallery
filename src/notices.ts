import * as builder from 'src/HTMLBuilder'

export function missingObsidianDataview () {
  return  builder.span({}, span => {
    span.text('Failed to load the Dataview API! Is the ')
    span.a({ href: 'https://github.com/blacksmithgu/obsidian-dataview'}, a => {
      a.text('obsidian-dataview')
    })
    span.text(' plugin enabled?')
  })
}
