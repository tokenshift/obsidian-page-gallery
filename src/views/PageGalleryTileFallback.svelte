<script lang="ts">
  import type { Page } from 'src/ExpressionCache'

  export let page: Page
</script>

<a class="page-gallery__fallback internal-link"
  data-href={page.file.path}
  href={page.file.path}
  rel="noopener">{page.file.name}</a>
