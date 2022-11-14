<script lang="ts">
	import type { TileInfo } from "src/PageGalleryRenderChild";

  export let tile: TileInfo
</script>

<a class="page-gallery__fallback internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener">{tile.filename}</a>