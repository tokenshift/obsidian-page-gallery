<script lang="ts">
	import type { TileInfo } from 'src/PageGalleryRenderChild'

  export let tile: TileInfo
</script>

<a class="page-gallery__image internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener"
  style:background-image={`url('${tile.imageUrl}')`}>
  <span class="page-gallery__hidden">Link to {tile.filename}</span>
</a>