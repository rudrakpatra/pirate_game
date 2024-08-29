import { GameObject } from "../gameObject";
import { Vector2D } from "../vector2d";
import { Ship } from "./ship";

export class Island extends GameObject {
  position: Vector2D;
  size = 30;
  shop: { cannonBalls: number; gold: number };

  constructor(position: Vector2D) {
    super();
    this.position = position;
    this.shop = { cannonBalls: 10, gold: 0 }; // Initial cannon stock
  }

  onInteract(other: GameObject): void {
    if (other instanceof Island) {
      this.needsRemoval != other.needsRemoval; // remove the first island
    } else if (other instanceof Ship) {
      if (this.position.distanceTo(other.position) < this.size + other.size)
        this.dock(other);
    }
  }

  dock(ship: any): void {
    // Implement docking logic here
    let trade = Math.min(ship.gold, this.shop.cannonBalls);
    ship.cannonBalls += trade;
    this.shop.cannonBalls -= trade;
    ship.gold -= trade;
    this.shop.gold += trade;
  }
}
