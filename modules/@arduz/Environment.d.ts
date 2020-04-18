declare module "@arduz/Environment" {
  export type BootstrapData = {
    name: string;
    main: string;
    fps: number;
  };
  export function getBootstrapData(): Promise<BootstrapData>;
  export function getConfiguration(): Promise<any>;
  export function getBalance(): Promise<any>;
  export function startSignal(): Promise<void>;
}
