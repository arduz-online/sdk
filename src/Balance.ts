import {
  Skill,
  ItemLike,
  ObjectTypes,
  PotionType,
  ClassModifierRecord,
  RaceModifierRecord,
  CalculatedRecord,
} from "./Declares";
import { Character } from "./Components/Character";
import { CharClass, Race, InventorySlots } from "./Enums";

const classModifier: Map<number, ClassModifierRecord> = new Map();
const raceModifier: Map<number, RaceModifierRecord> = new Map();
const calculatedBalance: CalculatedRecord[] = [];

const defaultClassModifier: ClassModifierRecord = {
  agility: 1,
  dexterity: 1,
  melee_dex: 1,
  melee_dmg: 1,
  range_dex: 1,
  range_dmg: 1,
  shield: 1,
  vitality: 1,
  will: 1,
};

const defaultRaceModifier: RaceModifierRecord = {
  agility: 1,
  dexterity: 1,
  vitality: 1,
  will: 1,
  strength: 1,
};

const baseCalculated: CalculatedRecord = {
  accuracy: 1,
  class: 1,
  evasion: 1,
  health_points: 200,
  race: 1,
};

export function getClassModifier(charClass: CharClass): ClassModifierRecord {
  return classModifier.get(charClass) || defaultClassModifier;
}

export function getRaceModifier(race: Race): RaceModifierRecord {
  return raceModifier.get(race) || defaultRaceModifier;
}

export function findCalculatedBalance(charClass: CharClass, race: Race): CalculatedRecord {
  for (let i = 0; i < calculatedBalance.length; i++) {
    const balance = calculatedBalance[i];
    if (balance.class === charClass && balance.race === race) {
      return balance;
    }
  }
  return baseCalculated;
}

export function userEvasion(user: Character): number {
  // TODO: this can be faster
  return (
    findCalculatedBalance(user.body.charClass, user.body.race).evasion * user.stats.getAbilityMultiplier("agility")
  );
}

export function userAccuracy(user: Character): number {
  // TODO: this can be faster
  return (
    findCalculatedBalance(user.body.charClass, user.body.race).accuracy * user.stats.getAbilityMultiplier("dexterity")
  );
}

function normalizeSpell(skill: Skill): Skill {
  skill.makes_invisible = !!skill.makes_invisible;
  skill.makes_paralized = !!skill.makes_paralized;
  skill.makes_still = !!skill.makes_still;
  skill.removes_paralysis = !!skill.removes_paralysis;
  skill.removes_dumb = !!skill.removes_dumb;
  skill.removes_invisibility = !!skill.removes_invisibility;
  skill.heals_poison = !!skill.heals_poison;
  skill.makes_poison = !!skill.makes_poison;
  skill.resuscitates = !!skill.resuscitates;
  skill.makes_blind = !!skill.makes_blind;
  skill.makes_dumb = !!skill.makes_dumb;
  skill.summons = !!skill.summons;

  return skill;
}

export async function loadSkills(json: any[], ret: Map<number, Skill>): Promise<void> {
  for (let skill of json) {
    if (ret.has(skill.id)) {
      error(`Duplicated spell ID: ${skill.id}`);
    } else {
      ret.set(skill.id, normalizeSpell(skill));
    }
  }
}

function assert(condition: boolean, message: string, item: any): asserts condition {
  if (!condition) {
    log(item);
    throw Object.assign(new Error(message), { item });
  }
}

function assertNumber<T, k extends keyof T>(item: T, key: k) {
  item[key] = ((item[key] as any) || 0) as any;
  assert(isFinite(item[key] as any), key + " is finite", item);
}

