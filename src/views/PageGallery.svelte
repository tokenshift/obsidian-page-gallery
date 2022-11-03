<script lang="ts" context="module">
</script>

<script lang="ts">

	import type { DataviewApi } from 'obsidian-dataview';
	import type { TileConfig, TileInfo } from 'src/PageGalleryRenderChild';
	import type PageGalleryRenderChild from 'src/PageGalleryRenderChild';
	import { setContext } from 'svelte';

  import PageGalleryTile from "./PageGalleryTile.svelte";

  export let api: DataviewApi
  export let container: PageGalleryRenderChild

  export let config: TileConfig = {
    height: '18em',
    width: '12em',
    position: 'center',
    repeat: 'none',
    size: 'cover'
  }

  export let tiles: TileInfo[] = []

  setContext<DataviewApi>('api', api)
  setContext<TileConfig>('config', config)
  setContext<PageGalleryRenderChild>('container', container)
</script>

<style>
.page-gallery__tiles {
  display: grid;
  grid-auto-flow: row;
  gap: 1em;
  list-style-type: none;
  margin: 0;
  overflow-x: auto;
  padding: 0;
}
</style>

<!-- TODO: Use component composition for tiles -->
<div class="page-gallery">
  <div
    class="page-gallery__tiles"
    style:grid-template-columns={`repeat(auto-fill, minmax(${config.width}, 1fr))`}>
    {#each tiles as tile}
    <PageGalleryTile {tile} />
    {/each}
  </div>
</div>