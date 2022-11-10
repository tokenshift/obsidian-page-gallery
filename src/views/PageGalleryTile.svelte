<script type="ts">
	import { getContext } from "svelte";

	import type { TileConfig, TileInfo } from "src/PageGalleryRenderChild";
	import PageGalleryField from "./PageGalleryField.svelte";
	import PageGalleryTileFallback from "./PageGalleryTileFallback.svelte";
	import PageGalleryTileImage from "./PageGalleryTileImage.svelte";

  export let tile: TileInfo

  let config = getContext<TileConfig>('config')
</script>

<div class="page-gallery__tile" style:width={config.width}>
  {#if tile.imageUrl}
  <PageGalleryTileImage {tile} />
  {:else}
  <PageGalleryTileFallback {tile} />
  {/if}

  {#if tile.fields.length > 0}
  <div class="page-gallery__fields">
    {#each tile.fields as field}
    <PageGalleryField {field} />
    {/each}
  </div>
  {/if}
</div>