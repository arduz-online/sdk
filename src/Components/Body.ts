import { getRandomInteger } from "../AtomicHelpers/Numbers";
import { CharClass, Race, Gender } from "../Enums";

export const DEAD_BODY = 8;
export const DEAD_HEAD = 500;

@Component("Body")
export class Body extends ObservableComponent {
  @ObservableComponent.field
  dead: boolean = true;

  @ObservableComponent.field
  head: number = DEAD_HEAD;

  @ObservableComponent.field
  body: number = DEAD_BODY;

  @ObservableComponent.field
  speed: number = 1;

  @ObservableComponent.field
  helmet: number = 0;

  @ObservableComponent.field
  leftHand: number = 0;

  @ObservableComponent.field
  rightHand: number = 0;

  @ObservableComponent.field
  isLeftHandWeapon: boolean = false;

  @ObservableComponent.field
  isRightHandWeapon: boolean = false;

  @ObservableComponent.field
  nick: string = "";

  @ObservableComponent.field
  color: string = "#ffffff";

  @ObservableComponent.field
  mimetism: Body | null = null;

  charClass: CharClass = CharClass.Spectator;
  race: Race = Race.Human;
  gender: Gender = Gender.Male;

  resucitate() {
    if (this.dead) {
      this.dead = false;
    }
  }

  kill() {
    if (!this.dead) {
      this.dead = true;
      this.mimetism = null;
    }
  }
}

export function getNakedBody(gender: Gender, race: Race): number {
  if (gender === Gender.Male) {
    switch (race) {
      case Race.Human:
        return 21;
      case Race.Drow:
        return 32;
      case Race.Elf:
        return 210;
      case Race.Gnome:
        return 222;
      case Race.Dwarf:
        return 53;
    }
  } else {
    switch (race) {
      case Race.Human:
        return 39;
      case Race.Drow:
        return 40;
      case Race.Elf:
        return 259;
      case Race.Gnome:
        return 260;
      case Race.Dwarf:
        return 60;
    }
  }
  return 21;
}

export function getHead(gender: Gender, race: Race): number {
  if (gender === Gender.Male) {
    switch (race) {
      case Race.Human:
        return getRandomInteger(1, 40);
      case Race.Drow:
        return getRandomInteger(200, 210);
      case Race.Elf:
        return getRandomInteger(101, 112);
      case Race.Gnome:
        return getRandomInteger(401, 406);
      case Race.Dwarf:
        return getRandomInteger(300, 306);
    }
  } else {
    switch (race) {
      case Race.Human:
        return getRandomInteger(70, 79);
      case Race.Drow:
        return getRandomInteger(270, 278);
      case Race.Elf:
        return getRandomInteger(170, 178);
      case Race.Gnome:
        return getRandomInteger(370, 372);
      case Race.Dwarf:
        return getRandomInteger(470, 476);
    }
  }
  return 1;
}
