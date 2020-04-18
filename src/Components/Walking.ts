import { Heading } from "../Enums";

@Component("walking")
export class Walking {
  constructor(public heading: Heading = Heading.South) {}

  target?: { x: number; y: number };
}
