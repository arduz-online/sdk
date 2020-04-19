import { DEFAULT_TIMERS } from "../Declares";

@Component("timers")
export class Timers extends ObservableComponent {
  @ObservableComponent.field canAttackInterval: number = DEFAULT_TIMERS.ATTACK;
  @ObservableComponent.field canThrowSpellInterval: number =
    DEFAULT_TIMERS.THROW_SPELL;
  @ObservableComponent.field canUseItemInterval: number =
    DEFAULT_TIMERS.USE_ITEM;
  @ObservableComponent.field canUseBowInterval: number = DEFAULT_TIMERS.USE_BOW;
  @ObservableComponent.field canWalkInterval: number = DEFAULT_TIMERS.WALK;
  @ObservableComponent.field attackSkillInterval: number =
    DEFAULT_TIMERS.ATTACK_SPELL;
  @ObservableComponent.field skillAttackInterval: number =
    DEFAULT_TIMERS.SPELL_ATTACK;

  private nowInMs = 0;

  private lastAttack: number = 0;
  private lastThrowSpell: number = 0;
  private lastUseItem: number = 0;
  private lastUseBow: number = 0;
  private lastWalk: number = 0;
  private lastAttackSkill: number = 0;
  private lastSkillAttack: number = 0;

  update(nowInMs: number) {
    this.nowInMs = nowInMs;
  }

  canUseItem(update: boolean = true): boolean {
    const can = this.nowInMs - this.lastUseItem >= this.canUseItemInterval;
    if (can && update) {
      this.lastUseItem = this.nowInMs;
    }
    return can;
  }

  canWalk(update: boolean = true): boolean {
    const can = this.nowInMs - this.lastWalk >= this.canWalkInterval;
    if (can && update) {
      this.lastWalk = this.nowInMs;
    }
    return can;
  }

  canUseBow(update: boolean = true): boolean {
    const can = this.nowInMs - this.lastUseBow >= this.canUseBowInterval;
    if (can && update) {
      this.lastUseBow = this.nowInMs;
    }
    return can;
  }

  canAttack(update: boolean = true): boolean {
    const can = this.nowInMs - this.lastAttack >= this.canAttackInterval;
    if (can && update) {
      this.lastAttack = this.nowInMs;
    }
    return can;
  }

  canSpell(update: boolean = true): boolean {
    const can =
      this.nowInMs - this.lastThrowSpell >= this.canThrowSpellInterval;
    if (can && update) {
      this.lastThrowSpell = this.nowInMs;
    }
    return can;
  }

  canAttackSkill(update: boolean = true): boolean {
    if (this.lastAttackSkill > this.lastThrowSpell) return false;

    const can = this.nowInMs - this.lastAttackSkill >= this.attackSkillInterval;
    if (can && update) {
      this.lastAttackSkill = this.nowInMs;
      this.lastThrowSpell = this.nowInMs;
    }
    return can;
  }

  canSkillAttack(update: boolean = true): boolean {
    if (this.lastSkillAttack > this.lastAttack) return false;

    const can = this.nowInMs - this.lastSkillAttack >= this.skillAttackInterval;
    if (can && update) {
      this.lastSkillAttack = this.nowInMs;
      this.lastAttack = this.nowInMs;
    }
    return can;
  }
}
