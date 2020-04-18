import { Invisible, setVisible } from "../Components/Invisible";
import { Character } from "../Components/Character";

export class InvisibleSystem implements ISystem {
  private charactersMeditating!: ComponentGroup;

  activate(engine: Engine) {
    this.charactersMeditating = engine.getComponentGroup(Invisible);
    log("InvisibleSystem started");
  }

  update(dt: number): void {
    const entities = this.charactersMeditating.entities.slice();

    for (let char of entities) {
      const inv = char.getComponent(Invisible);
      inv.end -= dt;
      if (inv.end <= 0) {
        setVisible(char);
        if (char instanceof Character) {
          char.sendConsoleMessage("You are visible again.");
        }
      }
    }
  }
}
