<script lang="ts">
	import type { Writable } from 'svelte/store';

  import PageGalleryTile from "./PageGalleryTile.svelte"
	import PageGalleryFilter from './PageGalleryFilter.svelte'
  import type { TileGroup } from 'src/TileWrangler';

  import type Config from 'src/Config';

  export let config: Config
  export let filter: Writable<string>
  export let groups: TileGroup[] = []

  let clientWidth: number
</script>

<div class="page-gallery"
  bind:clientWidth={clientWidth}
  style:--page-gallery-width={`${clientWidth}px`}
  style:--custom-columns={config.columns || null}
  style:--custom-gutter-size={config.gutterSize || null}
  style:--custom-aspect-ratio={config.aspectRatio || null}
  style:--custom-image-height={config.height || null}
  style:--custom-image-width={config.width || null}
  style:--custom-image-size={config.size || null}
  style:--custom-image-position={config.position || null}
  style:--custom-image-repeat={config.repeat || null}>
  {#if config.debug}
  <pre class="page-gallery__debug">{JSON.stringify(config, null, 2)}</pre>
  {/if}

  {#if config.filter}
  <PageGalleryFilter {filter} />
  {/if}

  <div class="page-gallery__groups">
    {#each groups as group}
    <section class="page-gallery__group">
      {#if group.name}
      <header class="page-gallery__group-title">{@html group.name}</header>
      {:else if groups.length > 1}
      <header class="page-gallery__group-title fallback">Other</header>
      {/if}

      <div class="page-gallery__tiles">
        {#each group.tiles as tile}
        <PageGalleryTile {tile} />
        {/each}
      </div>
    </section>
    {/each}
  </div>
</div>
