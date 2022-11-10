<script lang="ts">
	import type { FieldInfo } from "src/PageGalleryRenderChild";

  export let field: FieldInfo
</script>

<div
  class="page-gallery__field"
  data-page-gallery-field-name={field.name}>
  {@html field.rendered}
</div>