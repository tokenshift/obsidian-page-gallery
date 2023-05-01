<script lang="ts">
  import { getContext } from 'svelte'

  import type { ViewConfig } from '../Config'
  import type { Page } from '../PageService'
  import type PageContentService from '../PageContentService'

  const pageContentService = getContext<PageContentService>('PageContentService')

  export let page: Page
  export let view: ViewConfig
</script>

{#await pageContentService.getRenderedContentWithImages(page)}
  <div class="page-gallery__tile-image--loading">Loading...</div>
{:then content}
  {#if view.mode === 'content'}
    <!-- Display page content, don't bother looking for any images. -->
    <a class="page-gallery__tile-image--content internal-link"
      data-href={page.file.path}
      href={page.file.path}
      rel="noopener">
      {@html content?.innerHTML}
    </a>
  {:else}
    {#await pageContentService.getFirstImageSrc(page)}
      <div class="page-gallery__tile-image--loading">Loading...</div>
    {:then imageSrc}
      {#if imageSrc}
        <!-- Display the image (if there is one). -->
        <a class="page-gallery__tile-image--image internal-link"
          data-href={page.file.path}
          href={page.file.path}
          rel="noopener"
          style:background-image={`url('${imageSrc}')`}>
          <span class="page-gallery__hidden">Link to {page.file.name}</span>
        </a>
      {:else if view.mode === 'image'}
        <!-- Fall back to displaying just the filename. -->
        <a class="page-gallery__tile-image--fallback internal-link"
          data-href={page.file.path}
          href={page.file.path}
          rel="noopener">{page.file.name}</a>
      {:else}
        <!-- In "auto" mode (the default), fall back to displaying page content instead. -->
        <a class="page-gallery__tile-image--content internal-link"
          data-href={page.file.path}
          href={page.file.path}
          rel="noopener">
          {@html content?.innerHTML}
        </a>
      {/if}
    {/await}
  {/if}
{/await}
