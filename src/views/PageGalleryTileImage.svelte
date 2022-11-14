<script lang="ts">
	import type { TileInfo } from 'src/PageGalleryRenderChild'

  export let tile: TileInfo
</script>

<a class="page-gallery__image internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener">
  <img alt="Link to {tile.filename}"
    src={tile.imageUrl}
    style:background-image={`url('${tile.imageUrl}')`}>
</a>