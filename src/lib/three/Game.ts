import {
	AmbientLight,
	BoxGeometry,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	Vector3,
	WebGLRenderer
} from 'three';
import { Size2 } from './Utils';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { Sea } from './Sea';
import type { LoadedAssets } from './Load';

export class Island {
	constructor(
		public mesh = new Mesh(
			new SphereGeometry(5, 20, 10),
			new MeshStandardMaterial({ color: 0xae8321 })
		)
	) {}
}
export class Gold {
	constructor(
		public mesh = new Mesh(
			new CylinderGeometry(1, 1, 4),
			new MeshStandardMaterial({ color: 0xae8321 })
		)
	) {}
}
export class Ship {
	constructor(
		public mesh = new Mesh(
			new ConeGeometry(2, 5, 10).translate(0, 5, 0).rotateX(Math.PI / 2),
			new MeshStandardMaterial({ color: 0x24a520 })
		),
		public turnRate = 0,
		public maxTurnRate = 180,
		public inventory = { gold: 0, ammo: 10 }
	) {}
}
export default class Game {
	scene: Scene;
	renderer: WebGLRenderer;
	camera: PerspectiveCamera;
	controls: MapControls;
	player: Ship;
	cpus: Ship[];
	golds: Gold[];
	islands: Island[];
	sea: Sea;
	constructor(public size: Size2 = new Size2(100, 100)) {
		this.scene = new Scene();
		this.scene.background = new Color(0xcccccc);
		this.scene.fog = new FogExp2(0xcccccc, 0.02);

		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setAnimationLoop(this.animate.bind(this));

		this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		this.camera.position.set(0, 60, -40);

		// controls

		this.controls = new MapControls(this.camera, this.renderer.domElement);

		//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

		this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		this.controls.dampingFactor = 0.05;

		this.controls.screenSpacePanning = false;

		this.controls.minDistance = 25;
		this.controls.maxDistance = 25;

		this.controls.maxPolarAngle = Math.PI / 2;

		this.player = new Ship();

		this.cpus = [];
		this.golds = [];
		this.islands = [];
		this.sea = new Sea(this.size);
		addEventListener('resize', this.onWindowResize.bind(this));
	}
	create() {
		this.scene.add(new Ship().mesh);
		//spawn gold & islands
		Array(100)
			.fill(0)
			.forEach((_) => {
				const gold = new Gold();
				this.setRandomPos(gold.mesh);
				this.scene.add(gold.mesh);
				this.golds.push(gold);
			});
		Array(5)
			.fill(0)
			.forEach((_) => {
				const island = new Island();
				this.setRandomPos(island.mesh);
				this.scene.add(island.mesh);
				this.islands.push(island);
			});

		Array(5)
			.fill(0)
			.forEach((_) => {
				this.spawnCpu();
			});
		this.addLights();
		this.addSea();
	}
	destroy() {
		removeEventListener('resize', this.onWindowResize.bind(this));
	}
	addSea() {
		// this.scene.add(
		// 	new Mesh(
		// 		new BoxGeometry(this.size.w, 0, this.size.h),
		// 		new MeshStandardMaterial({ color: 0x2244ff })
		// 	)
		// );
		this.scene.add(this.sea.mesh());
	}
	addLights() {
		const dirLight1 = new DirectionalLight(0xffffff, 5);
		dirLight1.position.set(1, 1, 1);
		this.scene.add(dirLight1);

		const dirLight2 = new DirectionalLight(0x002288, 10);
		dirLight2.position.set(-1, -1, -1);
		this.scene.add(dirLight2);

		const ambientLight = new AmbientLight(0x555555, 20);
		this.scene.add(ambientLight);
	}
	setRandomPos(mesh: Mesh) {
		const p = mesh.position;
		p.setX((Math.random() - 0.5) * this.size.w);
		p.setY(0);
		p.setZ((Math.random() - 0.5) * this.size.h);
		mesh.updateMatrix();
		mesh.matrixAutoUpdate = false;
	}
	spawnCpu() {
		const ship = new Ship();
		this.setRandomPos(ship.mesh);
		ship.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
		this.scene.add(ship.mesh);
		this.cpus.push(ship);
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
		this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
		this.sea.update();
		this.render();
		//TODO: progress the game
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}
	assignLoadedAssets(loadedAssets: LoadedAssets) {
		const { ship } = loadedAssets;
		ship.scene.scale.set(0.02, 0.02, 0.02);
		ship.scene.rotateY(Math.PI);
		ship.scene.translateY(1.5);
		this.scene.add(ship.scene);
	}
}
