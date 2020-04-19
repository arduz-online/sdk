import {
  WeaponItem,
  KnownSounds,
  SheldItem,
  ObjectTypes,
  Ability,
} from "../Declares";
import { Character } from "../Components/Character";
import { getCharShield, getCharWeapon } from "../Functions/Helpers";
import {
  getClassModifier,
  getRaceModifier,
  userEvasion,
  userAccuracy,
} from "../Balance";
import { sendDamage } from "../Functions/combatHelpers";
import { CharAttacksChar } from "../Events/CharEvents";
import { getRandomInteger, getRandomFloat } from "../AtomicHelpers/Numbers";
import { Fx } from "../Components/Fx";
import { InventorySlots, ConsoleMessages } from "../Enums";

const HIT_CHANCE_BASE = 50;
const BLOOD_FX = 14;

export class CombatSystem implements ISystem {
  active: boolean = false;

  activate(engine: Engine) {
    engine.eventManager.addListener(
      CharAttacksChar,
      this,
      this.charAttacksChar
    );
    log("CombatSystem started");
  }

  private charImpactsChar(
    weapon: WeaponItem | null,
    attacker: Character,
    victim: Character
  ): boolean {
    const shield = getCharShield(victim);
    const victimModifiers = getClassModifier(victim.body.charClass);
    const attackerModifiers = getClassModifier(attacker.body.charClass);

    let successChances = 0;
    let victimEvasion = userEvasion(victim);
    let attackerDexterity = userAccuracy(attacker);

    if (shield) {
      victimEvasion += victimModifiers.shield;
    }

    if (weapon) {
      if (weapon.projectile) {
        attackerDexterity += attackerModifiers.range_dex;
      } else {
        attackerDexterity += attackerModifiers.melee_dex;
      }
    }

    successChances = HIT_CHANCE_BASE * (attackerDexterity / victimEvasion);

    if (getRandomInteger(1, 100) > successChances) {
      attacker.sendConsoleMessage("You miss the hit");

      if (weapon) {
        attacker.position.sendWeaponSwing(
          attacker,
          attacker.body.isLeftHandWeapon
            ? InventorySlots.LeftHand
            : InventorySlots.RightHand,
          KnownSounds.SWING
        );
      } else {
        attacker.position.sendWeaponSwing(
          attacker,
          InventorySlots.NONE,
          KnownSounds.SWING
        );
      }

      return false;
    } else if (shield) {
      const shieldChances =
        HIT_CHANCE_BASE *
        victimModifiers.shield *
        (shield.item as SheldItem).max_modifier;

      if (getRandomInteger(1, 100) > shieldChances) {
        // 'Se rechazo el ataque con el escudo
        attacker.sendConsoleMessage("The attack was rejected with a shield");
        attacker.position.sendWeaponSwing(
          victim,
          victim.body.isLeftHandWeapon
            ? InventorySlots.RightHand
            : InventorySlots.LeftHand,
          KnownSounds.SHIELD
        );

        return false;
      } else {
        return true;
      }
    } else {
      if (weapon && weapon.projectile) {
        attacker.position.sendWeaponSwing(
          attacker,
          attacker.body.isLeftHandWeapon
            ? InventorySlots.LeftHand
            : InventorySlots.RightHand,
          KnownSounds.IMPACT2
        );
      } else if (weapon) {
        attacker.position.sendWeaponSwing(
          attacker,
          attacker.body.isLeftHandWeapon
            ? InventorySlots.LeftHand
            : InventorySlots.RightHand,
          KnownSounds.IMPACT
        );
      } else {
        attacker.position.sendWeaponSwing(
          victim,
          InventorySlots.NONE,
          KnownSounds.IMPACT
        );
      }

      victim.getComponentOrCreate(Fx).set(BLOOD_FX, 1);

      return true;
    }
  }

