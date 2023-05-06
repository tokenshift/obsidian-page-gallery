<script lang="ts">
  import { getContext } from 'svelte'

  import type { ViewConfig } from 'src/Config'
  import type ExpressionCache from '../ExpressionCache'
  import type { PageGroup } from '../PageService'

  import PageGalleryTile from './PageGalleryTile.svelte'

  export let group: PageGroup
  export let groups: PageGroup[]
  export let view: ViewConfig

  const cache = getContext<ExpressionCache>('ExpressionCache')
</script>

<div class="page-gallery__group">
  {#if group.value}
  <header class="page-gallery__group-title">
    <h3>
      {#if cache.appearsRenderable(group.value)}
      {#await cache.renderFieldValue(group.value) then rendered}
      {@html rendered}
      {/await}
      {:else}
      {group.value}
      {/if}
    </h3>
  </header>
  {:else if groups.length > 1}
  <header class="page-gallery__group-title page-gallery__group-title--fallback">
    <h3>Other</h3>
  </header>
  {/if}

  <div class="page-gallery__tiles">
    {#each group.pages as page}
    <PageGalleryTile {page} {view} />
    {/each}
  </div>
</div>