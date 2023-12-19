<script lang="ts">
  import { getContext } from 'svelte'

  import type Config from '../Config'
  import type { ViewConfig } from '../Config'
  import type ExpressionCache from '../ExpressionCache'
  import type { PageGroup } from '../PageService'

  import PageGalleryTile from './PageGalleryTile.svelte'

  export let group: PageGroup
  export let groups: PageGroup[]
  export let config: Config
  export let view: ViewConfig

  const cache = getContext<ExpressionCache>('ExpressionCache')

  let collapsed = false

  async function getGroupCount (group: PageGroup) {
    return new Set(group.pages.map((page) => page.file.path)).size
  }
</script>

<div class="page-gallery__group">
  {#if group.value}
    <header class="page-gallery__group-title">
      <h3>
        <span class="page-gallery__group-collapse"
          role="button"
          title={collapsed ? 'Expand' : 'Collapse'}
          tabindex="0"
          on:click={() => collapsed = !collapsed}
          on:keypress={() => collapsed = !collapsed}>
          {collapsed ? '🔽' : '🔼'}
        </span>
        {#if cache.appearsRenderable(group.value)}
          {#await cache.renderFieldValue(group.value) then rendered}
            {@html rendered}
          {/await}
        {:else}
          {group.value}
        {/if}
        {#if config.count}
          {#await getGroupCount(group) then count}
            <span class="page-gallery__group-title-count">({count})</span>
          {/await}
        {/if}
      </h3>
    </header>
  {:else if groups.length > 1}
    <header class="page-gallery__group-title page-gallery__group-title--fallback">
      <h3>
        <span class="page-gallery__group-collapse"
          role="button"
          title={collapsed ? 'Expand' : 'Collapse'}
          tabindex="0"
          on:click={() => collapsed = !collapsed}
          on:keypress={() => collapsed = !collapsed}>
          {collapsed ? '🔽' : '🔼'}
        </span>
        Other
        {#if config.count}
          {#await getGroupCount(group) then count}
            <span class="page-gallery__group-title-count">({count})</span>
          {/await}
        {/if}
      </h3>
    </header>
  {/if}

  {#if collapsed}
    <div class="page-gallery__tiles--collapsed"></div>
  {:else}
    <div class="page-gallery__tiles">
      {#each group.pages as page}
        <PageGalleryTile {page} {view} />
      {/each}
    </div>
  {/if}
</div>