import { InventoryItem, ItemLike, ObjectTypes } from "../Declares";
import { Character } from "./Character";
import { InventorySlots, ConsoleMessages, Race } from "../Enums";

@Component("Inventory")
export class Inventory extends ObservableComponent {
  @ObservableComponent.field
  items: Readonly<Record<string, Readonly<InventoryItem> | null>> = {} as any;

  getItem(slot: InventorySlots): InventoryItem | null {
    return this.items[slot] || null;
  }

  setItem(slot: InventorySlots, item: InventoryItem | null): void {
    if (typeof slot !== "number") {
      error("slot was not a number");
      return;
    }
    this.items = { ...this.items, [slot]: item };
  }

  clear(): void {
    this.items = {} as any;
  }

  removeItemFromSlot(slot: InventorySlots, amount: number) {
    const item = this.getItem(slot);

    if (item) {
      if (item.amount >= 999999) return;
      item.amount = item.amount - amount;
      if (item.amount <= 0) {
        this.setItem(slot, null);
      }
    }
  }

  addItem(item: ItemLike, amount: number) {
    // does the user already have this kind of item?
    for (let [i, inventoryItem] of Object.entries(this.items)) {
      if (inventoryItem && inventoryItem.item === item) {
        this.setItem(+i, {
          item: inventoryItem.item,
          amount: inventoryItem.amount + amount
        });
        return true;
      }
    }

    let openSlot = InventorySlots.NONE;

    // find an open slot
    for (let i in InventorySlots) {
      if (isFinite(+i) && !this.getItem(+i)) {
        openSlot = +i;
        break;
      }
    }

    // there is no room for new items
    if (openSlot === InventorySlots.NONE) {
      return false;
    }

    this.setItem(openSlot, { amount, item });

    return true;
  }

  *entries(): Iterable<[InventorySlots, InventoryItem]> {
    for (let i in this.items) {
      const item = this.items[(i as any) as InventorySlots];
      if (item) yield [+i, item];
    }
  }
}

export function canEquip(char: Character, item: ItemLike, toSlot: InventorySlots, sendMessages: boolean): boolean {
  const inventory = char.getComponentOrNull(Inventory);

  if (!inventory) return false;

  // TODO: If I have a double handed weapon I still can equip a shield
  if ("allowed_classes" in item && item.allowed_classes.indexOf(char.body.charClass) == -1) {
    sendMessages && char.sendConsoleMessage(ConsoleMessages["Your class cannot use that item!"]);
    return false;
  }

  if (item.object_type === ObjectTypes.Armor) {
    if (item.short_people !== (char.body.race === Race.Dwarf || char.body.race === Race.Gnome)) {
      sendMessages && char.sendConsoleMessage(ConsoleMessages["Your race cannot use that item!"]);
      return false;
    }
  } else if (item.object_type === ObjectTypes.Weapon) {
    if (item.two_handed) {
      if (
        (toSlot === InventorySlots.LeftHand && inventory.getItem(InventorySlots.RightHand)) ||
        (toSlot === InventorySlots.RightHand && inventory.getItem(InventorySlots.LeftHand))
      ) {
        sendMessages &&
          char.sendConsoleMessage(ConsoleMessages["To use a two handed item you must release both hands!"]);
        return false;
      }
    }
  }

  return true;
}
