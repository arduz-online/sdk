import { ObjectTypes, KnownSounds, PotionType, WeaponItem, HelmetItem, ArmorItem } from "../Declares";
import { Character } from "../Components/Character";
import { getEquipableSlotsForItem } from "../Balance";
import { Inventory, canEquip } from "../Components/Inventory";
import { CharUsesItem, MoveItems, charAttacksEntity } from "../Events/CharEvents";
import { isMeditating } from "../Components/Meditation";
import { requestTargetFor } from "../Components/RequestTarget";
import { getRandomFloat, getRandomInteger } from "../AtomicHelpers/Numbers";
import { entitiesInPosition } from "../Components/WorldPosition";
import { Timers } from "../Components/Timers";
import { getNakedBody } from "../Components/Body";
import { AutomaticEquip } from "../Components/AutomaticEquip";
import { ConsoleMessages, InventorySlots, TargetType } from "../Enums";

const MANA_RECOVERY_FACTOR = 5 / 100;

export class InventorySystem implements ISystem {
  active = false;

  automaticEquip = engine.getComponentGroup(AutomaticEquip);

  activate(engine: Engine) {
    engine.eventManager.addListener(CharUsesItem, this, this.useItem);
    engine.eventManager.addListener(MoveItems, this, this.handleMoveItems);
    // engine.eventManager.addListener(BaseEquipment, this, this.baseEquipment);
    log("InventorySystem started");
  }

  private useItem(event: CharUsesItem) {
    const { char, slot, x, y } = event;

    const inventory = char.getComponentOrNull(Inventory);
    if (!inventory) return;
    const invSlot = inventory.getItem(slot);

    const timers = char.getComponentOrNull(Timers);

    if (timers) {
      if (!timers.canUseItem()) {
        log("cancel USE due to timer");
        return;
      }
      timers.didUseItem();
    }

    if (!invSlot) {
      log("cancel USE, empty slot", InventorySlots[slot]);
      return;
    }

    if (isMeditating(char)) {
      char.sendConsoleMessage(ConsoleMessages["You can't use items while you are meditating!"]);
      return;
    }

    const body = char.body;

    if (body.dead) {
      char.sendConsoleMessage(ConsoleMessages["You can't use items while you are dead!"]);
      return;
    }

    const isTargetingFloor = typeof x !== "undefined" && typeof y !== "undefined";

    switch (invSlot.item.object_type) {
      case ObjectTypes.Weapon: {
        if (invSlot.item.projectile) {
          if (isTargetingFloor) {
            const arrowSlot = inventory.getItem(InventorySlots.Accessory);

            if (!arrowSlot || arrowSlot.amount <= 0) {
              char.sendConsoleMessage(ConsoleMessages["There are no equipped projectile!"]);
            } else {
              for (let entity of entitiesInPosition(x!, y!)) {
                if (entity instanceof Character) {
                  if (entity.body.dead) {
                    char.sendConsoleMessage(ConsoleMessages["You can't attack dead players!"]);
                  } else charAttacksEntity(char, entity, true);
                }
                break;
              }

              char.position.sendProjectile(char.position.x, char.position.y, x!, y!, 1, KnownSounds.SWING);

              inventory.removeItemFromSlot(InventorySlots.Accessory, 1);
            }
          } else {
            if (slot !== InventorySlots.LeftHand && slot !== InventorySlots.RightHand) {
              char.sendConsoleMessage(ConsoleMessages["You need to equip your weapon before using it!"]);
              return;
            }
            requestTargetFor(char, TargetType.Char, slot);
          }
        } else {
          char.sendConsoleMessage(ConsoleMessages["You can't use that weapon that way!"]);
        }

        break;
      }
      case ObjectTypes.Potion: {
        const stats = char.stats;

        switch (invSlot.item.potion_type) {
          case PotionType.Agility: {
            // use the item
            // TODO
            // char.addAbilityModifier(
            //   "agility", // TODO skills
            //   getRandomFloat(item.min_modifier, item.max_modifier),
            //   item.duration
            // );

            inventory.removeItemFromSlot(slot, 1);
            break;
          }
          case PotionType.Strenght: {
            // use the item
            // TODO
            // char.addAbilityModifier(
            //   "strength", // TODO skills
            //   getRandomFloat(item.min_modifier, item.max_modifier),
            //   item.duration
            // );
            inventory.removeItemFromSlot(slot, 1);
            break;
          }
          case PotionType.HP: {
            // use the item
            stats.minHp =
              stats.minHp + stats.maxHp * getRandomFloat(invSlot.item.min_modifier, invSlot.item.max_modifier);
            stats.minHp = Math.min(stats.minHp, stats.maxHp) | 0;
            inventory.removeItemFromSlot(slot, 1);
            break;
          }
          case PotionType.Mana: {
            // use the item
            stats.minMana = stats.minMana + stats.maxMana * MANA_RECOVERY_FACTOR;
            stats.minMana = Math.min(stats.minMana, stats.maxMana) | 0;
            inventory.removeItemFromSlot(slot, 1);
            break;
          }
          case PotionType.Poison: {
            // use the item
            // TODO
            // if (char.poisonedTimer) {
            //   char.poisonedTimer = 0;
            //   char.sendStatus();
            //   char.sendConsoleMessage(ConsoleMessages["You've been cured of poisoning!"]);
            // }
            inventory.removeItemFromSlot(slot, 1);
            break;
          }
          case PotionType.Suicide: {
            // use the item
            char.die();
            inventory.removeItemFromSlot(slot, 1);
            break;
          }
        }

        // sound
        if (invSlot.item.sound && invSlot.item.sound.length) {
          char.sendSound(invSlot.item.sound[getRandomInteger(0, invSlot.item.sound.length - 1)]);
        } else {
          char.sendSound(KnownSounds.DRINK);
        }

        break;
      }
    }
  }

