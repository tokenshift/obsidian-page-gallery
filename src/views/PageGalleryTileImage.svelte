<script lang="ts">
	import { getContext } from 'svelte'

	import type { TileConfig, TileInfo } from 'src/PageGalleryRenderChild'

  export let tile: TileInfo

  let config = getContext<TileConfig>('config')
</script>

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