import { WeaponItem, ObjectTypes } from "../Declares";
import { Character } from "../Components/Character";
import { Archetypes } from "../Components/Archetype";
import { Inventory } from "../Components/Inventory";
import { Skills } from "../Components/Skills";
import { Body } from "../Components/Body";
import { CharStats } from "../Components/Stats";
import { isSkillSlot } from "../AtomicHelpers/Slots";
import { InventorySlots } from "../Enums";

export function canDrop(originSlot: number, targetSlot: number): boolean {
  if (targetSlot === InventorySlots.NONE) return false;
  if (originSlot === InventorySlots.NONE) return false;
  return isSkillSlot(originSlot) === isSkillSlot(targetSlot);
}

export function getCharWeapon(char: Character) {
  let leftOrRight: InventorySlots.NONE | InventorySlots.LeftHand | InventorySlots.RightHand = InventorySlots.NONE;

  if (char.body.isLeftHandWeapon && char.body.isRightHandWeapon) {
    leftOrRight = Math.random() > 0.5 ? InventorySlots.LeftHand : InventorySlots.RightHand;
  } else if (char.body.isLeftHandWeapon) {
    leftOrRight = InventorySlots.LeftHand;
  } else if (char.body.isRightHandWeapon) {
    leftOrRight = InventorySlots.RightHand;
  }

  const weapon = char.inventory && char.inventory.getItem(leftOrRight);

  if (leftOrRight !== InventorySlots.NONE && weapon) {
    return weapon.item as WeaponItem;
  }

  return null;
}

export function getCharShield(char: Character) {
  let leftOrRight: InventorySlots.NONE | InventorySlots.LeftHand | InventorySlots.RightHand = InventorySlots.NONE;

  if (char.body.isLeftHandWeapon && char.body.isRightHandWeapon) {
    leftOrRight = InventorySlots.NONE;
  } else if (char.body.isLeftHandWeapon) {
    leftOrRight = InventorySlots.RightHand;
  } else if (char.body.isRightHandWeapon) {
    leftOrRight = InventorySlots.LeftHand;
  }

  const shield = char.inventory && char.inventory.getItem(leftOrRight);

  if (leftOrRight !== InventorySlots.NONE && shield && shield.item.object_type === ObjectTypes.Shield) {
    return shield;
  }

  return null;
}

export function loadCharacterFromArchetype(char: IEntity, id: string) {
  const arch = char.getComponentOrNull(Archetypes);

  if (!arch) return;

  const description = arch.getArchetype(id);

  if (!description) return;

  const inv = char.getComponentOrCreate(Inventory);
  const skills = char.getComponentOrCreate(Skills);
  const body = char.getComponentOrCreate(Body);
  const stats = char.getComponentOrCreate(CharStats);

  if (char instanceof Character) {
    char.resetFlags();
    char.die();
  }

  body.nick = description.nick || body.nick || "Character";
  body.charClass = description.charClass;
  body.head = description.head;
  body.race = description.race;
  body.charClass = description.charClass;
  body.body = description.body;
  body.gender = description.gender;

  stats.minHp = description.minHp;
  stats.maxHp = description.maxHp;
  stats.minMana = description.minMana;
  stats.maxMana = description.maxMana;
  inv.clear();
  // Set the new inventory
  const invSlots: number[] = [];
  description.inventory.forEach(($) => {
    // TODO: validate slot
    if (!isSkillSlot($.slot)) {
      inv.setItem($.slot, { ...$ });
      invSlots.push($.slot);
    }
  });

  // Set the new inventory
  const spellSlots: number[] = [];
  description.skills.forEach(($) => {
    // TODO: validate slot
    if (isSkillSlot($.slot)) {
      skills.setItem($.slot, $.skill);
      spellSlots.push($.slot);
    }
  });
}
