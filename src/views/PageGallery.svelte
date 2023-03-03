<script lang="ts">
  import type { DataviewApi } from 'obsidian-dataview'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  import PageGalleryFilter from './PageGalleryFilter.svelte'
  import PageGalleryView from './PageGalleryView.svelte'

  import type { ViewConfig } from '../Config'
  import type Config from '../Config'
  import ExpressionCache from '../ExpressionCache'
  import PageService from '../PageService'
  import type PageGalleryPlugin from '../PageGalleryPlugin'
    import type { Component } from 'obsidian';

  export let plugin: PageGalleryPlugin
  export let component: Component
  export let api: DataviewApi
  export let config: Config
  export let parentPage: Record<string, any>

  const cache = new ExpressionCache({ api, parentPage })
  const pageService = new PageService({ plugin, component, api, cache })

  setContext('DataviewApi', api)
  setContext('ExpressionCache', cache)
  setContext('PageService', pageService)

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
  <header class="page-gallery__title">{config.title}</header>
  {/if}

  {#if config.debug}
  <pre class="page-gallery__debug">{JSON.stringify(config, null, 2)}</pre>
  {/if}

  {#if config.filter}
  <PageGalleryFilter {filter} />
  {/if}

  <div class="page-gallery__views">
    {#if config.views.length > 1}
    <ol class="page-gallery__views-header">
      {#each config.views as view, index}
      <li class:selected={index === selectedViewIndex}
          on:click={() => handleSelectView(view, index)}
          on:keypress={() => handleSelectView(view, index)}>
        {view.name}
      </li>
      {/each}
    </ol>
    {/if}

    <PageGalleryView view={selectedView} {filter} />
  </div>
</div>