import type { Character } from "./Character";
import { TargetType } from "../Enums";

@Component("RequestedTarget")
export class RequestedTarget extends ObservableComponent {
  @ObservableComponent.field type: TargetType;
  @ObservableComponent.field slot: number;
  @ObservableComponent.field range: number;
  @ObservableComponent.field distance: number;

  constructor(type: TargetType, slot: number = 0, range: number = 1, distance: number = 15) {
    super();
    this.type = type;
    this.slot = slot;
    this.range = range;
    this.distance = distance;
  }
}

export function cancelCasting(char: Character) {
  char.removeComponent(RequestedTarget);
}

export function requestTargetFor(char: Character, type: TargetType, slot: number) {
  // TODO: add validations: interval, skill/item exist.
  char.addComponentOrReplace(new RequestedTarget(type, slot));
}
