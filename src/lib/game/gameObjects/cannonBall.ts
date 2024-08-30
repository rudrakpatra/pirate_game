import { GameObject } from '../gameObject';
import { Vector2d } from '../vector2d';
import { Ship } from './ship';

export class CannonBall extends GameObject {
	position: Vector2d;
	lifeTime = 10; //10 frames
	damage = 1;
	size = 4;
	constructor(position: Vector2d) {
		super();
		this.position = position;
	}
	onCreate(): void {
		this.needsAddition = true;
		this.needsRemoval = true;
		this.lifeTime = 10;
	}
	onInteract(other: GameObject): void {
		if (other instanceof Ship) {
			if (this.position.distanceTo(other.position) < this.size + other.size) {
				other.takeDamage(this.damage);
			}
		}
	}
	onDestroy(): void {
		if (this.lifeTime-- <= 0) {
			this.needsRemoval = true;
			this.needsAddition = false;
		}
	}
}
