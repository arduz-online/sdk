@Component("status")
export class CharStatus extends ObservableComponent {
  @ObservableComponent.field paralyzed: boolean = false;
  @ObservableComponent.field invisible: boolean = false;
  @ObservableComponent.field dumb: boolean = false;
  @ObservableComponent.field blind: boolean = false;
}
