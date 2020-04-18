import { Ability } from "../Declares";

@Component("Stats")
export class CharStats extends ObservableComponent {
  @ObservableComponent.field
  minHp: number = 0;
  @ObservableComponent.field
  maxHp: number = 0;

  @ObservableComponent.field
  minMana: number = 0;
  @ObservableComponent.field
  maxMana: number = 0;

  maxHit: number = 1;
  minHit: number = 1;

  getAbilityMultiplier(ability: Ability): number {
    // const modified = this.effectTimer !== 0 ? this.modifiedAbilities.get(ability) || 1 : 1;
    // return (this.abilities.get(ability) || 0) + modified;
    throw new Error();
  }

  addAbilityModifier(ability: Ability, value: number, duration: number) {
    // TODO skills
    // const currentAbility = this.abilities.get(ability) || 0;
    // const currentModifiedValue = this.modifiedAbilities.get(ability) || 0;
    // this.effectTimer = performance.now() + Math.max(duration, this.effectTimer);
    // this.modifiedAbilities.set(
    // ability,
    // Math.min(currentAbility * 2, Math.min(value + currentModifiedValue, MAX_ABILITY))
    // );
    // this.sendStatus();
    throw new Error();
  }
}