  private charAttacksChar(event: CharAttacksChar) {
    const { attacker, victim, projectile } = event;

    if (attacker === victim) {
      attacker.sendConsoleMessage(
        ConsoleMessages["You can't attack yourself!"]
      );
      return;
    }

    if (attacker.body.dead) {
      return;
    }

    if (!(victim instanceof Character)) {
      attacker.sendConsoleMessage("You can only attack characters!");
      return;
    }

    if (victim.body.dead) {
      attacker.sendConsoleMessage(
        ConsoleMessages["You can't attack dead characters!"]
      );
      return;
    }

    const timers = attacker.timers;

    if (!timers.canUseBow(false)) {
      return;
    }

    if (timers.canSkillAttack()) {
      return;
    }

    // TODO: check distance
    // TODO: check interval

    let absorbedDamage = 0;

    const weapon = getCharWeapon(attacker);

    if (weapon && weapon.projectile != projectile) {
      attacker.sendConsoleMessage(
        ConsoleMessages["You can't use that weapon that way!"]
      );
      return;
    }

    if (!this.charImpactsChar(weapon, attacker, victim)) {
      return;
    }

    let damage = this.calculateDamage(weapon, attacker, victim);
    const resist = (damage.weapon && damage.weapon.reinforcement) || 0;

    const partOfBody = getRandomInteger(1, 6); // 1 == head

    if (partOfBody === 1 /*head*/) {
      const helmet =
        victim.inventory && victim.inventory.getItem(InventorySlots.Head);

      if (helmet && helmet.item.object_type == ObjectTypes.Helmet) {
        absorbedDamage = getRandomFloat(
          helmet.item.min_defense,
          helmet.item.max_defense
        );
        absorbedDamage = absorbedDamage - resist;
        damage.damage = damage.damage - absorbedDamage;

        if (damage.damage < 1) damage.damage = 1;
      }
    } else {
      const armor =
        victim.inventory && victim.inventory.getItem(InventorySlots.Armor);

      const shield = getCharShield(victim);

      if (armor && armor.item.object_type == ObjectTypes.Armor) {
        if (shield && shield.item.object_type == ObjectTypes.Shield) {
          absorbedDamage = getRandomFloat(
            armor.item.min_defense + shield.item.min_defense,
            armor.item.max_defense + shield.item.max_defense
          );
        } else {
          absorbedDamage = getRandomFloat(
            armor.item.min_defense,
            armor.item.max_defense
          );
        }

        absorbedDamage = absorbedDamage - resist;
        damage.damage = damage.damage - absorbedDamage;

        if (damage.damage < 1) damage.damage = 1;
      }
    }

    damage.damage = damage.damage | 0;

    // TODO: send the console messages to both parties
    sendDamage(attacker, victim, damage.damage);
  }

  private calculateDamage(
    weapon: WeaponItem | null,
    attacker: Character,
    victim: Character
  ) {
    const attackerClassModifiers = getClassModifier(attacker.body.charClass);
    const attackerRaceModifiers = getRaceModifier(attacker.body.race);

    let weaponTypeModifier = 0;
    let weaponDamage = 0;

    // dagger=dex, wrestling=str
    let typeModifier: Ability = "dexterity";

    if (!weapon) {
      typeModifier = "strength";
      weaponTypeModifier = attackerClassModifiers.melee_dmg;
    } else {
      typeModifier = "dexterity";
      if (weapon.projectile) {
        weaponTypeModifier = attackerClassModifiers.range_dmg;

        weaponDamage = getRandomFloat(weapon.min_hit, weapon.max_hit);

        const projectile =
          attacker.inventory &&
          attacker.inventory.getItem(InventorySlots.Accessory);

        if (projectile && projectile.item.object_type === ObjectTypes.Arrows) {
          weaponDamage =
            weaponDamage +
            getRandomFloat(projectile.item.min_hit, projectile.item.max_hit);
        }
      } else {
        weaponTypeModifier = attackerClassModifiers.melee_dmg;
        weaponDamage = getRandomFloat(weapon.min_hit, weapon.max_hit);
      }
    }

    const abilityModifier =
      attackerRaceModifiers[typeModifier] *
      attacker.stats.getAbilityMultiplier(typeModifier);

    // const tmpDamage = getRandomInteger(attacker.minHit, attacker.maxHit);
    // TODO skills

    return {
      damage: (10 * abilityModifier * weaponDamage * weaponTypeModifier) | 0,
      weapon,
    };
  }
}
