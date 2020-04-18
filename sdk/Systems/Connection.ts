import {
  Connection,
  sendMessageObservable,
  closeConnectionObservable,
  onMessageObservable,
} from "../Components/Connection";
import type { IncomingMessages, OutgoingMessages } from "@arduz/Connections";
import { Character } from "../Components/Character";
import { charUsesItem, charMoveItems } from "../Events/CharEvents";
import {
  handleMapClick,
  handleAttack,
  handleUseSkill,
  handleMeditate,
  handleTalk,
  handleSetHeading,
  handleWalk,
} from "../Functions/networkHandlers";
import { Skills } from "../Components/Skills";
import { Inventory } from "../Components/Inventory";
import { CharStats } from "../Components/Stats";
import { Archetypes } from "../Components/Archetype";
import { Timers } from "../Components/Timers";
import { RequestedTarget } from "../Components/RequestTarget";

/**
 * @public
 */
export class ConnectionSystem implements ISystem {
  handlerMap: { [connectionId: string]: Connection } = {};

  private connectionAdded = (entity: IEntity) => {
    this.updatePlayerStats(entity);

    const component = entity.getComponentOrNull(Connection);

    if (component instanceof Connection) {
      this.handlerMap[component.connectionId] = component;
      component.entityId = entity.uuid;
    }
  };
  private connectionRemoved = (entity: IEntity) => {
    const component = entity.getComponentOrNull(Connection);

    if (component instanceof Connection) {
      delete this.handlerMap[component.connectionId];
    }
  };

  connections!: ComponentGroup;

  constructor(public connection: typeof import("@arduz/Connections")) {}

  activate(engine: Engine) {
    engine.eventManager.addListener(ComponentAdded, this, this.componentAdded);
    engine.eventManager.addListener(ComponentRemoved, this, this.componentRemoved);

    this.connection.onMessage.add((m) => {
      for (let i in m) {
        const connectionId = m[i as keyof IncomingMessages]!.connectionId;
        if (connectionId) {
          const conn = this.handlerMap[connectionId];
          if (conn && conn.entityId) {
            const entity = engine.entities[conn.entityId!];
            if (entity) {
              onMessageObservable.notifyObservers({ entity: entity as Entity, data: m });
            }
          } else {
            log("Unknown entity in connection", connectionId);
          }
        }
      }
    });

    sendMessageObservable.add((evt) => {
      this.connection.send(evt.connectionIds, evt.data, evt.reliable);
    });

    closeConnectionObservable.add((evt) => {
      this.connection.disconnect(evt.connectionId, "closed manually");
    });

    onMessageObservable.add(({ entity, data }) => {
      if (entity instanceof Character) {
        if (data.UseItem) {
          charUsesItem(entity, data.UseItem.slot);
        }
        if (data.UseSkill) {
          handleUseSkill(entity, data.UseSkill.slot);
        }

        if (data.Walk) {
          handleWalk(entity, data.Walk.heading);
        }

        if (data.MoveItem) {
          charMoveItems(entity, data.MoveItem.from, data.MoveItem.to, false);
        }

        if (data.ClickMap) {
          handleMapClick(entity, data.ClickMap.x, data.ClickMap.y);
        }

        if (data.Attack) {
          handleAttack(entity);
        }

        // if (data.Hide) {
        //   handleHide(entity);
        // }

        if (data.Meditate) {
          handleMeditate(entity);
        }

        if (data.Talk) {
          handleTalk(entity, data.Talk.text);
        }

        if (data.SetHeading) {
          handleSetHeading(entity, data.SetHeading.heading);
        }
      }
    });

    this.connections = engine.getComponentGroup(
      {
        onAddEntity: this.connectionAdded,
        onRemoveEntity: this.connectionRemoved,
      },
      Connection
    );

    log("ConnectionSystem started", this.connections);
  }

  update() {
    for (let entity of this.connections.entities) {
      const data = this.updatePlayerStats(entity);
      const connection = data && entity.getComponent(Connection);
      if (data) {
        sendMessageObservable.notifyObservers({ connectionIds: [connection!.connectionId], data });
      }
    }
  }

  private updatePlayerStats(entity: IEntity): Partial<OutgoingMessages> | null {
    let hasContent = false;
    const ret: Partial<OutgoingMessages> = {};

    const skills = entity.getComponentOrNull(Skills);
    const inv = entity.getComponentOrNull(Inventory);
    const stats = entity.getComponentOrNull(CharStats);
    const archetypes = entity.getComponentOrNull(Archetypes);
    const timers = entity.getComponentOrNull(Timers);
    const reqTarget = entity.getComponentOrNull(RequestedTarget);

    if (stats && stats.dirty) {
      ret.Stats = {
        entityId: entity.uuid,
        maxHp: stats.maxHp,
        minHp: stats.minHp,
        maxMana: stats.maxMana,
        minMana: stats.minMana,
      };
      stats.dirty = false;
      hasContent = true;
    }

    if (inv && inv.dirty) {
      ret.Inventory = {
        items: Array.from(inv.entries()).map(([slot, item]) => {
          return {
            slot,
            amount: item.amount,
            item: {
              grh: item.item.grh,
              id: item.item.id,
              name: item.item.name,
            },
          };
        }),
      };
      inv.dirty = false;
      hasContent = true;
    }
    if (timers && timers.dirty) {
      ret.Timers = {
        canAttackInterval: timers.canAttackInterval,
        canThrowSpellInterval: timers.canThrowSpellInterval,
        canUseBowInterval: timers.canUseBowInterval,
        canUseItemInterval: timers.canUseItemInterval,
      };
      timers.dirty = false;
      hasContent = true;
    }

    if (skills && skills.dirty) {
      ret.Skills = {
        skills: Array.from(skills.entries()).map(([slot, skill]) => {
          return {
            slot,
            description: skill.description,
            graphic: skill.graphic,
            id: skill.id,
            name: skill.name,
          };
        }),
      };
      skills.dirty = false;
      hasContent = true;
    }

    if (archetypes && archetypes.dirty) {
      ret.Archetypes = {
        alignments: archetypes.alignments.map(($) => ({
          color: $.color,
          id: $.id,
          name: $.name,
        })),
        archetypes: Object.values(archetypes.archetypes),
      };
      archetypes.dirty = false;
      hasContent = true;
    }

    if (reqTarget && reqTarget.dirty) {
      ret.RequestedTarget = {
        distance: reqTarget.distance,
        range: reqTarget.range,
        slot: reqTarget.slot,
        type: reqTarget.type,
      };
      reqTarget.dirty = false;
      hasContent = true;
    }

    return hasContent ? ret : null;
  }

  deactivate() {
    // noop
  }

  private componentAdded(event: ComponentAdded) {
    if (event.entity.isAddedToEngine()) {
      const component = event.entity.components[event.componentName];

      if (component instanceof Connection) {
        this.handlerMap[component.connectionId] = component;
        component.entityId = event.entity.uuid;
      }
    }
  }

  private componentRemoved(event: ComponentRemoved) {
    if (event.entity.isAddedToEngine()) {
      if (event.component instanceof Connection) {
        delete this.handlerMap[event.component.connectionId];
      }
    }
  }
}
