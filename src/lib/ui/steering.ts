import { spring } from "svelte/motion";
import type { Spring } from "svelte/motion";

export class Steering {
  private dragging: boolean = false;
  private turnRate: number = 0;
  private turnRateOffset: number = 0;
  private lastTurnRate: number = 0;
  private maxTurnRate: number;
  private f: number = 1.5 * 1e5;
  private damping: number = 0.3;
  turnRateSpring: Spring<number>;

  constructor(maxTurnRate: number) {
    this.maxTurnRate = maxTurnRate;
    this.turnRateSpring = spring(this.bound(this.turnRate, 1), {
      stiffness: 0.3,
      damping: 0.2,
      precision: 0.1,
    });
  }

  bound(
    x: number,
    hardness = 0.001,
    min = -this.maxTurnRate * this.f,
    max = this.maxTurnRate * this.f
  ): number {
    let h1 = Math.min(max, Math.max(min, x));
    let H = (x: number) => x + Math.pow(h1 - x, 3) * hardness;
    let del = Math.sqrt(1 / (3 * hardness));
    let lo = h1 - del;
    let hi = h1 + del;
    if (x < lo) return H(lo);
    if (x > hi) return H(hi);
    return H(x);
  }

  handlePointerDown(e: PointerEvent, node: HTMLElement): void {
    const rect = node.getBoundingClientRect();
    this.turnRateOffset = e.clientX - rect.left;
    this.dragging = true;
    this.turnRateSpring.damping = 1;
  }

  handlePointerMove(e: PointerEvent, node: HTMLElement): void {
    const rect = node.getBoundingClientRect();
    if (this.dragging) {
      const x =
        this.lastTurnRate + (e.clientX - rect.left) - this.turnRateOffset;
      this.turnRate = this.bound(x);
      this.turnRateSpring.set(this.turnRate);
      this.turnRateSpring.damping = 1;
    }
  }

  handlePointerUp(e: PointerEvent, node: HTMLElement): number {
    const rect = node.getBoundingClientRect();
    const x = this.lastTurnRate + (e.clientX - rect.left) - this.turnRateOffset;
    this.turnRate = this.bound(x, 1000);
    this.turnRateSpring.set(this.turnRate);
    this.lastTurnRate = this.turnRate;
    this.dragging = false;
    this.turnRateSpring.damping = this.damping;
    return this.turnRate / this.f;
  }

  action(node: HTMLElement, onTurnAction: (turnRate: number) => void) {
    const down = (e: PointerEvent) => {
      this.handlePointerDown(e, node);
      addEventListener("pointermove", move);
      addEventListener("pointerup", up);
    };
    const move = (e: PointerEvent) => {
      this.handlePointerMove(e, node);
    };
    const up = (e: PointerEvent) => {
      let newTurnRate = this.handlePointerUp(e, node);
      onTurnAction(newTurnRate);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
    node.addEventListener("pointerdown", down);
    return {
      destroy() {
        node.removeEventListener("pointerdown", down);
        removeEventListener("pointermove", move);
        removeEventListener("pointerup", up);
      },
    };
  }
}
