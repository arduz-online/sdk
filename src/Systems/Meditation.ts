import { CharStats } from "../Components/Stats";
import { stopMeditating, Meditating } from "../Components/Meditation";
import { Walking } from "../Components/Walking";
import { Character } from "../Components/Character";

const MANA_RECOVERY_FACTOR = 5 / 100; // 5%

export class MeditationSystem implements ISystem {
  private timeCounter = 0;

  private charactersMeditating!: ComponentGroup;

  private onAdd = (entity: IEntity) => {
    if (entity instanceof Character) {
      entity.sendConsoleMessage("You start meditating.");
    }
  };

  private onRemove = (entity: IEntity) => {
    if (entity instanceof Character) {
      entity.sendConsoleMessage("You stop meditating.");
    }
  };

  activate(engine: Engine) {
    this.charactersMeditating = engine.getComponentGroup(
      { onAddEntity: this.onAdd, onRemoveEntity: this.onRemove },
      Meditating,
      CharStats
    );
    log("MeditationSystem started");
  }

  update(dt: number): void {
    this.timeCounter += dt;
    if (this.timeCounter < 0.1) return;
    this.timeCounter = 0;

    const entities = this.charactersMeditating.entities.slice();

    for (let char of entities) {
      const stats = char.getComponent(CharStats);

      if (char.hasComponent(Walking)) {
        stopMeditating(char);
        continue;
      }

      if (Math.random() < 0.5) {
        stats.minMana += (stats.maxMana * MANA_RECOVERY_FACTOR) | 0;
      }

      if (stats.minMana >= stats.maxMana) {
        stats.minMana = stats.maxMana;
        stopMeditating(char);
      }
    }
  }
}
