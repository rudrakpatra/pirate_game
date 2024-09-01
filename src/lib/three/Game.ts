import {
	AmbientLight,
	Clock,
	Color,
	DirectionalLight,
	FogExp2,
	Material,
	Mesh,
	Object3D,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Raycaster,
	Scene,
	Vector2,
	Vector3,
	VSMShadowMap,
	WebGLRenderer
} from 'three';
import { Size2, Vec2 } from './Utils';
import { Sea } from './Sea';
import { load, type LoadedAssets } from './Load';
import { get, writable, type Writable } from 'svelte/store';
import { Gizmo } from './Gizmo';

export class Island {
	ref: number | null = null;
	constructor() {}
}
export class Gold {
	ref: number | null = null;
	constructor() {}
}
export class Ship {
	ref: number | null = null;
	constructor(
		public turnRate = 0,
		public maxTurnRate = 180,
		public inventory = { gold: 0, ammo: 10 },
		public range = 50
	) {}
}

export class Player {
	ship: Ship;
	turnRateChangeTimeout: number | null;
	constructor() {
		this.ship = new Ship();
		this.turnRateChangeTimeout = null;
	}
	setAttackOffset(offset: Vector2) {}
	setTurnRate(t: number) {
		if (t) clearTimeout(t);
		this.turnRateChangeTimeout = setTimeout(() => {
			this.ship.turnRate = Math.max(-this.ship.maxTurnRate, Math.min(this.ship.maxTurnRate, t));
		}, 1000);
	}
}
export default class Game {
	ready: Writable<boolean>;
	scene: Scene;
	renderer: WebGLRenderer;
	camera: PerspectiveCamera;
	cameraOffset = new Vector3(0, 80, 60);
	cameraLookAtOffset = new Vector3(0, 0, 20);
	sea: Sea;
	player: Player;
	gizmo: Gizmo;
	raycaster: Raycaster;
	mouse: Vector2;
	clock: Clock;
	blockHeight: Writable<number>;
	constructor(public size: Size2 = new Size2(400, 400)) {
		this.ready = writable(false);
		this.blockHeight = writable(0);
		this.clock = new Clock(true);
		this.scene = new Scene();
		this.scene.background = new Color(0xcccccc);
		this.scene.fog = new FogExp2(0xcccccc, 0.002);

		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setAnimationLoop(this.animate.bind(this));

		this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		this.camera.position.set(this.cameraOffset.x, this.cameraOffset.y, this.cameraOffset.z);
		this.camera.lookAt(new Vector3(0, 0, 0).add(this.cameraLookAtOffset));
		this.sea = new Sea(this.size);

		this.player = new Player();
		this.gizmo = new Gizmo(this.player.ship.range, new Color(0xffffff), new Color(0xff0000));
		this.raycaster = new Raycaster();
		this.mouse = new Vector2();
		this.scene.add(this.gizmo.circle);
	}
	async onMount() {
		addEventListener('resize', this.onWindowResize.bind(this));
		this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
		this.renderer.domElement.addEventListener('click', this.onClick.bind(this), false);
		const { ship, loot, island, cannonball } = await load();
		const playerShip = ship.scene.clone();
		this.player.ship.ref = playerShip.id;
		this.scene.add(playerShip);
		this.addSea();
		this.addLights();
		this.addRandomly(loot, 10, 10);
		this.addRandomly(island, 3, 3, 100);
		this.ready.set(true);
	}
	onDestroy() {
		// Remove event listener for window resize
		window.removeEventListener('resize', this.onWindowResize.bind(this));
		this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
		this.renderer.domElement.addEventListener('click', this.onClick.bind(this), false);
		// Clean up the scene
		this.scene.traverse((object) => {
			if (object instanceof Mesh) {
				// Dispose of geometry
				if (object.geometry) object.geometry.dispose();

				// Dispose of materials
				if (object.material)
					if (Array.isArray(object.material))
						object.material.forEach(
							(material) => material instanceof Material && material.dispose()
						);
					else if (object.material instanceof Material) object.material.dispose();

				// Dispose of textures
				if (object.material && object.material.map) object.material.map.dispose();
			}
		});

		// Dispose of sea-related resources if applicable
		if (this.sea instanceof Sea) {
			// this.sea.dispose(); // Assuming you have a dispose method for the sea object
		}

		// Dispose of player-related resources if applicable
		if (this.player instanceof Player) {
			// this.player.dispose(); // Assuming you have a dispose method for the player object
		}

		// Dispose of the renderer
		if (this.renderer instanceof WebGLRenderer) {
			this.renderer.dispose();
		}

		// Set the ready writable store to false
		this.ready.set(false);
	}
	onMouseMove(event: MouseEvent) {
		// Calculate mouse position in normalized device coordinates
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	onClick(event: MouseEvent) {
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	addSea() {
		// const s = new Mesh(
		// 	new PlaneGeometry(this.size.w, this.size.h).rotateX(-Math.PI / 2),
		// 	new MeshStandardMaterial({
		// 		color: 0x0088aa
		// 	})
		// );
		const s = this.sea.mesh();
		// s.castShadow = false;
		// s.receiveShadow = true;
		this.scene.add(s);
	}
	addLights() {
		const dirLight1 = new DirectionalLight(0xffffff, 2); // Reduced intensity
		dirLight1.position.set(50, 200, 50); // Adjusted position
		dirLight1.castShadow = true;

		// Improve shadow quality
		dirLight1.shadow.mapSize.width = 2 << 12;
		dirLight1.shadow.mapSize.height = 2 << 12;
		dirLight1.shadow.camera.near = 1;
		dirLight1.shadow.camera.far = 500;
		dirLight1.shadow.bias = -0.001;

		// Increase shadow area
		const d = 300;
		dirLight1.shadow.camera.left = -d;
		dirLight1.shadow.camera.right = d;
		dirLight1.shadow.camera.top = d;
		dirLight1.shadow.camera.bottom = -d;

		this.scene.add(dirLight1);

		const ambientLight = new AmbientLight(0x554433, 30); // Reduced intensity
		this.scene.add(ambientLight);
	}
	addRandomly(obj: Object3D, x: number, y: number, s = 20) {
		Array(x)
			.fill(0)
			.forEach((_, i) => {
				Array(y)
					.fill(0)
					.forEach((_, j) => {
						this.scene.add(
							obj
								.clone()
								.translateX(s * (i - x / 2) + Math.random() * s)
								.translateZ(s * (j - y / 2) + Math.random() * s)
						);
					});
			});
	}
	setDomElement(domElement: HTMLElement) {
		domElement.appendChild(this.renderer.domElement);
	}
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	animate() {
		const elapsedTime = this.clock.getElapsedTime();
		if (elapsedTime > get(this.blockHeight)) {
			this.blockHeight.set(Math.floor(elapsedTime));
		}
		if (this.player.ship.ref) {
			const playerShip = this.scene.getObjectById(this.player.ship.ref);
			if (playerShip) {
				playerShip.userData.turnRate = -this.player.ship.turnRate / (30 * 360);
				// Update the circle position
				this.gizmo.updatePosition(playerShip.position);
				this.raycaster.setFromCamera(this.mouse.clone(), this.camera);
				this.gizmo.checkHover(this.raycaster);
			}
		}
		this.sea.update();
		this.render();
		this.scene.children.forEach((chd) => {
			switch (chd.name) {
				case 'ship':

				case 'loot':
					this.sea.align(chd);
					break;
				default:
			}
			switch (chd.name) {
				case 'ship':
					// Dynamically calculate the turning angle (this can be based on input or another function)
					chd.userData.direction = chd.userData.direction || Math.PI / 2;
					chd.userData.direction += chd.userData.turnRate;
					const speed = 0.1; // The speed at which the ship moves forward

					// Rotate the ship around its Y-axis (up axis)
					chd.rotateY(chd.userData.direction);

					// Calculate the forward direction after rotation
					const forward = new Vector3(0, 0, -1); // The ship's default forward direction in local space
					forward.applyQuaternion(chd.quaternion); // Rotate the forward vector by the ship's current orientation

					// Move the ship forward in the direction it's facing
					chd.position.add(forward.multiplyScalar(speed));

					// Set an offset for the camera relative to the ship's position
					// Adjust these values to position the camera
					const cameraPosition = chd.position.clone().add(this.cameraOffset); // Clone ship position and add the offset

					// Update the camera's position
					this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

					// Make the camera look at the ship
					this.camera.lookAt(chd.position.clone().add(this.cameraLookAtOffset));
					break;

				case 'loot':
					break;
				default:
			}
		});
		// const loots = this.scene.children.filter((c) => c.name == 'loot');
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}
}
