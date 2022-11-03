<script type="ts">
	import type { Writable } from "svelte/store";
	import { ulid } from "ulid";

  const id = ulid()

  export let query: Writable<string>
</script>

<style>
  .page-gallery__filter {
    margin-bottom: 0.5em;
  }
</style>

<div class="page-gallery__filter">
  <label for={id}>🔎</label>
  <input id={id} type="text" bind:value={$query}>
</div>