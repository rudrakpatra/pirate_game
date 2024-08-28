<script lang="ts">
	import * as THREE from 'three';
	import { onMount } from 'svelte';

	let el: HTMLCanvasElement;
	let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
	let ship: THREE.Mesh<THREE.ConeGeometry, THREE.MeshStandardMaterial>;
	let steeringAngle: number = 0;
	let score: number = 0;
	let barrels: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>[] = [];
	let enemyShips: THREE.Mesh<THREE.ConeGeometry, THREE.MeshStandardMaterial>[] = [];
	const barrelSpawnRate: number = 1000; // Spawn a barrel every second
	const enemyShipSpawnRate: number = 5000; // Spawn an enemy ship every 5 seconds

	function init(): void {
		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 20, 10);
		camera.lookAt(0, 0, 0);

		// Renderer
		renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Light
		const light: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(10, 10, 10);
		scene.add(light);

		// Plane (Water)
		const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(1000, 1000);
		const planeMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
			color: 0x63a4ef,
			side: THREE.DoubleSide
		});
		const plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> = new THREE.Mesh(
			planeGeometry,
			planeMaterial
		);
		plane.rotation.x = Math.PI / 2;
		scene.add(plane);

		// Ship (Cone)
		const shipGeometry: THREE.ConeGeometry = new THREE.ConeGeometry(1, 2, 32);
		const shipMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
			color: 0x8f2e00
		});
		ship = new THREE.Mesh(shipGeometry, shipMaterial);
		ship.rotation.x = -Math.PI / 2;
		scene.add(ship);

		// Start game loop
		animate();
		Array(10)
			.fill(0)
			.forEach(() => spawnBarrel());
		setInterval(spawnBarrel, barrelSpawnRate);
		setInterval(spawnEnemyShip, enemyShipSpawnRate);
	}

	function animate(): void {
		requestAnimationFrame(animate);

		// Apply steering angle after delat
		ship.rotation.z -= ship.userData.turningRate || 0;
		ship.position.x += Math.sin(ship.rotation.z) * 0.1;
		ship.position.z += Math.cos(ship.rotation.z) * 0.1;

		// Move camera to follow ship
		camera.position.x = ship.position.x;
		camera.position.z = ship.position.z + 10;
		camera.lookAt(ship.position);

		// AI Logic for enemy ships
		enemyShips.forEach((enemyShip: THREE.Mesh<THREE.ConeGeometry, THREE.MeshStandardMaterial>) => {
			// Randomly adjust enemy ship's direction
			enemyShip.rotation.y += (Math.random() - 0.5) * 0.1;
			enemyShip.position.x += Math.sin(enemyShip.rotation.y) * 0.1;
			enemyShip.position.z += Math.cos(enemyShip.rotation.y) * 0.1;
		});

		// Render the scene
		renderer.render(scene, camera);
	}

	function spawnBarrel(): void {
		const barrelGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
		const barrelMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
			color: 0x8b4513
		});
		const barrel: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial> = new THREE.Mesh(
			barrelGeometry,
			barrelMaterial
		);

		barrel.position.set((Math.random() - 0.5) * 50, 0.5, (Math.random() - 0.5) * 50);
		scene.add(barrel);
		barrels.push(barrel);
	}

	function spawnEnemyShip(): void {
		const enemyGeometry: THREE.ConeGeometry = new THREE.ConeGeometry(1, 2, 32);
		const enemyMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
			color: 0xff0000
		});
		const enemyShip: THREE.Mesh<THREE.ConeGeometry, THREE.MeshStandardMaterial> = new THREE.Mesh(
			enemyGeometry,
			enemyMaterial
		);
		enemyShip.rotation.x = Math.PI / 2;

		enemyShip.position.set((Math.random() - 0.5) * 50, 0.5, (Math.random() - 0.5) * 50);
		scene.add(enemyShip);
		enemyShips.push(enemyShip);
	}

	const inputAxis = (x: number) => {
		return (((x / window.innerWidth - 0.5) * Math.PI) / 180) * 2;
	};
	const steeringControls = (el: HTMLDivElement) => {
		const down = (e: PointerEvent) => {
			el.dataset.drag = 'true';
			el.dataset.dragStart = steeringAngle.toString() + inputAxis(e.clientX);
			addEventListener('pointermove', move);
			addEventListener('pointerup', up);
		};
		const drag = (e: PointerEvent) => {
			steeringAngle = parseFloat(el.dataset.dragStart || '0') + inputAxis(e.clientX);
			el.style.transform = `translateX(-50%) rotate(${steeringAngle * 360 * 100}deg)`;
		};
		const move = (e: PointerEvent) => {
			if (el.dataset.drag) {
				drag(e);
			} else {
			}
		};
		const up = (e: PointerEvent) => {
			if (el.dataset.drag) {
				setTimeout(() => {
					ship.userData.turningRate = steeringAngle;
					//console.log("txn: ship rotation = " + ship.rotation.y);
				}, 1000);
			}
			el.dataset.drag = undefined;
			removeEventListener('pointermove', move);
			removeEventListener('pointerup', up);
		};
		el.onpointerdown = down;
		return {
			destroy() {
				el.onpointermove = null;
				el.onpointerdown = null;
				el.onpointerup = null;
			}
		};
	};

	onMount((): (() => void) => {
		init();
		return () => {};
	});
</script>

<canvas bind:this={el}></canvas>

<div class="ui">
	Score: {score}
</div>

<div class="wheel" use:steeringControls>
	{steeringAngle.toFixed(2)}
</div>

<style>
	canvas {
		display: block;
		position: fixed;
		inset: 0;
	}

	.ui {
		position: absolute;
		top: 10px;
		left: 10px;
		color: white;
		font-size: 24px;
	}

	.wheel {
		user-select: none;
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		width: 100px;
		height: 100px;
		border-radius: 20%;
		background: rgba(255, 255, 255, 0.5);
		cursor: pointer;
	}
</style>
