<script type="ts">
  import { debounce } from 'obsidian'
  import { onDestroy, onMount } from 'svelte'

  import type { ViewConfig } from '../Config'
  import type { Page } from '../PageService'

  import PageGalleryTileImage from './PageGalleryTileImage.svelte'
  import PageGalleryTileFields from './PageGalleryTileFields.svelte'

  export let page: Page
  export let view: ViewConfig

  let isVisible = false
  let tileRoot: HTMLElement

  const setVisibility = debounce((visible: boolean) => { isVisible = visible }, 50, true)

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting) != null
    setVisibility(visible)
  })

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
  {#if isVisible}
    <PageGalleryTileImage {page} {view} />
    <PageGalleryTileFields {page} {view} />
  {:else}
    <div class="page-gallery__tile--loading"></div>
  {/if}
</div>
