<script lang="ts">
  import { getContext } from 'svelte'

  import type { ViewConfig } from '../Config'
  import type { Page } from '../PageService'
  import type PageContentService from '../PageContentService'

  const pageContentService = getContext<PageContentService>('PageContentService')

  export let page: Page
  export let view: ViewConfig

  async function getDisplayInfo (page: Page, view: ViewConfig) {
    const content = await pageContentService.getRenderedContentWithImages(page)

    if (view.mode === 'content') {
      // In 'content' mode, display page contents or a fallback (if the page is
      // empty), and don't bother looking for an image.
      return {
        mode: content ? 'content' : 'fallback',
        content
      }
    } else {
      const imageSrc = await pageContentService.getFirstImageSrc(page)
      if (imageSrc) {
        // In 'image' or 'auto' mode, display the image (if there is one).
        return {
          mode: 'image',
          imageSrc
        }
      } else {
        if (view.mode === 'image') {
          // In 'image' mode, display a fallback if there is no image.
          return {
            mode: 'fallback'
          }
        } else {
          // In 'auto' mode, display page content if there is no image, or a
          // fallback if there isn't any content either.
          return {
            mode: content ? 'content' : 'fallback',
            content
          }
        }
      }
    }
  }
</script>

{#await getDisplayInfo(page, view)}
  <div class="page-gallery__tile-image--loading">Loading...</div>
{:then { mode, content, imageSrc }}
  {#if mode === 'content'}
    <a class="page-gallery__tile-image--content internal-link"
      data-href={page.file.path}
      href={page.file.path}
      rel="noopener">
      <div class="page-gallery__tile-image--content-sizer"></div>
      <div class="page-gallery__tile-image--content-wrapper">{@html content.innerHTML}</div>
    </a>
  {:else if mode === 'image'}
    <a class="page-gallery__tile-image--image internal-link"
      data-href={page.file.path}
      data-image-src={imageSrc}
      href={page.file.path}
      rel="noopener"
      style:background-image={`url('${imageSrc}')`}>
      <span class="page-gallery__hidden">Link to {page.file.name}</span>
    </a>
  {:else if mode === 'fallback'}
    <a class="page-gallery__tile-image--fallback internal-link"
      data-href={page.file.path}
      href={page.file.path}
      rel="noopener">{page.file.name}</a>
  {/if}
{/await}
