import { Lesson } from "./lesson";

export interface Exercises {
  lesson: Lesson;
  allExercises: string[][];
  currentExerciseIndex: number;
  generation: ExerciseGeneration;
	maxTime: MaxTime;
}

export interface MaxTime {
	minutes: number;
	enabled: boolean;
}

export interface ExerciseGeneration {
  combinations: number;
  repetitions: number;
  order: OrderTypes;
  maxExercises: number;
	maxExercisesEnabled: boolean;
}

export enum OrderTypes {
  Slowest = "Slowest",
  Random = "Random",
}
