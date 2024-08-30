import { GameObject } from '../gameObject';
import { Vector2d } from '../vector2d';
import { Ship } from './ship';

export class Loot extends GameObject {
	position: Vector2d;
	value: number;
	size = 8;

	constructor(position: Vector2d) {
		super();
		this.position = position;
		this.value = Math.floor(Math.random() * 10) + 1; // Random value from 1 to 10
	}

	onInteract(other: GameObject): void {
		if (other instanceof Loot) {
			if (this.position.distanceTo(other.position) < this.size + other.size)
				this.needsRemoval = !other.needsRemoval;
		} else if (other instanceof Ship) {
			if (this.position.distanceTo(other.position) < this.size + other.size)
				this.needsRemoval = true;
		}
	}
}
