export class Vector2d {
	constructor(
		public x: number,
		public y: number
	) {}

	add(other: Vector2d): Vector2d {
		return new Vector2d(this.x + other.x, this.y + other.y);
	}

	subtract(other: Vector2d): Vector2d {
		return new Vector2d(this.x - other.x, this.y - other.y);
	}

	mod(v: number): Vector2d {
		return new Vector2d((this.x + v) % v, (this.y + v) % v);
	}

	scale(scalar: number): Vector2d {
		return new Vector2d(this.x * scalar, this.y * scalar);
	}

	magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize(): Vector2d {
		const mag = this.magnitude();
		return mag === 0 ? new Vector2d(0, 0) : this.scale(1 / mag);
	}

	rotate(angle: number): Vector2d {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		return new Vector2d(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
	}

	distanceTo(other: Vector2d): number {
		return this.subtract(other).magnitude();
	}
}
