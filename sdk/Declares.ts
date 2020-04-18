import { Race, Gender, CharClass, InventorySlots } from "./Enums";

export type Ability = keyof RaceModifierRecord;

export enum PotionType {
  Agility = 1,
  Strenght = 2,
  HP = 3,
  Mana = 4,
  Poison = 5,
  Suicide = 6,
}

export enum ObjectTypes {
  UseOnce = 1,
  Weapon = 2,
  Armor = 3,
  Tree = 4,
  Money = 5,
  Doors = 6,
  Containers = 7,
  Signs = 8,
  Keys = 9,
  Forum = 10,
  Potion = 11,
  Map = 12,
  FREE = 13,
  Lumber = 14,
  Fireplace = 15,
  Shield = 16,
  Helmet = 17,
  Ring = 18,
  Teleport = 19,
  Decoration = 20,
  Decoration2 = 21,
  MineralDeposit = 22,
  Mineral = 23,
  Scrolls = 24,
  Instrument = 26,
  Anvil = 27,
  Furnace = 28,
  Lingot = 29,
  AnimalSkins = 30,
  Boat = 31,
  Arrows = 32,
  EmptyBottle = 33,
  FullBottle = 34,
  Blood = 35,
  Any = 1000,
}

export const DEFAULT_TIMERS = {
  USE_ITEM: 200,
  WALK: 200,
  USE_BOW: 1400,
  THROW_SPELL: 1400,
  ATTACK: 1500,
};

// Known sounds
export enum KnownSounds {
  DIE_MALE = 11,
  DIE_FEMALE = 74,
  ARROW_IMPACT = 65,
  SHIP = 55,
  EAT_APPLE = 82,
  EAT = 7,
  DRINK = 46,
  STEPS_1 = 23,
  STEPS_2 = 24,
  EQUIP_WEAPON = 25,
  SHIELD = 37,
  SWING = 2,
  IMPACT = 10,
  IMPACT2 = 12,
}

export type ItemBase = {
  id: number;
  name: string;
  grh: number;
  grabable: boolean;
};

export type ItemLike =
  | WeaponItem
  | ArmorItem
  | HelmetItem
  | SheldItem
  | RingItem
  | InstrumentItem
  | PotionItem
  | ArrowItem;

export type WeaponItem = ItemBase & {
  object_type: ObjectTypes.Weapon;
  max_hit: number;
  min_hit: number;
  two_handed: boolean;
  projectile: boolean;
  reinforcement: number;
  animation: number;
  staff_damage_bonus: number;
  stabs: boolean;
  allowed_classes: number[];
};

export type ArrowItem = ItemBase & {
  object_type: ObjectTypes.Arrows;
  max_hit: number;
  min_hit: number;
  allowed_classes: number[];
};

export type ArmorItem = ItemBase & {
  object_type: ObjectTypes.Armor;
  animation: number; // fka body_grh
  min_defense: number;
  max_defense: number;
  allowed_classes: number[];
  short_people: boolean;
};

export type SheldItem = ItemBase & {
  object_type: ObjectTypes.Shield;
  animation: number;
  min_modifier: number;
  max_modifier: number;
  min_defense: number;
  max_defense: number;
  allowed_classes: number[];
};

export type HelmetItem = ItemBase & {
  object_type: ObjectTypes.Helmet;
  animation: number;
  min_defense: number;
  max_defense: number;
  min_magical_defense: number;
  max_magical_defense: number;
  allowed_classes: number[];
};

export type RingItem = ItemBase & {
  object_type: ObjectTypes.Ring;
  min_defense: number;
  max_defense: number;
  min_magical_defense: number;
  max_magical_defense: number;
  staff_damage_bonus: number;
  allowed_classes: number[];
};

export type InstrumentItem = ItemBase & {
  object_type: ObjectTypes.Instrument;
  sound: number[];
};

export type PotionItem = ItemBase & {
  object_type: ObjectTypes.Potion;
  potion_type: PotionType;
  min_modifier: number;
  max_modifier: number;
  duration: number;
  sound?: number[];
};

export interface InventoryItem {
  amount: number;
  item: ItemLike;
}

// -----------------------------------------------------

export enum SkillType {
  Properties = 1,
  State = 2,
  Materialize = 3,
  Invocation = 4,
}

export enum SkillTarget {
  Users = 1,
  NPC = 2,
  UserAndNpc = 3,
  Terrain = 4,
}

export type Skill = {
  id: number;
  name: string;
  description: string;
  graphic: number;

  spell: string; // magic words
  console_caster?: string;
  console_third?: string;
  console_self?: string;

  type: SkillType;
  sound: number;
  fx: number;
  fx_loops: number;
  required_mana: number;
  required_stamina: number;
  target: SkillTarget;

  makes_invisible: boolean;
  makes_paralized: boolean;
  makes_still: boolean;
  removes_paralysis: boolean;
  removes_dumb: boolean;
  removes_invisibility: boolean;
  heals_poison: boolean;
  makes_poison: boolean;
  resuscitates: boolean;
  makes_blind: boolean;
  makes_dumb: boolean;

  summons: boolean;
  summons_npc: number;

  increase_mana: 0 | 1 | -1;
  increase_hp: 0 | 1 | -1;

  min_hp: number;
  max_hp: number;
  min_mana: number;
  max_mana: number;
  min_stamina: number;
  max_stamina: number;
  min_agility: number;
  max_agility: number;
  min_strength: number;
  max_strength: number;

  mimetism: number;
};

export type CharacterDescription = {
  id: string;

  nick: string;

  race: Race;
  gender: Gender;
  charClass: CharClass;
  head: number; // if not present it is derivated from race + gender
  body: number;

  minHp: number;
  maxHp: number;

  minMana: number;
  maxMana: number;

  inventory: Array<{ slot: InventorySlots } & InventoryItem>;
  skills: Array<{ slot: number; skill: Skill }>;
};

export type ClassModifierRecord = {
  // new balance
  dexterity: number;
  agility: number;
  vitality: number;
  melee_dmg: number;
  range_dmg: number;
  melee_dex: number;
  range_dex: number;
  will: number;
  shield: number;
};

export type RaceModifierRecord = {
  // new balance
  strength: number;
  dexterity: number;
  agility: number;
  vitality: number;
  will: number;
};

export type CalculatedRecord = {
  race: number;
  class: number;
  health_points: number;
  evasion: number;
  accuracy: number;
};
