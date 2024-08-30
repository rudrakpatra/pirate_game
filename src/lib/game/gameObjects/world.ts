import { Ship } from './ship';
import { Vector2d } from '../vector2d';
import { generatePoissionPoints } from '../utils';
import { EventSystem } from '../event';
import { Island } from './island';
import { Loot } from './loot';
import { GameObject } from '../gameObject';
import type { CannonBall } from './cannonBall';

export class World extends GameObject {
	size: number;
	sightRadius: number;
	islands: Island[];
	loots: Loot[];
	ships: Ship[];
	cannonBalls: CannonBall[];
	private eventSystem: EventSystem;

	constructor(worldSize: number, sightRadius: number, eventSystem: EventSystem) {
		super();
		this.size = worldSize;
		this.sightRadius = sightRadius;
		this.eventSystem = eventSystem;
		this.islands = [];
		this.loots = [];
		this.ships = [];
		this.cannonBalls = [];
	}
	get gameObjects(): GameObject[] {
		return [...this.islands, ...this.loots, ...this.ships, ...this.cannonBalls];
	}

	generate(): void {
		this.generateIslands(3);
		this.generateLoots(100);
	}

	onCreate(): void {
		this.ships.forEach((ship) => ship.shot.needsAddition && this.cannonBalls.push(ship.shot));
		this.gameObjects.forEach((self) => self.onCreate());
	}

	onUpdate(deltaTime: number): void {
		this.ships.forEach((ship) => ship.onUpdate(deltaTime));
		this.ships.forEach((ship) => (ship.position = ship.position.mod(this.size)));
		this.gameObjects.forEach((self) => {
			this.gameObjects.forEach((other) => {
				if (self.id !== other.id) self.onInteract(other);
			});
		});
	}

	onDestroy(): void {
		this.gameObjects.forEach((gameObject) => {
			gameObject.needsRemoval && gameObject.onDestroy();
		});
		this.islands = this.islands.filter((self) => !self.needsRemoval);
		this.loots = this.loots.filter((self) => !self.needsRemoval);
		this.ships = this.ships.filter((self) => !self.needsRemoval);
		this.cannonBalls = this.cannonBalls.filter((self) => !self.needsRemoval);
	}

	get randomWorldPosition(): Vector2d {
		return new Vector2d(Math.random() * this.size, Math.random() * this.size);
	}

	spawnLoot(): Loot {
		const loot = new Loot(this.randomWorldPosition);
		this.loots.push(loot);
		return loot;
	}

	spawnShip(): Ship {
		const ship = new Ship(this.randomWorldPosition, this.eventSystem);
		this.ships.push(ship);
		return ship;
	}
	spawnIsland(): Island {
		const island = new Island(this.randomWorldPosition);
		this.islands.push(island);
		return island;
	}
	generateLoots(n: number): void {
		const points = generatePoissionPoints(2400, this.size, this.size, 50, n);
		this.loots = points.map((point) => new Loot(point));
	}
	generateIslands(n: number): void {
		const points = generatePoissionPoints(1230, this.size, this.size, 100, n);
		this.islands = points.map((point) => new Island(point));
	}
}
