<script lang="ts">
  import { getContext } from 'svelte'
  import type { Readable } from 'svelte/store'

  import type { ViewConfig } from '../Config'
  import type PageService from '../PageService'
  import PageGalleryGroup from './PageGalleryGroup.svelte';

  export let view: ViewConfig
  export let filter: Readable<string>

  const pageService = getContext<PageService>('PageService')

  export function refresh () { view = view }
</script>

{#await pageService.getPageGroups({ ...view, filter: $filter } )}
<section class="page-gallery__view page-gallery__view--loading">
  Loading...
</section>
{:then groups}
<section class="page-gallery__view page-gallery__view--loaded"
  style:--custom-columns={view.columns || null}
  style:--custom-gutter-size={view.gutterSize || null}
  style:--custom-aspect-ratio={view.aspectRatio || null}
  style:--custom-border-radius={view.radius || null}
  style:--custom-image-height={view.height || null}
  style:--custom-image-width={view.width || null}
  style:--custom-image-size={view.size || null}
  style:--custom-image-position={view.position || null}
  style:--custom-image-repeat={view.repeat || null}>
  {#if groups.length < 1}
    <div class="page-gallery__group page-gallery__group--empty">
      Nothing to see here!
    </div>
  {/if}

  {#each groups as group}
    <PageGalleryGroup {group} {groups} {view} />
  {/each}
</section>
{/await}
