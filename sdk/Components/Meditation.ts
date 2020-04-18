import { setVisible } from "./Invisible";
import { Fx } from "./Fx";

export const MEDITATION_FX = [4, 5, 6, 16, 34];

@Component("Meditating")
export class Meditating {}

export function startMeditating(entity: IEntity) {
  setVisible(entity);

  entity.getComponentOrCreate(Meditating);
  entity.getComponentOrCreate(Fx).set(MEDITATION_FX[2], -1)
}

export function stopMeditating(char: IEntity) {
  if (char.removeComponent(Meditating)) {
    char.removeComponent(Fx);
  }
}

export function isMeditating(char: IEntity): boolean {
  return char.hasComponent(Meditating);
}
