import { CharacterDescription } from "../Declares";
import type { BasicAlignment } from "@arduz/Connections";

@Component("Archetypes")
export class Archetypes extends ObservableComponent {
  @ObservableComponent.field
  archetypes: Readonly<Record<string, Readonly<CharacterDescription>>> = {} as any;

  @ObservableComponent.field
  alignments: ReadonlyArray<BasicAlignment> = [];

  getArchetype(id: string): CharacterDescription | null {
    return this.archetypes[id] || null;
  }

  setArchetype(item: CharacterDescription): void {
    const id = item.id;
    this.archetypes = { ...this.archetypes, [id]: item };
    this.dirty = true;
  }

  clear(): void {
    this.archetypes = {} as any;
  }
}
