<script lang="ts">
	import wheel from './assets/wheel.png';
	import { Game } from './game/game';
	import { Shooting } from './ui/shooting';
	import { Steering } from './ui/steering';

	let game = new Game(800, 100);
	let steering = new Steering(game.player.ship.maxTurnRate);
	let shooting = new Shooting(game.player.ship.maxRange);
	let turnRateSpring = steering.turnRateSpring;
	let offsetSpring = shooting.offsetSpring;
	requestAnimationFrame(game.loop.bind(game));
</script>

<div use:game.renderer.appendTo></div>
<span
	id="steering"
	use:steering.action={(turnRate) => {
		game.player.addTurnAction(turnRate);
	}}
>
	<img
		style="
      transform-origin:center;
      transform:rotate({$turnRateSpring}deg);
      "
		src={wheel}
		alt="wheel"
	/>
</span>

<span
	id="shooting"
	use:shooting.action={(offset) => {
		game.player.addShootAction(offset);
	}}
>
	<span
		style="
      transform-origin:center;
      transform:translate(-50% , -50%) translate({$offsetSpring.x}px,{$offsetSpring.y}px);
      "
	/>
</span>

<style>
	* {
		text-align: center;
	}
	div {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #333; /* Optional: Background color */
	}
	#steering {
		position: fixed;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%) translateY(-20%);
		user-select: none;
		width: 100vw;
		background-color: #0001;
		& > img {
			pointer-events: none;
			width: 100px;
			height: 100px;
			filter: drop-shadow(0 0 2px #000);
		}
	}
	#shooting {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
		user-select: none;
		width: min(100vw, 50vh);
		height: min(100vw, 50vh);
		background-color: #0001;
		& > span {
			position: absolute;
			left: 50%;
			top: 50%;
			pointer-events: none;
			display: block;
			width: 10px;
			height: 10px;
			border-radius: 50%;
			background-color: #0001;
		}
	}
</style>
