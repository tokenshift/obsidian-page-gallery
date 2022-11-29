<script lang="ts">
	import type { Tile } from "src/PageGalleryRenderChild";

  export let tile: Tile
</script>

<a class="page-gallery__fallback internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener">{tile.filename}</a>