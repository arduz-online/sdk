@Component("Invisible")
export class Invisible extends ObservableComponent {
  end = 0;
}

export function setInvisible(entity: IEntity) {
  const inv = entity.getComponentOrCreate(Invisible);

  if (inv.end == 0) {
    // this.sendConsoleMessage("You are now invisible.");
  }

  inv.end = 15;
}

export function setVisible(entity: IEntity) {
  return entity.removeComponent(Invisible)
}

export function isInvisible(entity: IEntity): boolean {
  return entity.hasComponent(Invisible);
}