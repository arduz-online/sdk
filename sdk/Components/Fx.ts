@Component("fx")
export class Fx extends ObservableComponent {
  @ObservableComponent.field
  public fx: number = 0;

  @ObservableComponent.field
  public loops: number = 0;

  set(fx: number, loops: number) {
    this.fx = fx;
    this.loops = loops;
  }
}
