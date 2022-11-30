<script type="ts">
	import PageGalleryField from './PageGalleryField.svelte'
	import PageGalleryTileFallback from './PageGalleryTileFallback.svelte'
	import PageGalleryTileImage from './PageGalleryTileImage.svelte'
  import type { Tile } from 'src/TileWrangler'

  export let tile: Tile
</script>

<div class="page-gallery__tile"
  style:--image-size={tile.image.size || null}
  style:--image-position={tile.image.position || null}
  style:--image-repeat={tile.image.repeat || null}>
  {#if tile.image.src}
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