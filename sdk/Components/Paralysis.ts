import { CharStatus } from "./CharStatus";

@Component("Paralyzed")
export class Paralyzed extends ObservableComponent {
  end = 0;
}

export function setParalyzed(entity: IEntity) {
  const inv = entity.getComponentOrCreate(Paralyzed);
  inv.end = 15;
  entity.getComponentOrCreate(CharStatus).paralyzed = true;
}

export function setFree(entity: IEntity) {
  entity.getComponentOrCreate(CharStatus).paralyzed = false;
  return entity.removeComponent(Paralyzed);
}

export function isParalyzed(entity: IEntity): boolean {
  return entity.hasComponent(Paralyzed);
}
