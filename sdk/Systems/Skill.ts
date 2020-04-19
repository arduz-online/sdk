import { Skill, SkillTarget, ObjectTypes } from "../Declares";
import { getCharWeapon } from "../Functions/Helpers";
import { Character } from "../Components/Character";
import { sendDamage } from "../Functions/combatHelpers";
import { Skills, canCastSpell } from "../Components/Skills";
import { stopMeditating, isMeditating } from "../Components/Meditation";
import { setInvisible, setVisible } from "../Components/Invisible";
import { setParalyzed, setFree } from "../Components/Paralysis";
import { CharUsesSkill } from "../Events/CharEvents";
import { getRandomInteger } from "../AtomicHelpers/Numbers";
import { entitiesInPosition } from "../Components/WorldPosition";
import { Fx } from "../Components/Fx";
import { Mimetism } from "../Components/Mimetism";
import { InventorySlots, CharClass } from "../Enums";

export class SkillSystem implements ISystem {
  activate(engine: Engine) {
    engine.eventManager.addListener(CharUsesSkill, this, this.useSkill);
    log("SkillSystem started");
  }

  private useSkill(event: CharUsesSkill) {
    const { char, slot, x, y } = event;

    const skills = char.getComponentOrNull(Skills);

    if (isMeditating(char)) return;

    if (skills) {
      const spell = skills.getItem(slot);

      if (spell) {
        if (canCastSpell(char, spell)) {
          if (spell.target === SkillTarget.Terrain) {
            this.doTerrainSpell(char, x, y, spell);
          } else {
            let didAttack = false;

            for (let entity of entitiesInPosition(x, y)) {
              if (entity instanceof Character) {
                this.doCharacterSpell(char, entity, spell);
                didAttack = true;
                break;
              }
            }

            if (!didAttack) {
              char.sendConsoleMessage("Invalid target!");
            }
          }
        }
      }
    }
  }

  private spellCasterEffect(caster: Character, spell: Skill) {
    const stats = caster.stats;

    stats.minMana = Math.max(stats.minMana - spell.required_mana, 0) | 0;

    caster.sayMagicWords(spell.spell);
    caster.sendSound(spell.sound);
  }

  private doTerrainSpell(
    caster: Character,
    x: number,
    y: number,
    spell: Skill
  ) {
    if (!canCastSpell(caster, spell)) return;

    this.spellCasterEffect(caster, spell);
  }

