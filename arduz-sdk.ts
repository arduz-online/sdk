import { ConnectionSystem } from "./sdk/Systems/Connection";
import { InvisibleSystem } from "./sdk/Systems/Invisible";
import { MeditationSystem } from "./sdk/Systems/Meditation";
import { ParalysisSystem } from "./sdk/Systems/Paralysis";
import { InventorySystem } from "./sdk/Systems/Inventory";
import { CombatSystem } from "./sdk/Systems/Combat";
import { SkillSystem } from "./sdk/Systems/Skill";
import { GameMapSystem } from "./sdk/Systems/GameMap";
import {
  Character,
  onNewCharacterObservable,
} from "./sdk/Components/Character";
import { Connection } from "./sdk/Components/Connection";
import { loadBalance } from "./sdk/Balance";
import { WalkingSystem } from "./sdk/Systems/WalkingSystem";
import { MimetismSystem } from "./sdk/Systems/Mimetism";
import { TimersSystem } from "./sdk/Systems/Timers";

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