let idCounter = 0;
export function generateId() {
  return idCounter++;
}
export class GameObject {
  id: string = generateId().toString();
  needsRemoval: boolean = false;
  needsAddition: boolean = false;
  inserted: boolean = false;
  constructor() {}
  onCreate() {}
  onUpdate(deltaTime: number) {}
  onInteract(other: GameObject) {}
  onDestroy() {}
}
