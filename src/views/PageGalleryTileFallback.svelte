<script lang="ts">
	import { getContext } from "svelte";
	import type { TileConfig, TileInfo } from "./PageGallery.svelte";

  export let tile: TileInfo

  let config = getContext<TileConfig>('config')
</script>

<style>
.page-gallery__fallback {
  align-content: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
</style>

<a class="page-gallery__fallback internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener"
  style:height={config.height}
  style:width={config.width}>{tile.filename}</a>