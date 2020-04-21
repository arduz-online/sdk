import { Connection } from "../Components/Connection";
import { WorldPosition, entitiesInPosition } from "../Components/WorldPosition";
import { headToPos } from "../AtomicHelpers/HeadToPos";
import { Walking } from "../Components/Walking";
import { MapData } from "../Components/MapData";
import { getRandomInteger } from "../AtomicHelpers/Numbers";
import { Timers } from "../Components/Timers";
import { isParalyzed } from "../Components/Paralysis";
import { Heading } from "../Enums";

export class WalkingSystem implements ISystem {
  private walkingEntitiesGroup!: ComponentGroup;

  constructor() {}

  activate(engine: Engine) {
    this.walkingEntitiesGroup = engine.getComponentGroup(
      WorldPosition,
      Walking
    );
    log("WalkingSystem started");
  }

  update() {
    for (let { entity, position, walking } of this.walkingEntities()) {
      const timers = entity.getComponentOrNull(Timers);

      let forceUpdate = false;

      if (isParalyzed(entity)) {
        forceUpdate = true;
      } else {
        if (walking.target) {
          const newHeading = this.greedyWalkTo(
            position.x,
            position.y,
            walking.target.x,
            walking.target.y
          );
          if (newHeading !== null) {
            walking.heading = newHeading;
          }
        }

        if (this.canUserMove(position.x, position.y, walking.heading)) {
          let newPos = headToPos(position.x, position.y, walking.heading);
          position.x = newPos.x;
          position.y = newPos.y;

          position.enqueueSendToAreaButMe({
            CharMove: {
              entityId: entity.uuid,
              x: position.x,
              y: position.y,
              heading: walking.heading,
            },
          });

          position.dirty = false;
        } else {
          forceUpdate = true;
        }
      }

      if (timers) {
        timers.canWalk(true);
      }

      if (forceUpdate && entity.hasComponent(Connection)) {
        position.enqueueSendToArea({
          UpdatePosition: {
            entityId: entity.uuid,
            x: position.x,
            y: position.y,
          },
        });
      }

      entity.removeComponent(Walking);
    }
  }

  private canUserMove(x: number, y: number, heading: Heading) {
    const pos = headToPos(x, y, heading);
    const block = this.getBlock(pos.x, pos.y);

    if (!block) return false;
    const blocked = block.blocked;
    switch (heading) {
      case Heading.North:
        return 0 === (blocked & 1) && this.canWalkToPosition(pos.x, pos.y);
      case Heading.East:
        return 0 === (blocked & 2) && this.canWalkToPosition(pos.x, pos.y);
      case Heading.South:
        return 0 === (blocked & 4) && this.canWalkToPosition(pos.x, pos.y);
      case Heading.West:
        return 0 === (blocked & 8) && this.canWalkToPosition(pos.x, pos.y);
    }
    return true;
  }

  private canWalkToPosition(x: number, y: number) {
    for (let {} of entitiesInPosition(x, y)) {
      return false;
    }
    return true;
  }

  private getBlock(x: number, y: number) {
    const map = engine.rootEntity.getComponent(MapData);

    if (map) {
      return map.getBlock(x, y);
    }

    return null;
  }

  private *walkingEntities() {
    for (let entity of this.walkingEntitiesGroup.entities.slice()) {
      yield {
        entity,
        position: entity.getComponent(WorldPosition),
        walking: entity.getComponent(Walking),
      };
    }
  }

