import { Mimetism } from "../Components/Mimetism";
import { Body } from "../Components/Body";
import { Character } from "../Components/Character";

export class MimetismSystem implements ISystem {
  private mimetizedCharacters!: ComponentGroup;

  activate(engine: Engine) {
    this.mimetizedCharacters = engine.getComponentGroup(
      {
        onRemoveEntity: this.onRemoveMimetizedEntity,
      },
      Body,
      Mimetism
    );
    log("InvisibleSystem started");
  }

  private onRemoveMimetizedEntity = (entity: IEntity) => {
    const body = entity.getComponent(Body);
    body.mimetism = null;

    if (entity instanceof Character) {
      entity.sendConsoleMessage("You recovered your original shape.");
    }
  };

  update(dt: number): void {
    const entities = this.mimetizedCharacters.entities.slice();

    for (let char of entities) {
      const inv = char.getComponent(Mimetism);
      inv.timer -= dt;
      if (inv.timer <= 0) {
        char.removeComponent(Mimetism);
      }
    }
  }
}
