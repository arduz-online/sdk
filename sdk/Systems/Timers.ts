import { Timers } from "../Components/Timers";

export class TimersSystem implements ISystem {
  private timers!: ComponentGroup;
  private nowInMs: number = 0;

  activate(engine: Engine) {
    this.timers = engine.getComponentGroup(Timers);
  }

  update(dt: number): void {
    this.nowInMs += dt * 1000;

    for (let char of this.timers.entities) {
      char.getComponent(Timers).update(this.nowInMs);
    }
  }
}
