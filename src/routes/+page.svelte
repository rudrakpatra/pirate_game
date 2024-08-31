<script lang="ts">
	import { browser } from '$app/environment';
	import CanvasConcept from '$lib/CanvasConcept.svelte';
	// import Three from '$lib/Three.svelte';
	import ThreeGame from '$lib/ThreeGame.svelte';
</script>

<main>
	{#if browser}
		<ThreeGame />
		<!-- <CanvasConcept /> -->
	{/if}
</main>

<style>
</style>
