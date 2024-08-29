import type { CPU } from "./cpu";
import type { Player } from "./player";
import type { World } from "./gameObjects/world";
export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.border = "1px solid black";
    this.canvas.style.maxWidth = "calc(100% - 20px)";
    this.canvas.style.maxHeight = "calc(100% - 100px)";
    this.canvas.style.margin = "10px";
    this.canvas.style.backgroundColor = "white";
    this.ctx = this.canvas.getContext("2d")!;
  }
  appendTo(element: HTMLElement): void {
    element.style.display = "flex";
    element.style.justifyContent = "center";
    element.style.alignItems = "start";
    element.appendChild(this.canvas);
  }
  render(world: World, player: Player, cpus: CPU[]): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //rect color sea green
    this.ctx.fillStyle = "#2e9bb7";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //console.log("rendering",world,player,cpus);
    const { islands, loots, ships, cannonBalls } = world;
    islands.forEach((island) => {
      this.ctx.beginPath();
      this.ctx.arc(
        island.position.x,
        island.position.y,
        island.size,
        0,
        2 * Math.PI
      );
      this.ctx.fillStyle = "#f5dafa88";
      this.ctx.strokeStyle = "#2222";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.fill();
      //show cannonballs and gold
      this.ctx.font = "10px Arial";
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      //use emoji for cannonballs and gold
      this.ctx.fillText(
        `💰${island.shop.gold} 💣${island.shop.cannonBalls}`,
        island.position.x,
        island.position.y
      );
    });
    loots.forEach((loot) => {
      this.ctx.beginPath();
      this.ctx.arc(loot.position.x, loot.position.y, loot.size, 0, 2 * Math.PI);
      this.ctx.fillStyle = "gold";
      this.ctx.strokeStyle = "#2222";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.fill();
      //use emoji for value
      this.ctx.font = "10px Arial";
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(`${loot.value}`, loot.position.x, loot.position.y);
    });

    ships.forEach((ship) => {
      this.ctx.beginPath();
      this.ctx.arc(ship.position.x, ship.position.y, ship.size, 0, 2 * Math.PI);
      this.ctx.fillStyle =
        ship.shipIndex === player.ship.shipIndex ? "#4ea" : "#e42";
      this.ctx.strokeStyle = "#2222";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.fill();
      // Draw ship direction
      this.ctx.beginPath();
      this.ctx.moveTo(ship.position.x, ship.position.y);
      this.ctx.lineTo(
        ship.position.add(ship.direction.scale(10)).x,
        ship.position.add(ship.direction.scale(10)).y
      );
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "black";
      this.ctx.stroke();

      // Draw ship health
      this.ctx.font = "10px Arial";
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        `❤️${ship.health}`,
        ship.position.x,
        ship.position.y - 20
      );
      //Draw ship gold
      this.ctx.fillText(
        `💰${ship.gold}`,
        ship.position.x,
        ship.position.y + 20
      );
      this.ctx.fillText(
        `💣${ship.cannonBalls}`,
        ship.position.x,
        ship.position.y + 40
      );
    });

    cannonBalls.forEach((cannonBall) => {
      this.ctx.beginPath();
      this.ctx.arc(
        cannonBall.position.x,
        cannonBall.position.y,
        cannonBall.size,
        0,
        2 * Math.PI
      );
      this.ctx.fillStyle = "black";
      this.ctx.strokeStyle = "#2222";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.fill();
    });
  }
}
