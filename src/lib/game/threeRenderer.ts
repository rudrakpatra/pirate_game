import * as THREE from 'three';
import { World, Ship, Island, Loot, CannonBall } from './gameObjects';
import { Player } from './player';
import { CPU } from './cpu';
import { Vector2d } from './vector2d';
import { load } from '$lib/three/Load';

export class ThreeRenderer {
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private shipInstancedMesh: THREE.InstancedMesh | undefined;
	private islandInstancedMesh: THREE.InstancedMesh | undefined;
	private lootInstancedMesh: THREE.InstancedMesh | undefined;
	private cannonBallInstancedMesh: THREE.InstancedMesh | undefined;
	private dummy: THREE.Object3D;
	private clock: THREE.Clock;

	private viewportSize: Vector2d = new Vector2d(800, 600);
	private zoomFactor: number = 2;
	private shipSizeMultiplier: number = 1.5;

	constructor() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			60,
			this.viewportSize.x / this.viewportSize.y,
			0.1,
			1000
		);
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.dummy = new THREE.Object3D();
		this.clock = new THREE.Clock();

		this.initScene();
	}

	private async initScene() {
		this.renderer.setSize(this.viewportSize.x, this.viewportSize.y);
		this.camera.position.set(0, 100, 200);
		this.camera.lookAt(0, 0, 0);

		const gltfs = await load();

		let shipGeometry;
		// Initialize instanced meshes
		gltfs.ship.scene.traverse((m) => {
			if (m.isMesh) {
				shipGeometry = m.geometry;
			}
		});
		const shipMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
		this.shipInstancedMesh = new THREE.InstancedMesh(shipGeometry, shipMaterial, 100);
		this.scene.add(this.shipInstancedMesh);

		const islandGeometry = new THREE.SphereGeometry(5, 32, 32);
		const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
		this.islandInstancedMesh = new THREE.InstancedMesh(islandGeometry, islandMaterial, 20);
		this.scene.add(this.islandInstancedMesh);

		const lootGeometry = new THREE.SphereGeometry(1, 16, 16);
		const lootMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
		this.lootInstancedMesh = new THREE.InstancedMesh(lootGeometry, lootMaterial, 50);
		this.scene.add(this.lootInstancedMesh);

		const cannonBallGeometry = new THREE.SphereGeometry(0.5, 8, 8);
		const cannonBallMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
		this.cannonBallInstancedMesh = new THREE.InstancedMesh(
			cannonBallGeometry,
			cannonBallMaterial,
			100
		);
		this.scene.add(this.cannonBallInstancedMesh);

		// Add lights
		const ambientLight = new THREE.AmbientLight(0x404040);
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(1, 1, 1);
		this.scene.add(directionalLight);
	}

	appendTo(element: HTMLElement): void {
		element.appendChild(this.renderer.domElement);
	}

	render(world: World, player: Player, cpus: CPU[]): void {
		const time = this.clock.getElapsedTime();
		if (this.shipInstancedMesh)
			this.updateInstancedMesh(
				this.shipInstancedMesh,
				[...world.ships, player.ship],
				(ship: Ship, matrix: THREE.Matrix4) => {
					matrix.setPosition(ship.position.x, 0, ship.position.y);
					matrix.makeRotationY(Math.atan2(ship.direction.x, ship.direction.y));
					matrix.scale(
						new THREE.Vector3(
							this.shipSizeMultiplier,
							this.shipSizeMultiplier,
							this.shipSizeMultiplier
						)
					);
				}
			);
		// if (this.islandInstancedMesh)
		// 	this.updateInstancedMesh(
		// 		this.islandInstancedMesh,
		// 		world.islands,
		// 		(island: Island, matrix: THREE.Matrix4) => {
		// 			matrix.setPosition(island.position.x, 0, island.position.y);
		// 			matrix.scale(new THREE.Vector3(island.size, island.size, island.size));
		// 		}
		// 	);
		// if (this.lootInstancedMesh)
		// 	this.updateInstancedMesh(
		// 		this.lootInstancedMesh,
		// 		world.loots,
		// 		(loot: Loot, matrix: THREE.Matrix4) => {
		// 			matrix.setPosition(loot.position.x, 0, loot.position.y);
		// 			matrix.scale(new THREE.Vector3(loot.size, loot.size, loot.size));
		// 		}
		// 	);
		// if (this.cannonBallInstancedMesh)
		// 	this.updateInstancedMesh(
		// 		this.cannonBallInstancedMesh,
		// 		world.cannonBalls,
		// 		(cannonBall: CannonBall, matrix: THREE.Matrix4) => {
		// 			matrix.setPosition(cannonBall.position.x, 0, cannonBall.position.y);
		// 		}
		// 	);

		// Update camera position to follow player
		this.camera.position.set(player.ship.position.x, 100, player.ship.position.y + 200);
		this.camera.lookAt(player.ship.position.x, 0, player.ship.position.y);

		this.renderer.render(this.scene, this.camera);
	}

	private updateInstancedMesh<T>(
		instancedMesh: THREE.InstancedMesh,
		objects: T[],
		updateMatrix: (object: T, matrix: THREE.Matrix4) => void
	): void {
		instancedMesh.count = objects.length;
		objects.forEach((object, index) => {
			this.dummy.updateMatrix();
			updateMatrix(object, this.dummy.matrix);
			instancedMesh.setMatrixAt(index, this.dummy.matrix);
		});
		instancedMesh.instanceMatrix.needsUpdate = true;
	}

	setSize(width: number, height: number): void {
		this.viewportSize.x = width;
		this.viewportSize.y = height;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}
}
