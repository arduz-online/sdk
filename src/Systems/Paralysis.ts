import { setFree, Paralyzed } from "../Components/Paralysis";
import { Walking } from "../Components/Walking";
import { Character } from "../Components/Character";

export class ParalysisSystem implements ISystem {
  private charactersMeditating!: ComponentGroup;

  activate(engine: Engine) {
    this.charactersMeditating = engine.getComponentGroup(Paralyzed);
    log("ParalysisSystem started");
  }

  update(dt: number): void {
    const entities = this.charactersMeditating.entities.slice();

    for (let char of entities) {
      const inv = char.getComponent(Paralyzed);

      char.removeComponent(Walking);

      inv.end -= dt;
      if (inv.end <= 0) {
        setFree(char);
        if (char instanceof Character) {
          char.sendConsoleMessage("You recovered your mobility.");
        }
      }
    }
  }
}