  private doCharacterSpell(
    casterChar: Character,
    victimChar: Character,
    spell: Skill
  ) {
    if (!canCastSpell(casterChar, spell)) return;

    const requiresAliveTarget = !spell.resuscitates;
    const isAttackSpell =
      spell.increase_hp == -1 ||
      spell.increase_mana == -1 ||
      spell.makes_paralized ||
      spell.makes_still ||
      spell.makes_poison ||
      spell.makes_dumb;

    if (victimChar.body.dead && requiresAliveTarget) {
      casterChar.sendConsoleMessage("The target is dead!");
      return;
    }

    if (isAttackSpell && casterChar === victimChar) {
      casterChar.sendConsoleMessage("You can't attack yourself!");
      return;
    }

    if (victimChar.body.dead && spell.resuscitates) {
      victimChar.resucitate(false);
      victimChar.sendConsoleMessage("{{caster}} resucitated you!", {
        caster: casterChar.body.nick,
      });
      casterChar.sendConsoleMessage("You resucitated {{victim}}!", {
        victim: victimChar.body.nick,
      });
    }

    if (spell.makes_invisible) {
      setInvisible(victimChar);

      victimChar.sendConsoleMessage("{{caster}} made you invisible!", {
        caster: casterChar.body.nick,
      });
      casterChar.sendConsoleMessage("You made {{victim}} invisible!", {
        victim: victimChar.body.nick,
      });
    }

    if (spell.makes_paralized || spell.makes_still) {
      setParalyzed(victimChar);
      victimChar.sendConsoleMessage("{{caster}} paralyzed you!", {
        caster: casterChar.body.nick,
      });
      casterChar.sendConsoleMessage("You paralyzed {{victim}}!", {
        victim: victimChar.body.nick,
      });
    }

    // if (spell.makes_blind && victim. != 0) {
    //   victim.poisonedTimer = -1;
    // }

    if (spell.removes_paralysis) {
      if (setFree(victimChar)) {
        victimChar.sendConsoleMessage("{{caster}} removed your paralysis!", {
          caster: casterChar.body.nick,
        });
        casterChar.sendConsoleMessage("You removed {{victim}} paralysis!", {
          victim: victimChar.body.nick,
        });
      }
    }

    if (spell.removes_invisibility) {
      if (setVisible(victimChar)) {
        victimChar.sendConsoleMessage("{{caster}} removed your invisibility!", {
          caster: casterChar.body.nick,
        });
        casterChar.sendConsoleMessage("You made {{victim}} visible!", {
          victim: victimChar.body.nick,
        });
      }
    }

    if (spell.increase_hp == 1) {
      const d = getRandomInteger(spell.min_hp, spell.max_hp);
      victimChar.sendConsoleMessage("{{caster}} healed you by {d} points!", {
        d: d.toString(),
        caster: casterChar.body.nick,
      });
      casterChar.sendConsoleMessage("You healed {{victim}}!", {
        victim: victimChar.body.nick,
      });
      victimChar.stats.minHp = Math.min(
        victimChar.stats.minHp + d,
        victimChar.stats.maxHp
      );
    } else if (spell.increase_hp == -1) {
      const casterInventory = casterChar.inventory;
      const victimInventory = victimChar.inventory;

      const casterRing =
        casterInventory && casterInventory.getItem(InventorySlots.Ring);
      const victimRing =
        victimInventory && victimInventory.getItem(InventorySlots.Ring);
      const victimHelmet =
        victimInventory && victimInventory.getItem(InventorySlots.Head);

      let damage = getRandomInteger(spell.min_hp, spell.max_hp);

      if (casterChar.body.charClass === CharClass.Mage) {
        const weapon = getCharWeapon(casterChar);
        if (weapon) {
          damage *= 1 + weapon.staff_damage_bonus;
        }
      }

      if (casterRing && casterRing.item.object_type == ObjectTypes.Ring) {
        damage *= 1 + casterRing.item.staff_damage_bonus;
      }

      if (victimRing && victimRing.item.object_type == ObjectTypes.Ring) {
        damage -=
          damage *
          getRandomInteger(
            victimRing.item.min_magical_defense,
            victimRing.item.max_magical_defense
          );
      }

      if (victimHelmet && victimHelmet.item.object_type == ObjectTypes.Helmet) {
        damage -=
          damage *
          getRandomInteger(
            victimHelmet.item.min_magical_defense,
            victimHelmet.item.max_magical_defense
          );
      }

      damage = Math.max(damage, 0);

      sendDamage(casterChar, victimChar, damage);
    }

    if (spell.increase_mana == 1) {
      const d = getRandomInteger(spell.min_mana, spell.max_mana);
      victimChar.sendConsoleMessage(
        "{{caster}} increased your mana by {d} points!",
        { d: d.toString() }
      );
      victimChar.stats.minMana = Math.min(
        victimChar.stats.minMana + d,
        victimChar.stats.maxMana
      );
    } else if (spell.increase_mana == -1) {
      const d = getRandomInteger(spell.min_mana, spell.max_mana);
      victimChar.sendConsoleMessage("{{caster}} took {d} mana from you!", {
        d: d.toString(),
      });
      victimChar.stats.minMana = Math.max(victimChar.stats.minMana - d, 0);
    }

    stopMeditating(victimChar);

    if (spell.mimetism) {
      casterChar.body.mimetism = victimChar.body;
      casterChar.getComponentOrCreate(Mimetism).restart();
      victimChar.sendConsoleMessage("{{caster}} mimetized with you!", {
        caster: casterChar.body.nick,
      });
      casterChar.sendConsoleMessage(
        "You stole the aparience from {{victim}}!",
        { victim: victimChar.body.nick }
      );
    }

    this.spellCasterEffect(casterChar, spell);

    if (spell.fx) {
      victimChar.getComponentOrCreate(Fx).set(spell.fx, 1);
    }
  }
}
