<script type="ts">
	import type { TileConfig, TileInfo } from "src/PageGalleryRenderChild";
	import { getContext } from "svelte";

	import PageGalleryFields from "./PageGalleryFields.svelte";
	import PageGalleryTileFallback from "./PageGalleryTileFallback.svelte";
	import PageGalleryTileImage from "./PageGalleryTileImage.svelte";

  export let tile: TileInfo

  let config = getContext<TileConfig>('config')
</script>

<style>
.page-gallery__tile {
  background: linear-gradient(to bottom right, rgba(100, 100, 100, 0.25), rgba(100, 100, 100, 0.5));
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
  display: block;
  margin: 0;
  opacity: 0.75;
  overflow: hidden;
  padding: 0;
  text-decoration: none;
}

.page-gallery__tile:hover {
  background: linear-gradient(to bottom right, rgba(100, 100, 100, 0.5), rgba(100, 100, 100, 1));
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 1);
  opacity: 1;
}
</style>

<div class="page-gallery__tile" style:width={config.width}>
  {#if tile.imageUrl}
  <PageGalleryTileImage {tile} />
  {:else}
  <PageGalleryTileFallback {tile} />
  {/if}

  {#if tile.fields.length > 0}
  <PageGalleryFields {tile}></PageGalleryFields>
  {/if}
</div>