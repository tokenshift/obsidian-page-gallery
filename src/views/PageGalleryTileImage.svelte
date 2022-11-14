<script lang="ts">
	import { getContext } from 'svelte'

	import type { TileConfig, TileInfo } from 'src/PageGalleryRenderChild'

  export let tile: TileInfo

  let config = getContext<TileConfig>('config')
</script>

<a class="page-gallery__image internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener">
  <img alt="Link to {tile.filename}" src={tile.imageUrl}>
</a>