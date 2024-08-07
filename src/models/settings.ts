export interface Settings {
  exercise: SettingsExercise;
}

export interface SettingsExercise {
  autoSkipTime: string;
  wpmDecayPerDay: number;
}

export interface SingleSetting<T> {
  enabled: boolean;
  value?: T;
}

export namespace Settings {
  export function New(): Settings {
    return {
      exercise: {
        autoSkipTime: "3:00",
        wpmDecayPerDay: 2.5,
      },
    };
  }
}
