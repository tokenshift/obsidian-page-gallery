<script lang="ts">
	import { getContext } from "svelte";

	import type { TileConfig, TileInfo } from "src/PageGalleryRenderChild";

  export let tile: TileInfo

  let config = getContext<TileConfig>('config')
</script>

<a class="page-gallery__fallback internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener">{tile.filename}</a>