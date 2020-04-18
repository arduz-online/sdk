import { Character } from "../Components/Character";
import { RequestedTarget, requestTargetFor, cancelCasting } from "../Components/RequestTarget";
import { charUsesSkill, charUsesItem, charAttacksEntity } from "../Events/CharEvents";
import { isMeditating, stopMeditating, startMeditating } from "../Components/Meditation";
import { SkillTarget, KnownSounds } from "../Declares";
import { isSkillSlot } from "../AtomicHelpers/Slots";
import { headToPos } from "../AtomicHelpers/HeadToPos";
import { Walking } from "../Components/Walking";
import { entitiesInPosition } from "../Components/WorldPosition";
import { HeadingComponent } from "../Components/Heading";
import { TargetType, ConsoleMessages, InventorySlots, Heading } from "../Enums";

export function handleMapClick(char: Character, x: number, y: number) {
  const requestedTarget = char.getComponentOrNull(RequestedTarget);

  if (requestedTarget) {
    const isSkill = isSkillSlot(requestedTarget.slot);

    if (isSkill) {
      charUsesSkill(char, requestedTarget.slot, x, y);
    } else if (!isSkill) {
      charUsesItem(char, requestedTarget.slot, x, y);
    }

    cancelCasting(char);
  } else {
    for (let entity of entitiesInPosition(x, y)) {
      if (entity instanceof Character) {
        char.sendConsoleMessage(`You see: ${entity.body.nick}`);
      }
    }
  }
}

export function handleUseSkill(char: Character, slot: number) {
  if (!isSkillSlot(slot)) return;

  if (char.body.dead) {
    char.sendConsoleMessage("You can't cast spells while you are dead!");
    return;
  }

  if (isMeditating(char)) {
    char.sendConsoleMessage("You can't cast spells while you are meditating!");
    return;
  }

  const mySkills = char.skills;

  if (!mySkills) return;
  const skill = mySkills.getItem(slot);
  if (!skill) return;

  const targetType = skill.target === SkillTarget.Terrain ? TargetType.Floor : TargetType.Char;

  requestTargetFor(char, targetType, slot);
}

export function handleAttack(char: Character) {
  if (char.body.dead) {
    char.sendConsoleMessage(ConsoleMessages["You can't attack because you are dead!"]);
    return;
  }

  // Not hunter? HidingSystem.makeVisible(char)

  const { heading } = char.getComponentOrCreate(HeadingComponent);

  const { x, y } = headToPos(char.position.x, char.position.y, heading);

  let didAttack = false;

  for (let entity of entitiesInPosition(x, y)) {
    if (entity instanceof Character) {
      charAttacksEntity(char, entity, false);
      didAttack = true;
      break;
    }
  }

  if (!didAttack) {
    let weaponHand = char.body.isLeftHandWeapon
      ? InventorySlots.LeftHand
      : char.body.isRightHandWeapon
      ? InventorySlots.RightHand
      : InventorySlots.NONE;

    if (weaponHand !== InventorySlots.NONE) {
      char.position.sendWeaponSwing(char, weaponHand, KnownSounds.SWING);
    }
  }
}

export function handleMeditate(char: Character) {
  if (char.body.dead) {
    return;
  }

  // if invisible, make visible

  if (isMeditating(char)) {
    stopMeditating(char);
  } else {
    startMeditating(char);
  }
}

export function handleTalk(char: Character, message: string, color: number = 0xffffff) {
  char.talk(message, color);
}

export function handleSetHeading(char: Character, heading: Heading) {
  char.getComponentOrCreate(HeadingComponent).heading = heading;
}

export function handleWalk(char: Character, heading: Heading) {
  char.getComponentOrCreate(HeadingComponent).heading = heading;
  char.addComponentOrReplace(new Walking(heading));

  // stopHiding(char)
}
