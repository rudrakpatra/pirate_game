import type { CPU } from './cpu';
import type { Player } from './player';
import type { World } from './gameObjects/world';
import { Vector2d } from './vector2d';

export class Renderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	zoomFactor: number = 2;
	viewportSize: Vector2d = new Vector2d(800, 600);
	minimapSize: number = 150;
	minimapPadding: number = 10;
	shipSizeMultiplier: number = 1.5;

	constructor() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.viewportSize.x;
		this.canvas.height = this.viewportSize.y;
		this.canvas.style.border = '1px solid black';
		this.canvas.style.maxWidth = '100%';
		this.canvas.style.maxHeight = '100%';
		this.canvas.style.backgroundColor = 'white';
		this.ctx = this.canvas.getContext('2d')!;
	}

	appendTo(element: HTMLElement): void {
		element.style.display = 'flex';
		element.style.justifyContent = 'center';
		element.style.alignItems = 'center';
		element.appendChild(this.canvas);
	}

	render(world: World, player: Player, cpus: CPU[]): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Main view (zoomed)
		this.ctx.save();
		this.renderBackground(world);

		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;
		this.ctx.translate(centerX, centerY);
		this.ctx.scale(this.zoomFactor, this.zoomFactor);
		this.ctx.translate(-player.ship.position.x, -player.ship.position.y);

		this.renderGameObjects(world, player, cpus, false);
		this.ctx.restore();

		// Minimap
		this.renderMinimap(world, player, cpus);
	}

	renderBackground(world: World): void {
		// Create a pattern for the sea
		const patternCanvas = document.createElement('canvas');
		const patternCtx = patternCanvas.getContext('2d')!;
		patternCanvas.width = 100;
		patternCanvas.height = 100;

		patternCtx.fillStyle = '#2e9bb7';
		patternCtx.fillRect(0, 0, 100, 100);

		// Add some wave-like details
		patternCtx.strokeStyle = '#3eabc7';
		patternCtx.lineWidth = 2;
		for (let i = 0; i < 5; i++) {
			patternCtx.beginPath();
			patternCtx.moveTo(0, 20 * i);
			patternCtx.bezierCurveTo(25, 20 * i + 10, 75, 20 * i - 10, 100, 20 * i);
			patternCtx.stroke();
		}

		const pattern = this.ctx.createPattern(patternCanvas, 'repeat')!;
		this.ctx.fillStyle = pattern;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	renderGameObjects(world: World, player: Player, cpus: CPU[], isMinimap: boolean): void {
		const { islands, loots, ships, cannonBalls } = world;

		islands.forEach((island) =>
			this.renderWrappedObject(world, island, this.renderIsland.bind(this), isMinimap)
		);
		loots.forEach((loot) =>
			this.renderWrappedObject(world, loot, this.renderLoot.bind(this), isMinimap)
		);
		ships.forEach((ship) =>
			this.renderWrappedObject(
				world,
				ship,
				(obj, mini) => this.renderShip(obj, player, mini),
				isMinimap
			)
		);
		if (!isMinimap) {
			cannonBalls.forEach((cannonBall) =>
				this.renderWrappedObject(world, cannonBall, this.renderCannonBall.bind(this), isMinimap)
			);
		}
	}

	renderWrappedObject(
		world: World,
		object: any,
		renderFunc: (obj: any, isMinimap: boolean) => void,
		isMinimap: boolean
	): void {
		const wrappedPositions = this.getWrappedPositions(world, object.position);
		wrappedPositions.forEach((pos) => {
			this.ctx.save();
			this.ctx.translate(pos.x, pos.y);
			renderFunc({ ...object, position: { x: 0, y: 0 } }, isMinimap);
			this.ctx.restore();
		});
	}

	getWrappedPositions(world: World, position: Vector2d): Vector2d[] {
		const positions: Vector2d[] = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				positions.push(new Vector2d(position.x + dx * world.size, position.y + dy * world.size));
			}
		}
		return positions;
	}

	isCircleVisible(center: Vector2d, radius: number): boolean {
		const viewportLeft = -this.canvas.width / (2 * this.zoomFactor);
		const viewportRight = this.canvas.width / (2 * this.zoomFactor);
		const viewportTop = -this.canvas.height / (2 * this.zoomFactor);
		const viewportBottom = this.canvas.height / (2 * this.zoomFactor);

		return (
			center.x + radius > viewportLeft &&
			center.x - radius < viewportRight &&
			center.y + radius > viewportTop &&
			center.y - radius < viewportBottom
		);
	}

	renderIsland(island: any, isMinimap: boolean): void {
		if (!isMinimap && !this.isCircleVisible(island.position, island.size)) return;

		this.ctx.beginPath();
		this.ctx.arc(island.position.x, island.position.y, island.size, 0, 2 * Math.PI);
		this.ctx.fillStyle = isMinimap ? '#8B4513' : '#D2691E';
		this.ctx.fill();

		if (!isMinimap) {
			this.ctx.strokeStyle = '#5D4037';
			this.ctx.lineWidth = 2;
			this.ctx.stroke();

			// Draw some trees
			for (let i = 0; i < 5; i++) {
				const angle = (i / 5) * Math.PI * 2;
				const x = island.position.x + Math.cos(angle) * island.size * 0.7;
				const y = island.position.y + Math.sin(angle) * island.size * 0.7;
				this.drawTree(x, y, island.size * 0.2);
			}

			this.ctx.font = '10px Arial';
			this.ctx.fillStyle = 'white';
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(
				`💰${island.shop.gold} 💣${island.shop.cannonBalls}`,
				island.position.x,
				island.position.y
			);
		}
	}

	drawTree(x: number, y: number, size: number): void {
		this.ctx.fillStyle = '#228B22';
		this.ctx.beginPath();
		this.ctx.moveTo(x, y - size);
		this.ctx.lineTo(x - size / 2, y + size / 2);
		this.ctx.lineTo(x + size / 2, y + size / 2);
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.fillStyle = '#8B4513';
		this.ctx.fillRect(x - size / 8, y + size / 2, size / 4, size / 2);
	}

	renderLoot(loot: any, isMinimap: boolean): void {
		if (!isMinimap && !this.isCircleVisible(loot.position, loot.size)) return;

		this.ctx.beginPath();
		this.ctx.arc(loot.position.x, loot.position.y, loot.size, 0, 2 * Math.PI);
		this.ctx.fillStyle = 'gold';
		this.ctx.fill();

		if (!isMinimap) {
			this.ctx.strokeStyle = '#DAA520';
			this.ctx.lineWidth = 2;
			this.ctx.stroke();

			this.ctx.font = '10px Arial';
			this.ctx.fillStyle = 'black';
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(`${loot.value}`, loot.position.x, loot.position.y);
		}
	}

	renderShip(ship: any, player: Player, isMinimap: boolean): void {
		const shipSize = ship.size * (isMinimap ? 1 : this.shipSizeMultiplier);
		if (!isMinimap && !this.isCircleVisible(ship.position, shipSize)) return;

		const isPlayerShip = ship.shipIndex === player.ship.shipIndex;

		// Draw ship body
		this.ctx.beginPath();
		this.ctx.arc(ship.position.x, ship.position.y, shipSize, 0, 2 * Math.PI);
		this.ctx.fillStyle = isPlayerShip ? '#4ea' : '#e42';
		this.ctx.fill();
		this.ctx.strokeStyle = isPlayerShip ? '#2a8' : '#a20';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();

		if (!isMinimap) {
			// Draw ship direction
			this.ctx.beginPath();
			this.ctx.moveTo(ship.position.x, ship.position.y);
			this.ctx.lineTo(
				ship.position.x + ship.direction.x * shipSize * 1.5,
				ship.position.y + ship.direction.y * shipSize * 1.5
			);
			this.ctx.lineWidth = 3;
			this.ctx.strokeStyle = 'black';
			this.ctx.stroke();

			// Draw ship stats
			this.ctx.font = '12px Arial';
			this.ctx.fillStyle = 'white';
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(`❤️${ship.health}`, ship.position.x, ship.position.y - shipSize - 10);
			this.ctx.fillText(`💰${ship.gold}`, ship.position.x, ship.position.y);
			this.ctx.fillText(`💣${ship.cannonBalls}`, ship.position.x, ship.position.y + shipSize + 10);
		}
	}

	renderCannonBall(cannonBall: any): void {
		if (!this.isCircleVisible(cannonBall.position, cannonBall.size)) return;

		this.ctx.beginPath();
		this.ctx.arc(cannonBall.position.x, cannonBall.position.y, cannonBall.size, 0, 2 * Math.PI);
		this.ctx.fillStyle = 'black';
		this.ctx.fill();
		this.ctx.strokeStyle = '#555';
		this.ctx.lineWidth = 1;
		this.ctx.stroke();
	}

	renderMinimap(world: World, player: Player, cpus: CPU[]): void {
		const minimapX = this.canvas.width - this.minimapSize - this.minimapPadding;
		const minimapY = this.minimapPadding;

		// Draw minimap background
		this.ctx.fillStyle = 'rgba(46, 155, 183, 0.5)';
		this.ctx.fillRect(minimapX, minimapY, this.minimapSize, this.minimapSize);

		// Calculate scale factor for minimap
		const worldSize = Math.max(world.size, world.size);
		const scaleFactor = this.minimapSize / worldSize;

		// Clip the drawing to the minimap area
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.rect(minimapX, minimapY, this.minimapSize, this.minimapSize);
		this.ctx.clip();

		// Draw minimap objects
		this.ctx.translate(minimapX, minimapY);
		this.ctx.scale(scaleFactor, scaleFactor);
		this.renderGameObjects(world, player, cpus, true);

		// Restore to remove the clipping
		this.ctx.restore();

		// Draw minimap border
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(minimapX, minimapY, this.minimapSize, this.minimapSize);

		// Draw viewport rectangle on minimap
		const viewportWidth = this.canvas.width / this.zoomFactor;
		const viewportHeight = this.canvas.height / this.zoomFactor;
		const viewportX = (player.ship.position.x - viewportWidth / 2) * scaleFactor + minimapX;
		const viewportY = (player.ship.position.y - viewportHeight / 2) * scaleFactor + minimapY;
		this.ctx.strokeStyle = 'yellow';
		this.ctx.lineWidth = 1;
		this.ctx.strokeRect(
			viewportX,
			viewportY,
			viewportWidth * scaleFactor,
			viewportHeight * scaleFactor
		);
	}
}
