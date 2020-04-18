import { WorldPosition } from "../Components/WorldPosition";
import { TeleportTo } from "../Components/Teleport";
import { Walking } from "../Components/Walking";

export class TeleportSystem implements ISystem {
  private teleportingEntities!: ComponentGroup;

  constructor() {}

  activate(engine: Engine) {
    this.teleportingEntities = engine.getComponentGroup(WorldPosition, TeleportTo);
    log("WalkingSystem started");
  }

  update() {
    for (let entity of this.teleportingEntities.entities.slice()) {
      const teleportTo = entity.getComponentOrNull(TeleportTo);

      if (teleportTo) {
        // if the entity was walking cancel it
        entity.removeComponent(Walking);

        entity.removeComponent(TeleportTo);
      }
    }
  }
}
