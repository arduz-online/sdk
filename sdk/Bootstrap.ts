import { ConnectionSystem } from "./Systems/Connection";
import { InvisibleSystem } from "./Systems/Invisible";
import { MeditationSystem } from "./Systems/Meditation";
import { ParalysisSystem } from "./Systems/Paralysis";
import { InventorySystem } from "./Systems/Inventory";
import { CombatSystem } from "./Systems/Combat";
import { SkillSystem } from "./Systems/Skill";
import { GameMapSystem } from "./Systems/GameMap";
import {
  Character,
  onNewCharacterObservable,
} from "./Components/Character";
import { Connection } from "./Components/Connection";
import { loadBalance } from "./Balance";
import { WalkingSystem } from "./Systems/WalkingSystem";
import { MimetismSystem } from "./Systems/Mimetism";
import { TimersSystem } from "./Systems/Timers";

export function startBaseSystems() {
  engine.addSystem(new InvisibleSystem());
  engine.addSystem(new MimetismSystem());
  engine.addSystem(new MeditationSystem());
  engine.addSystem(new ParalysisSystem());
  engine.addSystem(new TimersSystem());
  engine.addSystem(new SkillSystem());
  engine.addSystem(new InventorySystem());
  engine.addSystem(new CombatSystem());
  engine.addSystem(new WalkingSystem());
}

declare function callRpc(): void;
declare function onUpdate(cb: (dt: number) => void): void;

export async function startServer(customServer: () => Promise<void>) {
  if (typeof callRpc !== "undefined") {
    const environment = await import("@arduz/Environment");
    const network = await import("@arduz/Connections");

    const config = await environment.getConfiguration();

    engine.addSystem(new ConnectionSystem(network));

    network.onInitialize.add(($) => {
      const char = new Character();
      char.addComponent(new Connection($.connectionId, $.nick));
      char.position.x = 1;
      char.position.y = 1;
      char.body.nick = $.nick;

      engine.addEntity(char);

      onNewCharacterObservable.notifyObservers(char);
    });

    const map = engine.addSystem(new GameMapSystem(), Infinity);

    await map.load(config.map);

    await loadBalance();

    await customServer();

    await environment.startSignal();
  } else {
    log("SKIPPING CONNECTION SYSTEM INITIALIZATION");
  }
}

if (typeof onUpdate === "function") {
  onUpdate((dt) => engine.update(dt));
} else {
  error("No onUpdate function");
}
