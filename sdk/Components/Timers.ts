import { DEFAULT_TIMERS } from "../Declares";

@Component("timers")
export class Timers extends ObservableComponent {
  @ObservableComponent.field canAttackInterval: number = DEFAULT_TIMERS.ATTACK;
  @ObservableComponent.field canThrowSpellInterval: number = DEFAULT_TIMERS.THROW_SPELL;
  @ObservableComponent.field canUseItemInterval: number = DEFAULT_TIMERS.USE_ITEM;
  @ObservableComponent.field canUseBowInterval: number = DEFAULT_TIMERS.USE_BOW;
  @ObservableComponent.field canWalkInterval: number = DEFAULT_TIMERS.WALK;

  private nowInSeconds = 0;

  nextAttack: number = 0;
  nextThrowSpell: number = 0;
  nextUseItem: number = 0;
  nextUseBow: number = 0;
  nextWalk: number = 0;

  update(now: number) {
    this.nowInSeconds = now;
  }

  canUseItem(): boolean {
    return this.nowInSeconds > this.nextUseItem;
  }

  canWalk(): boolean {
    return this.nowInSeconds > this.nextWalk;
  }

  canUseBow(): boolean {
    return this.nowInSeconds > this.nextUseBow;
  }

  canAttack(): boolean {
    return this.nowInSeconds > this.nextAttack;
  }

  canSpell(): boolean {
    return this.nowInSeconds > this.nextThrowSpell;
  }

  didUseItem(): void {
    this.nextUseItem = this.nowInSeconds + this.canUseItemInterval / 1000;
  }

  didWalk(): void {
    this.nextWalk = this.nowInSeconds + this.canWalkInterval / 1000;
  }

  didUseBow(): void {
    this.nextUseBow = this.nowInSeconds + this.canUseBowInterval / 1000;
  }

  didAttack(): void {
    this.nextAttack = this.nowInSeconds + this.canAttackInterval / 1000;
  }

  didSpell(): void {
    this.nextThrowSpell = this.nowInSeconds + this.canThrowSpellInterval / 1000;
  }
}
