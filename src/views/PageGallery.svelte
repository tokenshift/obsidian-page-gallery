<script lang="ts">
  import type { Component } from 'obsidian'
  import type { DataviewApi } from 'obsidian-dataview'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

import type { ViewConfig } from '../Config'
import type Config from '../Config'
import ExpressionCache from '../ExpressionCache'
import PageService from '../PageService'
import PageContentService from '../PageContentService'
import type PageGalleryPlugin from '../PageGalleryPlugin'

  import PageGalleryFilter from './PageGalleryFilter.svelte'
  import PageGalleryView from './PageGalleryView.svelte'

  export let plugin: PageGalleryPlugin
  export let component: Component
  export let api: DataviewApi
  export let config: Config
  export let parentPage: Record<string, any>

  const cache = new ExpressionCache({ api, component, parentPage })
  const pageService = new PageService({ api, cache })
  const pageContentService = new PageContentService({ plugin, component })

  let refreshCurrentView: () => void

  export function refresh () {
    refreshCurrentView()
  }

  setContext('DataviewApi', api)
  setContext('ExpressionCache', cache)
  setContext('PageService', pageService)
  setContext('PageContentService', pageContentService)

  let clientWidth: number
  let filter = writable<string>('')

  let selectedViewIndex: number = 0
  let selectedView = config.views[selectedViewIndex]

  function handleSelectView (view: ViewConfig, viewIndex: number) {
    selectedView = view
    selectedViewIndex = viewIndex
  }
</script>

<div class="page-gallery"
  bind:clientWidth={clientWidth}
  style:--page-gallery-width={`${clientWidth}px`}>
  {#if config.title}
  <header class="page-gallery__title"><h2>{config.title}</h2></header>
  {/if}

  {#if config.debug}
  <pre class="page-gallery__debug">{JSON.stringify(config, null, 2)}</pre>
  {/if}

  {#if config.filter}
  <PageGalleryFilter {filter} />
  {/if}

  <div class="page-gallery__views">
    {#if config.views.length > 1}
    <div class="page-gallery__views-header">
      {#each config.views as view, index}
      <div class="page-gallery__views-header-item"
        class:selected={index === selectedViewIndex}
        tabindex=0
        role="button"
        on:click={() => handleSelectView(view, index)}
        on:keypress={() => handleSelectView(view, index)}>
        {view.name}
      </div>
      {/each}
    </div>
    {/if}

    <PageGalleryView view={selectedView} {filter} bind:refresh={refreshCurrentView} />
  </div>
</div>
