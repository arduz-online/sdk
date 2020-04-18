declare module "@arduz/Connections" {
  export type BasicSkill = {
    id: number;
    name: string;
    description: string;
    graphic: number;
    slot: number;
  };

  export type BasicItem = {
    slot: number;
    amount: number;
    item: { id: number; name: string; grh: number };
  };

  export type BasicArchetype = {
    id: string;
    nick: string;
    race: number;
    gender: number;
    charClass: number;
    head: number;
    body: number;
  };

  export type BasicAlignment = {
    id: string;
    color: string;
    name: string;
  };

  export type OutgoingMessages = {
    ConsoleMessage:
      | { messageId: number; map?: Record<string, string>; color?: number }
      | { message: string; map?: Record<string, string>; color?: number };
    SelectCharacter: {};
    Talk: { entityId: string; message: string; console?: boolean; color?: number; nick: string };
    CharMove: { entityId: string; x: number; y: number; heading: number };
    Hit: { x: number; y: number; text: string; color: number };
    Sound: { x: number; y: number; sound: number };
    Projectile: { x: number; y: number; sound: number; destX: number; destY: number; graphic: number };
    WeaponSwing: { entityId: string; weaponSlot: number; sound: number };
    Fx: { entityId: string; fx: number; loops: number };

    // tells the user which map to load
    LoadMap: { map: string };

    RemoveEntity: { entityId: string };

    SetLight: {
      entityId: string;
      radius: number;
      falloff: number[];
      intensity: number;
      color: number;
      height: number;
    };

    SetBody: {
      entityId: string;
      dead: boolean;
      head: number;
      body: number;
      speed: number;
      helmet: number;
      leftHand: number;
      rightHand: number;
      isLeftHandWeapon: boolean;
      isRightHandWeapon: boolean;
      nick: string;
      color: string;
    };

    SetHeading: {
      entityId: string;
      heading: number;
    };

    RequestedTarget: {
      type: number;
      slot: number;
      distance: number;
      range: number;
    };

    SetEntityId: { entityId: string };

    UpdatePosition: { entityId: string; x: number; y: number };

    Timers: {
      canAttackInterval: number;
      canThrowSpellInterval: number;
      canUseItemInterval: number;
      canUseBowInterval: number;
    };

    Stats: {
      entityId: string;
      minHp: number;
      maxHp: number;
      minMana: number;
      maxMana: number;
    };

    Status: {
      paralyzed: boolean;
      invisible: boolean;
      blind: boolean;
      dumb: boolean;
    };

    Skills: { skills: ReadonlyArray<BasicSkill> };
    Inventory: { items: ReadonlyArray<BasicItem> };
    Archetypes: { archetypes: ReadonlyArray<BasicArchetype>; alignments: ReadonlyArray<BasicAlignment> };
  };

  export type IncomingMessages = {
    Talk: { connectionId: string; text: string };
    SelectCharacter: { connectionId: string; id: string; alignment: string };
    Meditate: { connectionId: string };
    Attack: { connectionId: string };
    Hide: { connectionId: string };
    UseItem: { connectionId: string; slot: number };
    UseSkill: { connectionId: string; slot: number };
    MoveItem: { connectionId: string; from: number; to: number };
    MoveSkill: { connectionId: string; from: number; to: number };
    ClickMap: { connectionId: string; x: number; y: number };
    RequestCharacterList: { connectionId: string };
    MapLoaded: { connectionId: string };
    Walk: { connectionId: string; heading: number };
    SetHeading: { connectionId: string; heading: number };
  };

  export function send(connectionIds: string[], data: Partial<OutgoingMessages>, reliable?: boolean): Promise<void>;
  export function disconnect(connectionId: string, reason: string): Promise<void>;

  export const onInitialize: Observable<{ connectionId: string; nick: string }>;
  export const onDisconnected: Observable<{ connectionId: string }>;
  export const onMessage: Observable<Partial<IncomingMessages>>;
}
