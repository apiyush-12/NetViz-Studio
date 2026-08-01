import { NetworkLab } from "./lab-types";
import { INITIAL_LABS } from "@/data/lab-catalog";
import { LEARNING_PATHS, LearningPath } from "@/data/learning-paths";

class LabRegistry {
  private labs: Map<string, NetworkLab> = new Map();

  constructor() {
    INITIAL_LABS.forEach((lab) => this.register(lab));
  }

  public register(lab: NetworkLab) {
    this.labs.set(lab.id, lab);
  }

  public getLab(idOrSlug: string): NetworkLab | undefined {
    if (this.labs.has(idOrSlug)) return this.labs.get(idOrSlug);
    return Array.from(this.labs.values()).find((l) => l.slug === idOrSlug);
  }

  public getAllLabs(): NetworkLab[] {
    return Array.from(this.labs.values());
  }

  public getLearningPaths(): LearningPath[] {
    return LEARNING_PATHS;
  }
}

export const labRegistry = new LabRegistry();
