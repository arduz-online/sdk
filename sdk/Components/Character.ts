import { Body } from "./Body";
import { KnownSounds } from "../Declares";
import { WorldPosition } from "./WorldPosition";
import { CharStats } from "./Stats";
import { Connection, sendMessageObservable } from "./Connection";
import { Inventory } from "./Inventory";
import { Skills } from "./Skills";
import { setVisible } from "./Invisible";
import { stopMeditating } from "./Meditation";
import { cancelCasting } from "./RequestTarget";
import { HeadingComponent } from "./Heading";
import { Fx } from "./Fx";
import { Timers } from "./Timers";
import { ConsoleMessages, Gender } from "../Enums";

// only triggered after a character is added to the engine, manually so far
export const onNewCharacterObservable = new Observable<Character>();

export class Character extends Entity {
  get position() {
    return this.getComponentOrCreate(WorldPosition);
  }
  get body() {
    return this.getComponentOrCreate(Body);
  }
  get stats() {
    return this.getComponentOrCreate(CharStats);
  }
  get timers() {
    return this.getComponentOrCreate(Timers);
  }

  get connection(): Connection | null {
    return this.getComponentOrNull(Connection);
  }
  get inventory(): Inventory | null {
    return this.getComponentOrNull(Inventory);
  }
  get skills(): Skills | null {
    return this.getComponentOrNull(Skills);
  }

  constructor() {
    super();
    this.getComponentOrCreate(WorldPosition);
    this.getComponentOrCreate(Body);
    this.getComponentOrCreate(CharStats);
    this.getComponentOrCreate(HeadingComponent);
    this.getComponentOrCreate(Timers);
  }

  sendSound(sound: number) {
    this.position.sendSound(this.position.x, this.position.y, sound);
  }

  sayMagicWords(spell: string) {
    this.position.enqueueSendToArea({
      Talk: {
        entityId: this.uuid,
        color: 0x00ccff,
        message: spell,
        nick: this.body.nick,
        console: false,
      },
    });
  }

  talk(message: string, color: number = 0xffffff) {
    this.position.enqueueSendToArea({
      Talk: {
        entityId: this.uuid,
        color,
        message,
        nick: this.body.nick,
        console: true,
      },
    });
  }

  sendConsoleMessage(message: ConsoleMessages | string, map?: Record<string, string>) {
    const c = this.connection;

    if (c) {
      if (typeof message === "string") {
        sendMessageObservable.notifyObservers({
          connectionIds: [c.connectionId],
          data: { ConsoleMessage: { message, map } },
        });
      } else {
        sendMessageObservable.notifyObservers({
          connectionIds: [c.connectionId],
          data: { ConsoleMessage: { messageId: message, map } },
        });
      }
    }
  }

  notifyUpdatedPosition() {
    if (this.connection) {
      sendMessageObservable.notifyObservers({
        connectionIds: [this.connection.connectionId],
        data: {
          UpdatePosition: {
            entityId: this.uuid,
            x: this.position.x,
            y: this.position.y,
          },
        },
      });
    }
  }

  die() {
    if (this.body.dead) {
      return;
    }

    if (this.body.gender == Gender.Female) {
      this.sendSound(KnownSounds.DIE_FEMALE);
    } else {
      this.sendSound(KnownSounds.DIE_MALE);
    }

    /// Remove the dialog
    this.talk("");

    /// Reset stats
    this.stats.minHp = 0;
    this.stats.minMana = 0;

    // reset FX
    this.resetFlags();
  }

  resetFlags() {
    setVisible(this);
    stopMeditating(this);
    cancelCasting(this);

    this.body.mimetism = null;

    this.body.kill();
    this.removeComponent(Fx);
  }

  resucitate(reset: boolean) {
    this.body.resucitate();

    this.stats.minHp = this.stats.maxHp;
    this.stats.minMana = 0;

    if (this.stats.minHp <= 0) this.stats.minHp = 1;
    if (this.stats.minHp > this.stats.maxHp) {
      this.stats.minHp = this.stats.maxHp;
    }

    if (reset) {
      this.stats.minHp = this.stats.maxHp;
      this.stats.minMana = this.stats.maxMana;

      this.removeComponent(Fx);
    }
  }
}
