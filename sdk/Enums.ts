export enum Heading {
  North = 0,
  East = 1,
  South = 2,
  West = 3,
}

export enum CharClass {
  Spectator = 0,
  Mage = 1,
  Cleric = 2,
  Warrior = 3,
  Assasin = 4,
  Bard = 5,
  Druid = 6,
  Paladin = 7,
  Hunter = 8,
}

export enum Race {
  Human = 1,
  Elf = 2,
  Drow = 3,
  Gnome = 4,
  Dwarf = 5,
}

export enum InventorySlots {
  NONE = -1,
  Slot1 = 0,
  Slot2 = 1,
  Slot3 = 2,
  Slot4 = 3,
  Slot5 = 4,
  Slot6 = 5,
  Slot7 = 6,
  Slot8 = 7,
  Slot9 = 8,
  Slot10 = 9,
  Slot11 = 10,
  Slot12 = 11,
  Slot13 = 12,
  Slot14 = 13,
  Slot15 = 14,
  Slot16 = 15,
  Head = 16,
  Armor = 17,
  Ring = 18,
  LeftHand = 19,
  RightHand = 20,
  Accessory = 21,
  Belt1 = 22,
  Belt2 = 23,

  // [24-28] HotBar
  // [29-44] Spells
}

export enum SkillSlots {
  NONE = 0,

  Spell1 = 29,
  Spell2 = 30,
  Spell3 = 31,
  Spell4 = 32,
  Spell5 = 33,
  Spell6 = 34,
  Spell7 = 35,
  Spell8 = 36,
  Spell9 = 37,
  Spell10 = 38,
  Spell11 = 39,
}

export enum HotBarSlots {
  NONE = 0,

  HotBar1 = 24,
  HotBar2 = 25,
  HotBar3 = 26,
  HotBar4 = 27,
  HotBar5 = 28,
}

export enum Gender {
  Male = 1,
  Female = 2,
}

export enum ConsoleMessages {
  "You can't use items while you are dead!" = 1,
  "You've been cured of poisoning!" = 2,
  "Restarting round" = 3,
  "Your class cannot use that item!" = 4,
  "Your race cannot use that item!" = 5,
  "To use a two handed item you must release both hands!" = 6,
  "You need to equip your weapon before using it!" = 7,
  "There are no equipped projectile!" = 8,
  "You can't attack dead players!" = 9,
  "You can't attack because you are dead!" = 10,
  "{{char}} damaged you by {{damage}} points" = 11,
  "You hitted {{char}} by {{damage}}" = 12,
  "You start meditating" = 13,
  "You can't attack yourself!" = 14,
  "You killed {{char}}!" = 15,
  "You have been poisoned!" = 16,
  "You can't use that weapon that way!" = 17, // hitting with a bow
  "You can't attack dead characters!" = 18,
  "You can't use items while you are meditating!" = 19,
}

export enum TargetType {
  NONE = 0,
  Item = 1,
  Char = 2,
  Floor = 3,
}