  private findItem(char: Character, inventory: Inventory, toSlot: InventorySlots) {
    if (!inventory.getItem(toSlot)) {
      for (let [slot, item] of inventory.entries()) {
        item && item.item && this.handleMoveItems(new MoveItems(char, slot, toSlot, false));
      }
    }
  }

  private handleMoveItems(event: MoveItems) {
    const { char, from, to, sendMessages } = event;

    const inventory = char.getComponentOrNull(Inventory);

    if (!inventory) return;

    if (from === to) return;
    if (from === InventorySlots.NONE || to === InventorySlots.NONE) return;

    const fromItem = inventory.getItem(from);
    const toItem = inventory.getItem(to);

    // TODO: check max inv slot
    if (fromItem && toItem && from > InventorySlots.Slot16 && to <= InventorySlots.Slot16) {
      this.handleMoveItems(new MoveItems(char, to, from, sendMessages));
      return;
    }

    // 4x4 inventory
    if (from < InventorySlots.Slot16 && to < InventorySlots.Slot16) {
      this.moveItems(char, from, to);
      return;
    }

    // swap belt items
    if (
      (from === InventorySlots.Belt1 && to === InventorySlots.Belt2) ||
      (to === InventorySlots.Belt1 && from === InventorySlots.Belt2)
    ) {
      this.moveItems(char, from, to);
      return;
    }

    // trying to equip an item
    if (fromItem && to > InventorySlots.Slot16) {
      const possibleSlots = getEquipableSlotsForItem(fromItem.item);
      if (possibleSlots.has(to) && canEquip(char, fromItem.item, to, sendMessages)) {
        this.moveItems(char, from, to);
      }
      return;
    }

    // trying to unequip to empty position
    if (fromItem && !toItem && from > InventorySlots.Slot16 && to <= InventorySlots.Slot16) {
      this.moveItems(char, from, to);
      return;
    }

    log("handle move failed", InventorySlots[from], InventorySlots[to]);
  }

  refreshGraphics(char: Character) {
    const inventory = char.inventory;
    if (!inventory) return;
    const body = char.body;

    const leftHandItem = inventory.getItem(InventorySlots.LeftHand);
    body.isLeftHandWeapon = (leftHandItem && leftHandItem.item.object_type === ObjectTypes.Weapon) || false;
    body.leftHand = (leftHandItem && (leftHandItem.item as WeaponItem).animation) || 0;

    const rightHandItem = inventory.getItem(InventorySlots.RightHand);
    body.isRightHandWeapon = (rightHandItem && rightHandItem.item.object_type === ObjectTypes.Weapon) || false;
    body.rightHand = (rightHandItem && (rightHandItem.item as WeaponItem).animation) || 0;

    const helmetItem = inventory.getItem(InventorySlots.Head);
    body.helmet = (helmetItem && (helmetItem.item as HelmetItem).animation) || 0;

    const bodyItem = inventory.getItem(InventorySlots.Armor);
    body.body = (bodyItem && (bodyItem.item as ArmorItem).animation) || getNakedBody(body.gender, body.race);
  }

  private moveItems(char: Character, fromSlot: InventorySlots, toSlot: InventorySlots) {
    const inventory = char.getComponentOrNull(Inventory);

    if (!inventory) return;

    if (fromSlot === InventorySlots.NONE || toSlot === InventorySlots.NONE) return;
    // TODO: check max inv slot

    const fromItem = inventory.getItem(fromSlot);
    const toItem = inventory.getItem(toSlot);

    if (toItem) {
      inventory.setItem(fromSlot, toItem);
    } else {
      inventory.setItem(fromSlot, null);
    }

    if (toSlot === InventorySlots.LeftHand || toSlot === InventorySlots.RightHand) {
      if (fromItem && fromItem.item.object_type === ObjectTypes.Weapon) {
        char.sendSound(KnownSounds.EQUIP_WEAPON);
      }
    }

    if (fromItem) {
      inventory.setItem(toSlot, fromItem);
    } else {
      inventory.setItem(toSlot, null);
    }

    this.refreshGraphics(char);
  }

  private baseEquipment(char: Character) {
    const inv = char.getComponentOrNull(Inventory);

    if (!inv) return;
    // finds suitable items to max the equiped set
    this.findItem(char, inv, InventorySlots.LeftHand);
    this.findItem(char, inv, InventorySlots.RightHand);
    this.findItem(char, inv, InventorySlots.Armor);
    this.findItem(char, inv, InventorySlots.Accessory);
    this.findItem(char, inv, InventorySlots.Ring);
    this.findItem(char, inv, InventorySlots.Head);
    this.findItem(char, inv, InventorySlots.Belt1);
    this.findItem(char, inv, InventorySlots.Belt2);
  }

  update() {
    for (let entity of this.automaticEquip.entities.slice()) {
      this.baseEquipment(entity as Character);
      this.refreshGraphics(entity as Character);
      entity.removeComponent(AutomaticEquip);
    }
  }
}
