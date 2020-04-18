@Component("Paralyzed")
export class Paralyzed extends ObservableComponent {
  end = 0;
}

export function setParalyzed(entity: IEntity) {
  const inv = entity.getComponentOrCreate(Paralyzed);

  if (inv.end == 0) {
    // this.sendConsoleMessage("You are now invisible.");
  }

  inv.end = 15;
}

export function setFree(entity: IEntity) {
  if (entity.removeComponent(Paralyzed)) {
    // this.sendConsoleMessage("You are back visible.");
    return true
  }
  return false
}

export function isParalyzed(entity: IEntity): boolean {
  return entity.hasComponent(Paralyzed);
}