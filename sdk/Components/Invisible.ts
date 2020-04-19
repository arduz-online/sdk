import { CharStatus } from "./CharStatus";

@Component("Invisible")
export class Invisible extends ObservableComponent {
  end = 0;
}

export function setInvisible(entity: IEntity) {
  const inv = entity.getComponentOrCreate(Invisible);
  inv.end = 15;
  entity.getComponentOrCreate(CharStatus).invisible = true
}

export function setVisible(entity: IEntity) {
  entity.getComponentOrCreate(CharStatus).invisible = false
  return entity.removeComponent(Invisible)
}

export function isInvisible(entity: IEntity): boolean {
  return entity.hasComponent(Invisible);
}