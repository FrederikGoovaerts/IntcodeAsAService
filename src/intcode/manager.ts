import { intcodeRunner } from "./runner";

export class IntcodeManager {
  private runners: Map<number, Generator>;
  private idCounter: number;

  constructor() {
    this.runners = new Map();
    this.idCounter = 0;
    setInterval(this.cleanUpStaleRunners, 15000);
  }

  createRunner(program: number[]): number {
    const id = this.nextId();
    const runner = intcodeRunner(program);
    this.runners.set(id, runner);
    return id;
  }

  private nextId(): number {
    this.idCounter = (this.idCounter + 1) % Number.MAX_SAFE_INTEGER;
    return this.idCounter;
  }

  private cleanUpStaleRunners = (): void => {
    console.log("Running cleanup...");
    // Do cleanup
    console.log(`Amount left: ${this.runners.size}`);
  };
}
