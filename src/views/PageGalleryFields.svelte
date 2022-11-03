<script lang="ts">
	import type { TileInfo } from "./PageGallery.svelte";
	import PageGalleryField from "./PageGalleryField.svelte";

  export let tile: TileInfo
</script>

<style>
.page-gallery__fields {
  padding: 0 0.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}
</style>

<div class="page-gallery__fields">
  {#each tile.fields as field}
  <PageGalleryField {tile} {field} />
  {/each}
</div>