<script lang="ts">
	import { browser } from '$app/environment';
	import ThreeGame from '$lib/ThreeGame.svelte';
</script>

<main>
	{#if browser}
		<ThreeGame />
	{/if}
</main>

<style>
</style>
