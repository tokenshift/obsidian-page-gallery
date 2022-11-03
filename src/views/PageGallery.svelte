<script lang="ts">
	import { setContext } from 'svelte';

	import type { TileConfig, TileInfo } from 'src/PageGalleryRenderChild';
  import PageGalleryTile from "./PageGalleryTile.svelte";

  export let config: TileConfig = {
    height: '18em',
    width: '12em',
    position: 'center',
    repeat: 'none',
    size: 'cover'
  }

  export let tiles: TileInfo[] = []

  setContext<TileConfig>('config', config)
</script>

<style>
.page-gallery__tiles {
  display: grid;
  gap: 1em;
  grid-auto-flow: row;
  grid-template-columns: repeat(auto-fill, minmax(var(--imageWidth, 12em), 1fr));
  list-style-type: none;
  margin: 0;
  overflow-x: auto;
  padding: 0;
}
</style>

<div class="page-gallery">
  <div
    class="page-gallery__tiles"
    style="--imageWidth: {config.width}">
    {#each tiles as tile}
    <PageGalleryTile {tile} />
    {/each}
  </div>
</div>