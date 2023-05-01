<script type="ts">
  import { getContext } from 'svelte'

  import type { ViewConfig } from '../Config'
  import type ExpressionCache from '../ExpressionCache'
  import type { Page } from '../PageService'

  import PageGalleryTileImage from './PageGalleryTileImage.svelte'

  export let page: Page
  export let view: ViewConfig

  const cache = getContext<ExpressionCache>('ExpressionCache')

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
  <PageGalleryTileImage {page} {view} />

  {#await getFieldValues() then fields}
  {#if fields.length > 0}
  <div class="page-gallery__fields">
    {#each fields as field}
    {#if cache.appearsRenderable(field.value)}
    {#await cache.renderExpression(field.expression, page) then rendered}
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
