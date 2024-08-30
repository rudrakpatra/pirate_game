import { Vector2d } from './vector2d';

export function generatePoissionPoints(
	seed: number,
	width: number,
	height: number,
	radius: number,
	attempts: number
): Vector2d[] {
	// Implement Poisson disk sampling algorithm here
	// This is a placeholder implementation
	const points: Vector2d[] = [];
	const rng = seedRandom(seed);

	for (let i = 0; i < attempts; i++) {
		const x = rng() * width;
		const y = rng() * height;
		const point = new Vector2d(x, y);

		if (!points.some((p) => p.distanceTo(point) < radius)) {
			points.push(point);
		}
	}

	return points;
}

function seedRandom(seed: number): () => number {
	// Implement a seeded random number generator
	// This is a simple placeholder implementation
	return () => {
		seed = (seed * 1664525 + 1013904223) % 4294967296;
		return seed / 4294967296;
	};
}
