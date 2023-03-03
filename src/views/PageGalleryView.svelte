<script lang="ts">
  import { getContext } from 'svelte'
  import type { Readable } from 'svelte/store'

  import type { ViewConfig } from '../Config'
  import type PageService from '../PageService'
  import PageGalleryTile from './PageGalleryTile.svelte'

  export let view: ViewConfig
  export let filter: Readable<string>

  const pageService = getContext<PageService>('PageService')

  let pageGroups = pageService.getPageGroups({ ...view, filter: $filter } )

  export function refresh () {
    pageGroups = pageService.getPageGroups({ ...view, filter: $filter } )
  }
</script>

{#await pageGroups}
<section class="page-gallery__view page-gallery__view--loading">
  Loading...
</section>
{:then groups}
<section class="page-gallery__view page-gallery__view--loaded"
  style:--custom-columns={view.columns || null}
  style:--custom-gutter-size={view.gutterSize || null}
  style:--custom-aspect-ratio={view.aspectRatio || null}
  style:--custom-image-height={view.height || null}
  style:--custom-image-width={view.width || null}
  style:--custom-image-size={view.size || null}
  style:--custom-image-position={view.position || null}
  style:--custom-image-repeat={view.repeat || null}>
  {#each groups as group}
  <div class="page-gallery__group">
    {#if group.name}
    <header class="page-gallery__group-title">
      {@html group.name}
    </header>
    {:else if groups.length > 1}
    <header class="page-gallery__group-title page-gallery__group-title--fallback">
      Other
    </header>
    {/if}

    <div class="page-gallery__tiles">
      {#each group.pages as page}
      <PageGalleryTile {page} {view} />
      {/each}
    </div>
  </div>
  {/each}
  <!--
    Get all pages matching the `from` and `where` queries.
    Group them by the `groupBy` clause, if there is any.
  -->
</section>
{/await}