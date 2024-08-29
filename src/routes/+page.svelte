<script lang="ts">
	import { browser } from '$app/environment';
	import CanvasConcept from '$lib/CanvasConcept.svelte';
</script>

<main>
	{#if browser}
		<CanvasConcept />
	{/if}
</main>

<style>
</style>
