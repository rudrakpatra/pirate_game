import { World } from './gameObjects/world';
import { Player } from './player';
import { CPU } from './cpu';
import { EventSystem } from './event';
import { Renderer } from './renderer';
import { ThreeRenderer } from './threeRenderer';

export class Game {
	renderer: ThreeRenderer;
	private world: World;
	player: Player;
	private cpus: CPU[];
	private eventSystem: EventSystem;
	private elaspedTime: number = 0;

	constructor(worldSize: number, sightRadius: number) {
		this.eventSystem = new EventSystem();
		this.world = new World(worldSize, sightRadius, this.eventSystem);
		this.world.generate();
		this.player = new Player(this.world.spawnShip());
		this.cpus = Array(10)
			.fill(0)
			.map(() => new CPU(this.world.spawnShip())); // Initialize 5 CPU-controlled ships
		this.renderer = new ThreeRenderer();
		this.elaspedTime = Date.now();
	}

	loop(): void {
		let deltaTime = Date.now() - this.elaspedTime;
		this.elaspedTime = Date.now();
		this.world.onCreate();
		this.world.onUpdate(deltaTime);
		this.player.onUpdate(deltaTime);
		this.cpus.forEach((cpu) => cpu.update(deltaTime));
		this.eventSystem.update(deltaTime);
		this.renderer.render(this.world, this.player, this.cpus);
		//destroy game objects if needed
		this.world.onDestroy();
		requestAnimationFrame(() => this.loop());
	}
}
