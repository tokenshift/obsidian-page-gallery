<script type="ts">
  import { getContext } from 'svelte'

  import type { ViewConfig } from '../Config'
  import type ExpressionCache from '../ExpressionCache'
  import type { Page } from '../PageService'
  import type PageContentService from '../PageContentService'

  import PageGalleryTileImage from './PageGalleryTileImage.svelte'
  import PageGalleryTileFallback from './PageGalleryTileFallback.svelte'

  export let page: Page
  export let view: ViewConfig

  const cache = getContext<ExpressionCache>('ExpressionCache')
  const pageContentService = getContext<PageContentService>('PageContentService')

  function getFieldValues () {
    return view.fields
      .map(expression => ({
        expression,
        value: cache.evaluate(expression, page)
      }))
      .filter(field => field.value != null)
  }
</script>

<div class="page-gallery__tile"
  style:--image-size={page.pageGallery?.size || null}
  style:--image-position={page.pageGallery?.position || null}
  style:--image-repeat={page.pageGallery?.repeat || null}>
  {#await pageContentService.getFirstImageSrc(page)}
  <div class="page-gallery__tile-loading">Loading...</div>
  {:then imageSrc}
    {#if imageSrc}
    <PageGalleryTileImage {page} {imageSrc} />
    {:else}
    <PageGalleryTileFallback {page} />
    {/if}
  {/await}

  {#await getFieldValues() then fields}
  {#if fields.length > 0}
  <div class="page-gallery__fields">
    {#each fields as field}
    {#if typeof field.value === 'object'}
    {#await cache.renderFieldValue(field.expression, page) then rendered}
    <div class="page-gallery__field"
      data-page-gallery-field-expression={field.expression}
      data-page-gallery-field-value={field.value}>
      {@html rendered}
    </div>
    {/await}
    {:else}
    <div class="page-gallery__field"
      data-page-gallery-field-expression={field.expression}
      data-page-gallery-field-value={field.value}>
      {field.value}
    </div>
    {/if}
    {/each}
  </div>
  {/if}
  {/await}
</div>
