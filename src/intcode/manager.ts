import {
  intcodeRunner,
  YieldFeedback,
  ReturnFeedback,
  FeedbackType
} from "./runner";

type CleanupItem = { id: number; expiration: number };

const TWO_HOURS_MS = 7200000;

export class IntcodeManager {
  private runners: Map<
    number,
    Generator<YieldFeedback, ReturnFeedback, number | undefined>
  >;
  private results: Map<number, number[]>;
  private idCounter: number;
  private cleanupQueue: CleanupItem[];

  constructor() {
    this.runners = new Map();
    this.results = new Map();
    this.cleanupQueue = [];
    this.idCounter = 0;
    setInterval(this.cleanUpStaleRunners, 60000);
  }

  createRunner(program: number[]): number {
    const id = this.nextId();
    const runner = intcodeRunner(program);
    this.runners.set(id, runner);
    this.cleanupQueue.push({ id, expiration: Date.now() + TWO_HOURS_MS });
    console.log(
      `Registered new runner. Currently: ${this.runners.size} runners.`
    );
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
    if (this.cleanupQueue.length > 0) {
      let counter = 0;
      while (this.cleanupQueue.length > 0) {
        if (this.cleanupQueue[0].expiration > Date.now()) {
          break;
        }
        const { id } = this.cleanupQueue.shift()!;
        this.runners.delete(id);
        this.results.delete(id);
      }
      console.log(
        `Cleaned up ${counter} runners. Currently: ${this.runners.size} runners.`
      );
    }
  };
}
