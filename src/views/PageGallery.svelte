<script lang="ts">
  import { debounce, type Component } from 'obsidian'
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
  const pageService = new PageService({ api, cache, parentPage: parentPage.file.path })
  const pageContentService = new PageContentService({ plugin, component })

  let febreze = false
  let refreshCurrentView: () => Promise<void>

  export function refresh () {
    refreshCurrentView()

    // The `febreze` marker can be used to force refresh for any other parts of
    // the UI that need to be recomputed when `refresh` is called (e.g. page counts).
    febreze = !febreze
  }

  setContext('DataviewApi', api)
  setContext('ExpressionCache', cache)
  setContext('PageService', pageService)
  setContext('PageContentService', pageContentService)

  let filter = writable<string>('')
  let debouncedFilter = writable<string>('')
  filter.subscribe(debounce(debouncedFilter.set, 250))

  let selectedViewIndex: number = 0
  let selectedView = config.views[selectedViewIndex]

  function handleSelectView (view: ViewConfig, viewIndex: number) {
    selectedView = view
    selectedViewIndex = viewIndex
  }

  async function getViewCount (febreze: boolean, view: ViewConfig) {
    const groups = await pageService.getPageGroups({ ...view, filter: '' })

    // Want to only count unique pages in each view (since the same page can
    // show up in multiple groups in the page).
    const paths = groups.flatMap((group) => group.pages.map((page) => page.file.path))
    return new Set(paths).size
  }
</script>

<div class="page-gallery">
  {#if config.title}
  <header class="page-gallery__title"><h2>{config.title}</h2></header>
  {/if}

  {#if config.debug}
  <pre class="page-gallery__debug">{JSON.stringify(config, null, 2)}</pre>
  {/if}

  {#if config.filter}
  <PageGalleryFilter {filter} />
  {/if}

  {#if config.count && config.views.length === 1}
    {#await getViewCount(febreze, config.views[0]) then count}
      <div class="page-gallery__total-count">Total: {count}</div>
    {/await}
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
        {#if config.count}
          {#await getViewCount(febreze, view) then count}
            <span class="page-gallery__views-header-item-count">({count})</span>
          {/await}
        {/if}
      </div>
      {/each}
    </div>
    {/if}

    <PageGalleryView {config} view={selectedView} filter={debouncedFilter} bind:refresh={refreshCurrentView} />
  </div>
</div>
