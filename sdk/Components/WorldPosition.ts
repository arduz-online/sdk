import type { OutgoingMessages } from "@arduz/Connections";
import { Body } from "./Body";
import { InventorySlots } from "../Enums";

@Component("Position")
export class WorldPosition extends ObservableComponent {
  @ObservableComponent.field x: number = 1;
  @ObservableComponent.field y: number = 1;

  outgoingAreaMessages: Array<Partial<OutgoingMessages>> = [];
  outgoingAreaButMeMessages: Array<Partial<OutgoingMessages>> = [];

  enqueueSendToAreaButMe(data: Partial<OutgoingMessages>) {
    this.outgoingAreaButMeMessages.push(data);
  }

  enqueueSendToArea(data: Partial<OutgoingMessages>) {
    this.outgoingAreaMessages.push(data);
  }

  sendHit(x: number, y: number, text: string, color: number) {
    this.enqueueSendToArea({ Hit: { x, y, text, color } });
  }

  sendWeaponSwing(entity: Entity, weaponSlot: InventorySlots, sound: number) {
    this.enqueueSendToArea({
      WeaponSwing: {
        entityId: entity.uuid,
        weaponSlot,
        sound,
      },
    });
  }

  sendSound(x: number, y: number, sound: number) {
    this.enqueueSendToArea({
      Sound: {
        x,
        y,
        sound,
      },
    });
  }

  sendProjectile(x: number, y: number, destX: number, destY: number, graphic: number, sound: number) {
    this.enqueueSendToArea({
      Projectile: {
        x,
        y,
        destX,
        destY,
        graphic,
        sound,
      },
    });
  }
}

const entitiesWithPosition = engine.getComponentGroup(WorldPosition);

export function* entitiesInPosition(x: number, y: number) {
  for (let entity of entitiesWithPosition.entities) {
    const pos = entity.getComponentOrNull(WorldPosition);
    if (pos && pos.x == x && pos.y == y) {
      yield entity;
    }
  }
}

const entitiesWithPositionAndBodyAndPosition = engine.getComponentGroup(WorldPosition, Body);

export function entitiesWithBodyAndPosition() {
  return entitiesWithPositionAndBodyAndPosition.entities;
}
