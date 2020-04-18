import { Heading } from "../Enums";

@Component("heading")
export class HeadingComponent extends ObservableComponent {
  @ObservableComponent.field
  heading: Heading = Heading.South;
}
