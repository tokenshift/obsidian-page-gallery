<script lang="ts">
  import type { TileGroup } from 'src/TileWrangler'

  export let group: TileGroup
</script>

<section class="page-gallery__group">
  <header class="page-gallery__group-title">
    {group.name}
  </header>
  {#each group.tiles as tile}
  <div class="page-gallery__tile">Testing: {tile.href}</div>
  {/each}
</section>
