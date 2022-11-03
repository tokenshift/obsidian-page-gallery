<script lang="ts">
	import type { FieldInfo } from "src/PageGalleryRenderChild";

  export let field: FieldInfo
('container')
</script>

<style>
.page-gallery__field {
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-gallery__field[data-page-gallery-field-name="file.name"] {
  font-weight: bold;
}
</style>

<div
  class="page-gallery__field"
  data-page-gallery-field-name={field.name}>
  {@html field.rendered}
</div>