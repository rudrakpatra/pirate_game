import { Vector2d } from '../game/vector2d';
import { spring, type Spring } from 'svelte/motion';

export class Shooting {
	private dragging: boolean = false;
	private offsetOffset: Vector2d | null = null;
	private maxRange: number;
	private f: number = 1.5;
	private damping: number = 0.3;
	offsetSpring: Spring<Vector2d>;

	constructor(maxRange: number) {
		this.maxRange = maxRange;
		this.offsetSpring = spring(new Vector2d(0, 0));
	}

	bound(x: number, min = 0 * this.f, max = this.maxRange * this.f): number {
		return Math.min(max, Math.max(min, x));
	}

	handlePointerDown(e: PointerEvent, node: HTMLElement): void {
		const rect = node.getBoundingClientRect();
		this.offsetOffset = new Vector2d(e.clientX - rect.left, e.clientY - rect.top);
		this.offsetSpring.set(new Vector2d(0, 0));
		this.dragging = true;
		this.offsetSpring.damping = 1;
	}

	handlePointerMove(e: PointerEvent, node: HTMLElement): void {
		const rect = node.getBoundingClientRect();
		if (this.dragging) {
			const offset = new Vector2d(e.clientX - rect.left, e.clientY - rect.top).subtract(
				this.offsetOffset!
			);
			const length = offset.magnitude();
			const bounded = this.bound(length);
			const direction = offset.normalize();
			const boundedOffset = direction.scale(bounded);
			this.offsetSpring.set(boundedOffset);
		}
	}

	handlePointerUp(e: PointerEvent, node: HTMLElement): Vector2d {
		const rect = node.getBoundingClientRect();
		const offset = new Vector2d(e.clientX - rect.left, e.clientY - rect.top).subtract(
			this.offsetOffset!
		);
		const length = offset.magnitude();
		const bounded = this.bound(length);
		const direction = offset.normalize();
		const boundedOffset = direction.scale(bounded);
		this.offsetSpring.set(new Vector2d(0, 0));
		this.dragging = false;
		this.offsetSpring.damping = this.damping;
		return boundedOffset;
	}

	action(node: HTMLElement, onShoot: (newOffset: Vector2d) => void) {
		const down = (e: PointerEvent) => {
			this.handlePointerDown(e, node);
			addEventListener('pointermove', move);
			addEventListener('pointerup', up);
		};
		const move = (e: PointerEvent) => {
			this.handlePointerMove(e, node);
		};
		const up = (e: PointerEvent) => {
			let offset = this.handlePointerUp(e, node);
			onShoot(offset);
			removeEventListener('pointermove', move);
			removeEventListener('pointerup', up);
		};
		node.addEventListener('pointerdown', down);
		return {
			destroy() {
				node.removeEventListener('pointerdown', down);
				removeEventListener('pointermove', move);
				removeEventListener('pointerup', up);
			}
		};
	}
}
