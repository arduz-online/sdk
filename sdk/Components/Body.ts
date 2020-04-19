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