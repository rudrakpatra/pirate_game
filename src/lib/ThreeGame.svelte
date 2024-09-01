<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import wheel from './assets/wheel.png';
	import Game from './three/Game';
	import { Steering } from './ui/steering';
	const game = new Game();
	let ready = game.ready;
	const steering = new Steering(150);
	const turnRateSpring = steering.turnRateSpring;
	onMount(async () => {
		game.onMount();
	});
	onDestroy(async () => {
		game.onDestroy();
	});
</script>

{#if ready}
	<div use:game.setDomElement></div>
	<span
		id="steering"
		use:steering.onChange={(turnRate) => {
			setTimeout(() => game.player.setTurnRate(turnRate), 1000);
		}}
	>
		<img
			style="transform-origin:center;transform:rotate({$turnRateSpring}deg);"
			src={wheel}
			alt="wheel"
		/>
	</span>
{:else}
	<div id="loader">Loading...</div>
{/if}

<style>
	* {
		text-align: center;
		touch-action: none;
	}
	div {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #333; /* Optional: Background color */
	}
	#loader {
		display: grid;
		place-items: center;
		font-size: 2em;
	}
	#steering {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		user-select: none;
		width: 100%;
		background-color: #0001;
		& > img {
			pointer-events: none;
			height: 20vh;
			aspect-ratio: 1/1;
			filter: drop-shadow(0 0 2px #000);
		}
	}
</style>
