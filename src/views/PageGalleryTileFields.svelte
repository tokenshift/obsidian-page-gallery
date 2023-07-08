<script type="ts">
  import { getContext } from 'svelte'

  import type { ViewConfig } from 'src/Config'
  import type ExpressionCache from 'src/ExpressionCache'
  import type { Page } from 'src/PageService'

  export let page: Page
  export let view: ViewConfig

  const cache = getContext<ExpressionCache>('ExpressionCache')

  function getFieldValues (page: Page, view: ViewConfig) {
    return view.fields
      .map(expression => ({
        expression,
        value: cache.evaluate(expression, page)
      }))
      .filter(field => field.value != null)
  }
</script>

{#await getFieldValues(page, view) then fields}
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