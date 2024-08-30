import { Vector2d } from '../vector2d';
import { EventSystem } from '../event';
import { GameObject } from '../gameObject';
import { Island } from './island';
import { Loot } from './loot';
import { CannonBall } from './cannonBall';

export class Ship extends GameObject {
	health: number;
	speed: number = 0.01;
	position: Vector2d;
	direction: Vector2d;
	gold: number = 0;
	cannonBalls: number = 10;
	shot: CannonBall;
	size: number = 10;
	private lastShotTime: number;
	private shotInterval: number;
	private shotDelay: number;
	private eventSystem: EventSystem;
	private turnRate: number = 0;
	maxTurnRate: number = 0.001;
	maxRange: number = 100;
	private lastTurnRateSetTime: number = 0;
	private turnRateSetInterval: number = 1; // 1 second between turns
	shipIndex: number;

	constructor(position: Vector2d, eventSystem: EventSystem, initialHealth: number = 10) {
		super();
		this.health = initialHealth;
		this.position = position;

		this.direction = new Vector2d(1, 0);
		this.lastShotTime = 0;
		this.shotInterval = 2; // 2 seconds between shots
		this.shotDelay = 1; // 1 second delay before shot fires
		this.shot = new CannonBall(new Vector2d(0, 0));
		this.eventSystem = eventSystem;
		this.shipIndex = this.eventSystem.addShip(this);
	}

	onUpdate(deltaTime: number): void {
		this.updateRotation(deltaTime);
		this.updatePosition(deltaTime);
	}

	private updateRotation(deltaTime: number): void {
		const rotation = this.turnRate * deltaTime;
		this.direction = this.direction.rotate(rotation);
	}

	private updatePosition(deltaTime: number): void {
		this.position = this.position.add(this.direction.scale(this.speed * deltaTime));
	}

	applyTurnRateChange(rate: number): void {
		this.turnRate = Math.max(-this.maxTurnRate, Math.min(this.maxTurnRate, rate));
	}

	shoot(offset: Vector2d): void {
		this.shot = new CannonBall(this.position.add(offset));
		this.shot.needsAddition = true;
	}
	requestTurnRateChange(rate: number): void {
		const currentTime = Date.now() / 1000;
		if (currentTime - this.lastTurnRateSetTime >= this.turnRateSetInterval) {
			this.lastTurnRateSetTime = currentTime;
			this.eventSystem.pushTurnEvent(this.shipIndex, rate);
			return;
		}
		throw new Error('NA');
	}

	requestShoot(offset: Vector2d): void {
		const currentTime = Date.now() / 1000;
		if (currentTime - this.lastShotTime >= this.shotInterval && this.cannonBalls > 0) {
			this.lastShotTime = currentTime;
			this.eventSystem.pushShootEvent(this.shipIndex, offset, this.shotDelay);
			this.cannonBalls--;
			return;
		}
		throw new Error('NA');
	}
	takeLoot(loot: any): void {
		this.gold += loot;
	}

	takeDamage(damage: number): void {
		this.health -= damage;
		if (this.health <= 0) {
			this.destroy();
		}
	}

	onInteract(other: GameObject): void {
		if (other instanceof Ship) {
			// Implement ship interaction logic here
		} else if (other instanceof Island) {
			// Implement island interaction logic here
		} else if (other instanceof Loot) {
			if (this.position.distanceTo(other.position) < this.size + other.size)
				this.takeLoot(other.value);
		}
	}

	destroy(): void {
		//console.log('Ship destroyed!');
		this.health = 0;
		this.direction = new Vector2d(0, 0);
		this.needsRemoval = true;
	}
}
