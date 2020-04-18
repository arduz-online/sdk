import { Character } from "../Components/Character";

@EventConstructor()
export class CharAttacksChar {
  constructor(
    public readonly attacker: Character,
    public readonly victim: IEntity,
    public readonly projectile: boolean
  ) {}
}

export function charAttacksEntity(attacker: Character, victim: IEntity, projectile: boolean) {
  engine.eventManager.fireEvent(new CharAttacksChar(attacker, victim, projectile));
}

// -------------------------------------------------------------------

@EventConstructor()
export class CharUsesSkill {
  constructor(
    public readonly char: Character,
    public readonly slot: number,
    public readonly x: number,
    public readonly y: number
  ) {}
}

export function charUsesSkill(char: Character, slot: number, x: number, y: number) {
  engine.eventManager.fireEvent(new CharUsesSkill(char, slot, x, y));
}

// -------------------------------------------------------------------

@EventConstructor()
export class CharUsesItem {
  constructor(
    public readonly char: Character,
    public readonly slot: number,
    public readonly x?: number,
    public readonly y?: number
  ) {}
}

export function charUsesItem(char: Character, slot: number, x?: number, y?: number) {
  engine.eventManager.fireEvent(new CharUsesItem(char, slot, x, y));
}

// -------------------------------------------------------------------

@EventConstructor()
export class MoveItems {
  constructor(
    public readonly char: Character,
    public readonly from: number,
    public readonly to: number,
    public readonly sendMessages: boolean
  ) {}
}

export function charMoveItems(char: Character, from: number, to: number, sendMessages: boolean) {
  engine.eventManager.fireEvent(new MoveItems(char, from, to, sendMessages));
}
