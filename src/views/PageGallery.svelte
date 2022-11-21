<script lang="ts">
	import type { Writable } from 'svelte/store';

	import type { TileInfo } from 'src/PageGalleryRenderChild'
  import PageGalleryTile from "./PageGalleryTile.svelte"
	import PageGalleryFilter from './PageGalleryFilter.svelte'

  import type Config from 'src/Config';

  export let config: Config

  export let query: Writable<string>

  export let tiles: TileInfo[] = []

  let clientWidth: number
</script>

<div class="page-gallery"
  bind:clientWidth={clientWidth}
  style:--page-gallery-width={`${clientWidth}px`}
  style:--custom-columns={config.columns || null}
  style:--custom-gutter-size={config.gutterSize || null}
  style:--custom-aspect-ratio={config.aspectRatio || null}
  style:--custom-image-height={config.height || null}
  style:--custom-image-width={config.width || null}
  style:--custom-image-size={config.size || null}
  style:--custom-image-position={config.position || null}
  style:--custom-image-repeat={config.repeat || null}>
  {#if config.filter}
  <PageGalleryFilter {query} />
  {/if}

  <div class="page-gallery__tiles">
    {#each tiles as tile}
    <PageGalleryTile {tile} />
    {/each}
  </div>
</div>