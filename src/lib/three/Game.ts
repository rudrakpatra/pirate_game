import {
	AmbientLight,
	BoxGeometry,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DirectionalLight,
	FogExp2,
	Material,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Quaternion,
	Raycaster,
	Scene,
	SphereGeometry,
	Vector2,
	Vector3,
	VSMShadowMap,
	WebGLRenderer
} from 'three';
import { Size2, Vec2 } from './Utils';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { Sea } from './Sea';
import { load, type LoadedAssets } from './Load';
import { writable, type Writable } from 'svelte/store';

export class Island {
	constructor() {}
}
export class Gold {
	constructor() {}
}
export class Ship {
	constructor(
		public turnRate = 0,
		public maxTurnRate = 180,
		public inventory = { gold: 0, ammo: 10 }
	) {}
}
export class Player {
	ship: Ship;
	constructor() {
		this.ship = new Ship();
	}
	setTurnRate(t: number) {
		this.ship.turnRate = Math.max(-this.ship.maxTurnRate, Math.min(this.ship.maxTurnRate, t));
	}
}
export default class Game {
	ready: Writable<boolean>;
	scene: Scene;
	renderer: WebGLRenderer;
	camera: PerspectiveCamera;
	// controls: MapControls;
	sea: Sea;
	player: Player;
	constructor(public size: Size2 = new Size2(400, 400)) {
		this.ready = writable(false);
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
		this.camera.position.set(0, 60, 40);
		this.camera.lookAt(new Vector3(0, 0, 0));
		this.sea = new Sea(this.size);

		this.player = new Player();

		// controls

		// this.controls = new MapControls(this.camera, this.renderer.domElement);

		// //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

		// this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		// this.controls.dampingFactor = 0.05;

		// this.controls.screenSpacePanning = false;

		// this.controls.minDistance = 100;
		// this.controls.maxDistance = 100;

		// this.controls.maxPolarAngle = Math.PI / 2;
	}
	async onMount() {
		addEventListener('resize', this.onWindowResize.bind(this));
		const { ship, loot, island, cannonball } = await load();
		ship.scene.traverse((o) => {
			if (o instanceof Mesh) {
				// o.receiveShadow = true;
				// o.castShadow = true;
			}
		});
		this.scene.add(ship.scene.translateY(1));
		this.addSea();
		this.addLights();
		this.addRandomly(loot, 10, 10);
		this.ready.set(true);
	}
	onDestroy() {
		// Remove event listener for window resize
		window.removeEventListener('resize', this.onWindowResize.bind(this));

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
		// this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
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
					chd.userData.direction += 0.01;
					const speed = 0.2; // The speed at which the ship moves forward

					// Rotate the ship around its Y-axis (up axis)
					chd.rotateY(chd.userData.direction);

					// Calculate the forward direction after rotation
					const forward = new Vector3(0, 0, -1); // The ship's default forward direction in local space
					forward.applyQuaternion(chd.quaternion); // Rotate the forward vector by the ship's current orientation

					// Move the ship forward in the direction it's facing
					chd.position.add(forward.multiplyScalar(speed));

					// Set an offset for the camera relative to the ship's position
					const offset = new Vector3(0, 60, 40); // Adjust these values to position the camera
					const cameraPosition = chd.position.clone().add(offset); // Clone ship position and add the offset

					// Update the camera's position
					this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

					// Make the camera look at the ship
					this.camera.lookAt(chd.position);
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
