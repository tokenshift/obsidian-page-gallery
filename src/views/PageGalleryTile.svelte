<script type="ts">
  import { debounce } from 'obsidian'
  import { onDestroy, onMount } from 'svelte'

  import type { ViewConfig } from '../Config'
  import type { Page } from '../PageService'

  import PageGalleryTileImage from './PageGalleryTileImage.svelte'
  import PageGalleryTileFields from './PageGalleryTileFields.svelte'

  export let page: Page
  export let view: ViewConfig

  let loadImage = false
  let loadFields = false

  // Both image and fields will only load once the tile is visible. However,
  // once loaded, the fields won't go away (so that stuff doesn't keep moving
  // around/reflowing), but the image will, since having tons of (potentially
  // large) images visible can crash Obsidian.
  const setVisibility = debounce((visible: boolean) => {
    loadImage = visible
    loadFields = loadFields || visible
  }, 50, true)

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting) != null
    setVisibility(visible)
  })

  let tileRoot: HTMLElement

  onMount(() => {
    observer.observe(tileRoot);
  });

  onDestroy(() => {
    observer.disconnect();
  });
</script>

<div bind:this={tileRoot} class="page-gallery__tile"
  style:--image-size={page.pageGallery?.size || null}
  style:--image-position={page.pageGallery?.position || null}
  style:--image-repeat={page.pageGallery?.repeat || null}>
  {#if loadImage}
    <PageGalleryTileImage {page} {view} />
  {:else}
    <div class="page-gallery__tile-image--loading"></div>
  {/if}
  {#if loadFields}
    <PageGalleryTileFields {page} {view} />
  {:else}
    <div class="page-gallery__fields--loading"></div>
  {/if}
</div>
