<script type="ts">
	import type { TileInfo } from "src/PageGalleryRenderChild";
	import PageGalleryField from "./PageGalleryField.svelte";
	import PageGalleryTileFallback from "./PageGalleryTileFallback.svelte";
	import PageGalleryTileImage from "./PageGalleryTileImage.svelte";

  export let tile: TileInfo
</script>

<div class="page-gallery__tile">
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