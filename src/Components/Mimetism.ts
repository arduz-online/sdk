const MIMETISM_DURATION = 15;

@Component("mimetism")
export class Mimetism {
  timer = MIMETISM_DURATION;

  restart() {
    this.timer = MIMETISM_DURATION;
  }
}