function normalizeItem(item: ItemLike) {
  assert(!!item.id, "id is required", item);
  assert(!!item.name, "name is required", item);

  assert(!!item.object_type, "object_type is missing", item);
  assert(!!ObjectTypes[item.object_type], "object_type is not in the enum", item);
  item.grabable = !!item.grabable;

  // item.poisons = !!item.poisons;
  // item.stabs = !!item.stabs;

  // assertNumber(item, "price");
  // assertNumber(item, "grh");
  // assertNumber(item, "price");
  // assertNumber(item, "animation");
  // assertNumber(item, "max_hit");
  // assertNumber(item, "min_hit");
  // assertNumber(item, "duration");
  // assertNumber(item, "max_modifier");
  // assertNumber(item, "min_modifier");
  // assertNumber(item, "max_defense");
  // assertNumber(item, "min_defense");
  // assertNumber(item, "spell");
  // assertNumber(item, "staff_power");
  // assertNumber(item, "staff_damage_bonus");
  // assertNumber(item, "potion_type");
  // assertNumber(item, "min_magical_defense");
  // assertNumber(item, "max_magical_defense");
  // assertNumber(item, "reinforcement");

  if ("sound" in item) {
    assert(item.sound instanceof Array, "sound is array", item);
    assert(
      item.sound!.every(($) => isFinite($)),
      "sound is array of numbers",
      item
    );
  }

  if ("allowed_classes" in item) {
    assert(item.allowed_classes instanceof Array, "allowed_classes is array", item);
    assert(
      item.allowed_classes.every(($) => isFinite($)),
      "allowed_classes is array of numbers",
      item
    );
    assert(
      item.allowed_classes.every(($) => !!CharClass[$]),
      "allowed_classes are valid classes",
      item
    );
  }

  if (item.object_type === ObjectTypes.Potion) {
    assert(!!PotionType[item.potion_type], "potion_type is not in the enum", item);
  }

  if (item.object_type === ObjectTypes.Armor) {
    item.short_people = !!item.short_people;
    assertNumber(item, "animation");
  }

  if (item.object_type === ObjectTypes.Weapon) {
    item.two_handed = !!item.two_handed;
    item.projectile = !!item.projectile;
    assertNumber(item, "reinforcement");
  }

  return item;
}

export async function loadItems(json: any[], ret: Map<number, ItemLike>): Promise<void> {
  for (let item of json) {
    if (ret.has(item.id)) {
      error(`Duplicated item ID: ${item.id}`);
    } else {
      ret.set(item.id, normalizeItem(item));
    }
  }
}

export function getEquipableSlotsForItem(item: ItemLike): Set<InventorySlots> {
  const ret: Set<InventorySlots> = new Set();

  if (item) {
    switch (item.object_type) {
      case ObjectTypes.Armor:
        ret.add(InventorySlots.Armor);
        break;
      case ObjectTypes.Helmet:
        ret.add(InventorySlots.Head);
        break;
      case ObjectTypes.Ring:
        ret.add(InventorySlots.Ring);
        break;
      case ObjectTypes.Instrument:
      case ObjectTypes.Arrows:
        ret.add(InventorySlots.Accessory);
        break;
      case ObjectTypes.Potion:
        ret.add(InventorySlots.Belt1);
        ret.add(InventorySlots.Belt2);
        break;
      case ObjectTypes.Shield:
        // ret.add(InventorySlots.LeftHand);
        ret.add(InventorySlots.RightHand);
        break;
      case ObjectTypes.Weapon:
        ret.add(InventorySlots.RightHand);
        ret.add(InventorySlots.LeftHand);
        break;
    }
  }

  return ret;
}

export let skills: Map<number, Skill> = new Map();
export let items: Map<number, ItemLike> = new Map();

function loadClassModifiers(modifiers: any[]) {
  for (let modifier of modifiers) {
    classModifier.set(modifier.class, modifier);
  }
}
function loadRaceModifiers(modifiers: any[]) {
  for (let modifier of modifiers) {
    raceModifier.set(modifier.race, modifier);
  }
}

function loadHealthModifiers(modifiers: CalculatedRecord[]) {
  calculatedBalance.length = 0;
  calculatedBalance.push(...modifiers);
}

export async function loadBalance() {
  const env = await import("@arduz/Environment");
  const balance = await env.getBalance();

  await Promise.all([
    loadSkills(balance.spells, skills),
    loadItems(balance.items, items),
    loadClassModifiers(balance.balance_class),
    loadRaceModifiers(balance.balance_race),
    loadHealthModifiers(balance.calculated_balance),
    // TODO: load timers
  ]);
}
