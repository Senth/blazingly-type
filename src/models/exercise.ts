import { Lesson } from "./lesson";

export interface Exercises {
  lesson: Lesson;
  allExercises: string[][];
  currentExerciseIndex: number;
  generation: ExerciseGeneration;
  scope: Scopes;
}

export interface ExerciseGeneration {
  combinations: number;
  repetitions: number;
}

export enum Scopes {
  worst50 = "Worst 50",
  worst100 = "Worst 100",
  worst150 = "Worst 150",
  worst10percent = "Worst 10%",
  worst20percent = "Worst 20%",
  worst30percent = "Worst 30%",
}
