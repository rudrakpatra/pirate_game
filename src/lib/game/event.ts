import { CannonBall } from './gameObjects/cannonBall';
import { Ship } from './gameObjects/ship';
import { Vector2d } from './vector2d';

interface ShootEvent {
	shipIndex: number;
	offset: Vector2d;
	fireTime: number;
}

interface TurnEvent {
	shipIndex: number;
	rate: number;
	applyTime: number;
}

export class EventSystem {
	private shootEvents: ShootEvent[] = [];
	private turnEvents: TurnEvent[] = [];
	private TriggerPeriod: number = 1;
	private ships: Ship[] = [];

	addShip(ship: Ship): number {
		this.ships.push(ship);
		return this.ships.length - 1;
	}

	pushShootEvent(shipIndex: number, offset: Vector2d, delay: number): void {
		const currentTime = Date.now() / 1000;
		const fireTime = Math.ceil((currentTime + delay) / this.TriggerPeriod) * this.TriggerPeriod;
		this.shootEvents.push({ shipIndex, offset, fireTime });
	}

	pushTurnEvent(shipIndex: number, rate: number): void {
		const currentTime = Date.now() / 1000;
		const applyTime = Math.ceil(currentTime / this.TriggerPeriod) * this.TriggerPeriod;
		this.turnEvents.push({ shipIndex, rate, applyTime });
	}

	update(deltaTime: number): void {
		const currentTime = Date.now() / 1000;

		// Process shoot events
		const shootEventsToFire = this.shootEvents.filter((event) => event.fireTime <= currentTime);
		shootEventsToFire.forEach((event) => {
			this.ships[event.shipIndex].shoot(event.offset);
		});
		this.shootEvents = this.shootEvents.filter((event) => event.fireTime > currentTime);

		// Process turn events
		const turnEventsToApply = this.turnEvents.filter((event) => event.applyTime <= currentTime);
		turnEventsToApply.forEach((event) => {
			this.ships[event.shipIndex].applyTurnRateChange(event.rate);
		});
		this.turnEvents = this.turnEvents.filter((event) => event.applyTime > currentTime);
	}
}
