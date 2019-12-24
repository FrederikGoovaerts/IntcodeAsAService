import {
  intcodeRunner,
  YieldFeedback,
  ReturnFeedback,
  FeedbackType
} from "./runner";

export class IntcodeManager {
  private runners: Map<
    number,
    Generator<YieldFeedback, ReturnFeedback, number | undefined>
  >;
  private results: Map<number, number[]>;
  private idCounter: number;

  constructor() {
    this.runners = new Map();
    this.results = new Map();
    this.idCounter = 0;
    setInterval(this.cleanUpStaleRunners, 15000);
  }

  createRunner(program: number[]): number {
    const id = this.nextId();
    const runner = intcodeRunner(program);
    this.runners.set(id, runner);
    return id;
  }

  next(
    id: number,
    input: number | undefined
  ): {
    status: "input" | "output" | "halt";
    output: undefined | number | number[];
  } {
    if (this.results.has(id)) {
      return { status: "halt", output: this.results.get(id)! };
    }
    if (!this.runners.has(id)) {
      throw new Error("Intcode runner not found.");
    }
    const runner = this.runners.get(id)!;
    const result = runner.next(input);
    if (result.done) {
      this.results.set(id, result.value.output);
      return { status: "halt", output: result.value.output };
    } else if (result.value.type === FeedbackType.Input) {
      return { status: "input", output: undefined };
    } else {
      return { status: "output", output: result.value.output };
    }
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
