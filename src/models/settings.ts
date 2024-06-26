export interface Settings {
  exercises: SettingsExercises;
}

export interface SettingsExercises {
  timeout: string;
}

export namespace Settings {
  export function New(): Settings {
    return {
      exercises: {
        timeout: "3:00",
      },
    };
  }
}
