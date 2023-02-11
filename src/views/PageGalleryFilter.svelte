<script type="ts">
	import type { Writable } from 'svelte/store'
	import { ulid } from 'ulid'

  const id = ulid()

  export let filter: Writable<string>

  function clearFilter () {
    filter.set('')
  }
</script>

<div class="page-gallery__filter">
  <label for={id}>🔎</label>
  <input id={id} type="text" bind:value={$filter}>
  <a class="page-gallery__filter-clear" title="Clear" href="javascript:;" on:click={clearFilter}>❌</a>
</div>
