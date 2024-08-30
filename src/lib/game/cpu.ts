import type { Ship } from './gameObjects/ship';
import { Vector2d } from './vector2d';

export class CPU {
	ship: Ship;
	constructor(ship: any) {
		this.ship = ship;
	}
	update(deltaTime: number): void {
		// randomly choose to shoot or turn
		try {
			Math.random() > 0.5
				? this.ship.requestShoot(
						new Vector2d(Math.random() * Math.random() * 100, Math.random() * 100)
					)
				: this.ship.requestTurnRateChange(
						Math.random() * Math.random() * this.ship.maxTurnRate * 2 - this.ship.maxTurnRate
					);
		} catch (e) {
			// do nothing
		}
	}
}
