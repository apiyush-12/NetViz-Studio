import { NetworkTopology } from "@/features/topology/topology-types";

const MAX_HISTORY = 50;

export class TopologyHistory {
  private pastStack: NetworkTopology[] = [];
  private futureStack: NetworkTopology[] = [];

  public pushState(currentState: NetworkTopology) {
    // Clone state to prevent mutations
    const snapshot: NetworkTopology = JSON.parse(JSON.stringify(currentState));
    this.pastStack.push(snapshot);
    if (this.pastStack.length > MAX_HISTORY) {
      this.pastStack.shift();
    }
    // Clear redo history when a new action is performed
    this.futureStack = [];
  }

  public canUndo(): boolean {
    return this.pastStack.length > 0;
  }

  public canRedo(): boolean {
    return this.futureStack.length > 0;
  }

  public undo(currentState: NetworkTopology): NetworkTopology | null {
    if (!this.canUndo()) return null;

    const snapshot = JSON.parse(JSON.stringify(currentState));
    this.futureStack.push(snapshot);

    const previousState = this.pastStack.pop()!;
    return previousState;
  }

  public redo(currentState: NetworkTopology): NetworkTopology | null {
    if (!this.canRedo()) return null;

    const snapshot = JSON.parse(JSON.stringify(currentState));
    this.pastStack.push(snapshot);

    const nextState = this.futureStack.pop()!;
    return nextState;
  }

  public clear() {
    this.pastStack = [];
    this.futureStack = [];
  }
}
