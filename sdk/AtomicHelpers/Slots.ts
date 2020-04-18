import { HotBarSlots, SkillSlots } from "../Enums";

export function isSkillSlot(slot: number): boolean {
  return (
    (slot >= HotBarSlots.HotBar1 && slot <= HotBarSlots.HotBar5) ||
    (slot >= SkillSlots.Spell1 && slot <= SkillSlots.Spell11)
  );
}
