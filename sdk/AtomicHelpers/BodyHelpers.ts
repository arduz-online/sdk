import { Gender, Race } from "../Enums";
import { getRandomInteger } from "./Numbers";

export function getNakedBody(gender: Gender, race: Race): number {
  if (gender === Gender.Male) {
    switch (race) {
      case Race.Human:
        return 21;
      case Race.Drow:
        return 32;
      case Race.Elf:
        return 210;
      case Race.Gnome:
        return 222;
      case Race.Dwarf:
        return 53;
    }
  } else {
    switch (race) {
      case Race.Human:
        return 39;
      case Race.Drow:
        return 40;
      case Race.Elf:
        return 259;
      case Race.Gnome:
        return 260;
      case Race.Dwarf:
        return 60;
    }
  }
  return 21;
}

export function getHead(gender: Gender, race: Race): number {
  if (gender === Gender.Male) {
    switch (race) {
      case Race.Human:
        return getRandomInteger(1, 40);
      case Race.Drow:
        return getRandomInteger(200, 210);
      case Race.Elf:
        return getRandomInteger(101, 112);
      case Race.Gnome:
        return getRandomInteger(401, 406);
      case Race.Dwarf:
        return getRandomInteger(300, 306);
    }
  } else {
    switch (race) {
      case Race.Human:
        return getRandomInteger(70, 79);
      case Race.Drow:
        return getRandomInteger(270, 278);
      case Race.Elf:
        return getRandomInteger(170, 178);
      case Race.Gnome:
        return getRandomInteger(370, 372);
      case Race.Dwarf:
        return getRandomInteger(470, 476);
    }
  }
  return 1;
}
