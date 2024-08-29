import { GameObject } from "./gameObject";
import { Ship } from "./gameObjects/ship";
import { Vector2D } from "./vector2d";

interface PlayerAction {
  type: "shoot" | "turn";
  value: Vector2D | number;
}

export class Player extends GameObject {
  ship: Ship;
  private actionQueue: PlayerAction[] = [];

  constructor(ship: Ship) {
    super();
    this.ship = ship;
  }

  onUpdate(deltaTime: number): void {
    const action = this.actionQueue[0];
    this.ship.onUpdate(deltaTime);
    if (!action) return;
    try {
      switch (action.type) {
        case "shoot":
          this.ship.requestShoot(action.value as Vector2D);
          break;
        case "turn":
          this.ship.requestTurnRateChange(action.value as number);
          break;
      }
      this.actionQueue.shift();
    } catch (e) {
      if (e === "NA") return;
    }
  }

  addShootAction(offset: Vector2D): void {
    this.actionQueue.push({ type: "shoot", value: offset });
  }

  addTurnAction(omega: number): void {
    this.actionQueue.push({ type: "turn", value: omega });
  }
}
