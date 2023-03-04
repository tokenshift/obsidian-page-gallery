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
    return Promise.all(view.fields
      .map(expression => ({
        expression,
        value: cache.evaluate(expression, page)
      }))
      .filter(field => field.value)
      .map(async ({ expression, value }) => ({
        expression,
        value,
        rendered: await cache.renderFieldValue(page, value)
      })))
  }
</script>

<div class="page-gallery__tile"
  style:--image-size={view.size || null}
  style:--image-position={view.position || null}
  style:--image-repeat={view.repeat || null}>
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
    <div class="page-gallery__field"
      data-page-gallery-field-expression={field.expression}
      data-page-gallery-field-value={field.value}>
      {#if field.expression !== 'file.name'}
      {@html field.rendered}
      {:else}
      {field.value}
      {/if}
    </div>
    {/each}
  </div>
  {/if}
  {/await}
</div>
