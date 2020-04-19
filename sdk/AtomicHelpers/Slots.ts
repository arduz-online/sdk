import { HotBarSlots, SkillSlots, InventorySlots } from "../Enums";

export function isSkillSlot(slot: number): boolean {
  return (
    (slot >= HotBarSlots.HotBar1 && slot <= HotBarSlots.HotBar5) ||
    (slot >= SkillSlots.Spell1 && slot <= SkillSlots.Spell11)
  );
}

export function canDrop(originSlot: number, targetSlot: number): boolean {
  if (targetSlot === InventorySlots.NONE) return false;
  if (originSlot === InventorySlots.NONE) return false;
  return isSkillSlot(originSlot) === isSkillSlot(targetSlot);
}
