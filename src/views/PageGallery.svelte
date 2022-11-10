<script lang="ts">
	import { setContext } from 'svelte'

	import type { TileConfig, TileInfo } from 'src/PageGalleryRenderChild'
  import PageGalleryTile from "./PageGalleryTile.svelte"
	import PageGalleryFilter from './PageGalleryFilter.svelte'
	import type { Writable } from 'svelte/store';

  export let config: TileConfig = {
    height: '18em',
    width: '12em',
    position: 'center',
    repeat: 'none',
    size: 'cover'
  }

  export let query: Writable<string>

  export let tiles: TileInfo[] = []

  setContext<TileConfig>('config', config)
</script>

<div class="page-gallery">
  <PageGalleryFilter {query} />

  <div
    class="page-gallery__tiles"
    style="--imageWidth: {config.width}">
    {#each tiles as tile}
    <PageGalleryTile {tile} />
    {/each}
  </div>
</div>