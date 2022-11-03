<script lang="ts">
	import { getContext } from "svelte";

	import type { TileConfig, TileInfo } from "src/PageGalleryRenderChild";

  export let tile: TileInfo

  let config = getContext<TileConfig>('config')
</script>

<style>
  .page-gallery__image {
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    display: block;
  }

  .page-gallery__image .hidden {
    visibility: hidden;
  }
</style>

<a class="page-gallery__image internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener"
  style:background-position={config.position}
  style:background-size={config.size}
  style:background-image={`url('${tile.imageUrl}')`}
  style:background-repeat={config.repeat}
  style:height={config.height}
  style:width={config.width}>
  <span class="hidden">Link to {tile.filename}</span>
</a>