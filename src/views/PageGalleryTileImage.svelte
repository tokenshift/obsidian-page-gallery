<script lang="ts">
  import type { Page } from '../ExpressionCache'

  export let page: Page
  export let imageSrc: string
</script>

<a class="page-gallery__image internal-link"
  data-href={page.file.path}
  href={page.file.path}
  rel="noopener"
  style:background-image={`url('${imageSrc}')`}>
  <span class="page-gallery__hidden">Link to {page.file.name}</span>
</a>
