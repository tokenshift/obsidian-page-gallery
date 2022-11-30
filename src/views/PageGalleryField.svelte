<script lang="ts">
	import type { Field } from 'src/TileWrangler'

  export let field: Field
</script>

<div
  class="page-gallery__field"
  data-page-gallery-field-name={field.name}>
  {@html field.html}
</div>