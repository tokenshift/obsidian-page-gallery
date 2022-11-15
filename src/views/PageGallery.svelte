<script lang="ts">
	import type { Writable } from 'svelte/store';

  import type { ImageConfig } from 'src/Config';

	import type { TileInfo } from 'src/PageGalleryRenderChild'
  import PageGalleryTile from "./PageGalleryTile.svelte"
	import PageGalleryFilter from './PageGalleryFilter.svelte'

  export let config: ImageConfig

  export let query: Writable<string>

  export let tiles: TileInfo[] = []
</script>

<div class="page-gallery"
  style:--image-height={config.height || null}
  style:--image-width={config.width || null}
  style:--image-position={config.position || null}
  style:--image-repeat={config.repeat || null}
  style:--image-fit={config.fit || null}
  style:--max-columns={config.columns || null}>
  <PageGalleryFilter {query} />

  <div class="page-gallery__tiles">
    {#each tiles as tile}
    <PageGalleryTile {tile} />
    {/each}
  </div>
</div>