  private greedyWalkTo(
    srcX: number,
    srcY: number,
    dstX: number,
    dstY: number
  ): Heading | null {
    const dual: number = getRandomInteger(0, 10);

    const directWalk: boolean =
      srcX == dstX && srcY == dstY ? false : getRandomInteger(0, 4) != 0;

    //  Levanto las coordenadas del destino
    if (directWalk) {
      //  moverse
      if (srcX > dstX) {
        if (srcY < dstY) {
          //NPC esta arriba a la derecha
          if ((dual & 1) == 0) {
            //move down
            if (this.canUserMove(srcX, srcY, Heading.South)) {
              return Heading.South;
            } else if (this.canUserMove(srcX, srcY, Heading.West)) {
              return Heading.West;
            } else if (this.canUserMove(srcX, srcY, Heading.East)) {
              return Heading.East;
            } else if (this.canUserMove(srcX, srcY, Heading.North)) {
              return Heading.North;
            }
          } else {
            //random first move
            if (this.canUserMove(srcX, srcY, Heading.West)) {
              return Heading.West;
            } else if (this.canUserMove(srcX, srcY, Heading.South)) {
              return Heading.South;
            } else if (this.canUserMove(srcX, srcY, Heading.East)) {
              return Heading.East;
            } else if (this.canUserMove(srcX, srcY, Heading.North)) {
              return Heading.North;
            }
          } //checked random first move
        } else if (srcY > dstY) {
          //NPC esta abajo a la derecha
          if ((dual & 1) == 0) {
            //move up
            if (this.canUserMove(srcX, srcY, Heading.North)) {
              //U
              return Heading.North;
            } else if (this.canUserMove(srcX, srcY, Heading.West)) {
              //L
              return Heading.West;
            } else if (this.canUserMove(srcX, srcY, Heading.South)) {
              //D
              return Heading.South;
            } else if (this.canUserMove(srcX, srcY, Heading.East)) {
              //R
              return Heading.East;
            }
          } else {
            //random first move
            if (this.canUserMove(srcX, srcY, Heading.West)) {
              //L
              return Heading.West;
            } else if (this.canUserMove(srcX, srcY, Heading.South)) {
              //D
              return Heading.South;
            } else if (this.canUserMove(srcX, srcY, Heading.East)) {
              //R
              return Heading.East;
            }
          } //endif random first move
        } else {
          //x completitud, esta en la misma Y
          if (this.canUserMove(srcX, srcY, Heading.West)) {
            //L
            return Heading.West;
          } else if (this.canUserMove(srcX, srcY, Heading.South)) {
            //D
            return Heading.South;
          } else if (this.canUserMove(srcX, srcY, Heading.North)) {
            //U
            return Heading.North;
          }
        }
      } else if (srcX < dstX) {
        if (srcY < dstY) {
          //NPC esta arriba a la izquierda
          if ((dual & 1) == 0) {
            //move down
            if (this.canUserMove(srcX, srcY, Heading.South)) {
              //ABA
              return Heading.South;
            } else if (this.canUserMove(srcX, srcY, Heading.East)) {
              //R
              return Heading.East;
            } else if (this.canUserMove(srcX, srcY, Heading.West)) {
              return Heading.West;
            } else if (this.canUserMove(srcX, srcY, Heading.North)) {
              return Heading.North;
            }
          } else {
            //random first move
            if (this.canUserMove(srcX, srcY, Heading.East)) {
              //DER
              return Heading.East;
            } else if (this.canUserMove(srcX, srcY, Heading.South)) {
              //ABA
              return Heading.South;
            } else if (this.canUserMove(srcX, srcY, Heading.West)) {
              return Heading.West;
            } else if (this.canUserMove(srcX, srcY, Heading.North)) {
              return Heading.North;
            }
          }
        } else if (srcY > dstY) {
          //NPC esta abajo a la izquierda
          if ((dual & 1) == 0) {
            //move up
            if (this.canUserMove(srcX, srcY, Heading.North)) {
              //U
              return Heading.North;
            } else if (this.canUserMove(srcX, srcY, Heading.East)) {
              //R
              return Heading.East;
            } else if (this.canUserMove(srcX, srcY, Heading.West)) {
              //L
              return Heading.West;
            } else if (this.canUserMove(srcX, srcY, Heading.South)) {
              //D
              return Heading.South;
            }
          } else {
            if (this.canUserMove(srcX, srcY, Heading.East)) {
              //R
              return Heading.East;
            } else if (this.canUserMove(srcX, srcY, Heading.North)) {
              //U
              return Heading.North;
            } else if (this.canUserMove(srcX, srcY, Heading.South)) {
              //D
              return Heading.South;
            } else if (this.canUserMove(srcX, srcY, Heading.West)) {
              //L
              return Heading.West;
            }
          }
        } else {
          //x completitud, esta en la misma Y
          if (this.canUserMove(srcX, srcY, Heading.East)) {
            //R
            return Heading.East;
          } else if (this.canUserMove(srcX, srcY, Heading.South)) {
            //D
            return Heading.South;
          } else if (this.canUserMove(srcX, srcY, Heading.North)) {
            //U
            return Heading.North;
          }
        }
      } else {
        //igual X
        if (srcY > dstY) {
          //NPC ESTA ABAJO
          if (this.canUserMove(srcX, srcY, Heading.North)) {
            //U
            return Heading.North;
          } else if (this.canUserMove(srcX, srcY, Heading.East)) {
            //R
            return Heading.East;
          } else if (this.canUserMove(srcX, srcY, Heading.West)) {
            //L
            return Heading.West;
          }
        } else {
          //NPC ESTA ARRIBA
          if (this.canUserMove(srcX, srcY, Heading.South)) {
            //ABA
            return Heading.South;
          } else if (this.canUserMove(srcX, srcY, Heading.East)) {
            //R
            return Heading.East;
          } else if (this.canUserMove(srcX, srcY, Heading.West)) {
            //L
            return Heading.West;
          }
        }
      }
    }
    const randomDirection: Heading = getRandomInteger(0, 3) as Heading;

    if (this.canUserMove(srcX, srcY, randomDirection)) {
      return randomDirection;
    }

    return null;
  }
}
