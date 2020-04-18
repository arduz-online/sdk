import { Skill } from "../Declares";
import { CharStats } from "./Stats";
import { Character } from "./Character";
import { isMeditating } from "./Meditation";
import { isSkillSlot } from "../AtomicHelpers/Slots";
import { SkillSlots, HotBarSlots } from "../Enums";

@Component("Skills")
export class Skills extends ObservableComponent {
  @ObservableComponent.field
  skills: Readonly<Record<string, Skill | null>> = {} as any;

  getItem(slot: SkillSlots | HotBarSlots): Skill | null {
    return this.skills[slot] || null;
  }

  setItem(slot: SkillSlots | HotBarSlots, skill: Skill | null): void {
    this.skills = { ...this.skills, [slot]: skill };
    this.dirty = true;
  }

  clear(): void {
    this.skills = {} as any;
  }

  enoughManaFor(slot: number, stats: CharStats) {
    const isSpell = isSkillSlot(slot);

    if (isSpell) {
      const spell = this.getItem(slot);
      if (spell) {
        return stats.minMana >= spell.required_mana;
      }
    }
    return false;
  }

  handleMoveSpells(fromSlot: SkillSlots | HotBarSlots, toSlot: SkillSlots | HotBarSlots) {
    if (fromSlot === SkillSlots.NONE || toSlot === SkillSlots.NONE) return;

    if (!isSkillSlot(fromSlot)) return;
    if (!isSkillSlot(toSlot)) return;

    const fromItem = this.getItem(fromSlot);
    const toItem = this.getItem(toSlot);

    this.skills = { ...this.skills, [toSlot]: fromItem, [fromSlot]: toItem };
  }

  *entries(): Iterable<[SkillSlots | HotBarSlots, Skill]> {
    for (let i in this.skills) {
      const item = this.skills[(i as any) as SkillSlots | HotBarSlots];
      if (item) yield [+i, item];
    }
  }
}

export function canCastSpell(caster: Character, spell: Skill): boolean {
  if (caster.body.dead) {
    caster.sendConsoleMessage("You can't cast spells while you are dead!");
  } else if (isMeditating(caster)) {
    caster.sendConsoleMessage("You can't cast spells while you are meditating!");
  } else if (spell.required_mana > caster.stats.minMana) {
    caster.sendConsoleMessage("Insufficient mana!");
  } else {
    return true;
  }
  return false;
}
