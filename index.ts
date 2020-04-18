import { ConnectionSystem } from "./src/Systems/Connection";
import { InvisibleSystem } from "./src/Systems/Invisible";
import { MeditationSystem } from "./src/Systems/Meditation";
import { ParalysisSystem } from "./src/Systems/Paralysis";
import { InventorySystem } from "./src/Systems/Inventory";
import { CombatSystem } from "./src/Systems/Combat";
import { SkillSystem } from "./src/Systems/Skill";
import { GameMapSystem } from "./src/Systems/GameMap";
import {
  Character,
  onNewCharacterObservable,
} from "./src/Components/Character";
import { Connection } from "./src/Components/Connection";
import { loadBalance } from "./src/Balance";
import { WalkingSystem } from "./src/Systems/WalkingSystem";
import { MimetismSystem } from "./src/Systems/Mimetism";
import { TimersSystem } from "./src/Systems/Timers";

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

export declare function callRpc(): void;
export declare function onUpdate(cb: (dt: number) => void): void;

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
