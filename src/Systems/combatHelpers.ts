import { Character } from "../Components/Character";
import { stopMeditating } from "../Components/Meditation";
import { ConsoleMessages } from "../Enums";

export function sendDamage(
  attacker: Character,
  victim: Character,
  damage: number
) {
  damage = damage | 0;

  attacker.sendConsoleMessage(
    ConsoleMessages["You hitted {{char}} by {{damage}}"],
    {
      char: victim.body.nick,
      damage: damage.toString(),
    }
  );

  victim.sendConsoleMessage(
    ConsoleMessages["{{char}} damaged you by {{damage}} points"],
    {
      char: attacker.body.nick,
      damage: damage.toString(),
    }
  );

  victim.stats.minHp = Math.round(victim.stats.minHp - damage);

  attacker.position.sendHit(
    victim.position.x,
    victim.position.y,
    damage.toString(),
    0xf32121
  );

  stopMeditating(victim);

  if (victim.stats.minHp <= 0) {
    victim.stats.minHp = 0;
    victim.die();

    attacker.sendConsoleMessage(ConsoleMessages["You killed {{char}}!"], {
      char: victim.body.nick,
    });
  }
}
