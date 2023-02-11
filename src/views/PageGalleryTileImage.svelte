<script lang="ts">
	import type { Tile } from 'src/TileWrangler'

  export let tile: Tile
</script>

<a class="page-gallery__image internal-link"
  data-href={tile.href}
  href={tile.href}
  rel="noopener"
  style:background-image={`url('${tile.image.src}')`}>
  <span class="page-gallery__hidden">Link to {tile.filename}</span>
</a>
