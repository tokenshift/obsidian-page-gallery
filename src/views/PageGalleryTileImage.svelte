<script lang="ts">
  import { getContext } from 'svelte'

  import type { ViewConfig } from '../Config'
  import type { Page } from '../PageService'
  import type PageContentService from '../PageContentService'

  const pageContentService = getContext<PageContentService>('PageContentService')

  export let page: Page
  export let view: ViewConfig

  type DisplayInfo = {
    mode: 'content',
    content: HTMLElement
  } | {
    mode: 'image',
    imageSrc: string
  } | {
    mode: 'fallback'
  }

  async function getDisplayInfo (page: Page, view: ViewConfig): Promise<DisplayInfo> {
    const content = await pageContentService.getRenderedContentWithImages(page)

    if (view.mode === 'content') {
      // In 'content' mode, display page contents or a fallback (if the page is
      // empty), and don't bother looking for an image.
      if (content) {
        return {
          mode: 'content',
          content
        }
      } else {
        return {
          mode: 'fallback'
        }
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
        if (view.mode === 'image' || !content) {
          // In 'image' mode, display a fallback if there is no image.
          // If there's no content either, then display a fallback even in 'auto' mode.
          return {
            mode: 'fallback'
          }
        } else {
          // In 'auto' mode, display page content if there is no image, or a
          // fallback if there isn't any content either.
          return {
            mode: 'content',
            content
          }
        }
      }
    }
  }
</script>

{#await getDisplayInfo(page, view)}
  <div class="page-gallery__tile-image--loading">Loading...</div>
{:then info}
  {#if info.mode === 'content'}
    <a class="page-gallery__tile-image--content internal-link"
      data-href={page.file.path}
      href={page.file.path}
      rel="noopener">
      <div class="page-gallery__tile-image--content-sizer"></div>
      <div class="page-gallery__tile-image--content-wrapper">{@html info.content.innerHTML}</div>
    </a>
  {:else if info.mode === 'image'}
    <a class="page-gallery__tile-image--image internal-link"
      data-href={page.file.path}
      data-image-src={info.imageSrc}
      href={page.file.path}
      rel="noopener"
      style:background-image={`url('${info.imageSrc}')`}>
      <span class="page-gallery__hidden">Link to {page.file.name}</span>
    </a>
  {:else if info.mode === 'fallback'}
    <a class="page-gallery__tile-image--fallback internal-link"
      data-href={page.file.path}
      href={page.file.path}
      rel="noopener">{page.file.name}</a>
  {/if}
{/await}
