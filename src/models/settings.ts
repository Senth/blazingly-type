export interface Settings {
  exercise: SettingsExercise;
  locale: SettingsLocale;
}

export interface SettingsExercise {
  autoSkipTime: string;
  wpmDecayPerDay: number;
}

export interface SettingsLocale {
  dateFormat: string;
}

export interface SingleSetting<T> {
  enabled: boolean;
  value?: T;
}

export namespace Settings {
  export function New(): Settings {
    return {
      locale: {
        dateFormat: getDefaultLocaleDateFormat(),
      },
      exercise: {
        autoSkipTime: "3:00",
        wpmDecayPerDay: 2.5,
      },
    };
  }

  export const version = 1;
}

export function migrateSettings(
  oldSettings: any,
  oldVersion: number,
): Settings {
  let settings = oldSettings;
  if (oldVersion < 1) {
    settings = {
      ...settings,
      locale: {
        dateFormat: getDefaultLocaleDateFormat(),
      },
    };
  }
  return settings;
}

export function getDefaultLocaleDateFormat(): string {
  const locale = navigator.language || "en-US";
  const sampleDate = new Date(1987, 11, 23); // May 23, 1987
  const formattedDate = sampleDate.toLocaleDateString(locale);

  // Extract the numeric parts from the formatted date
  const parts = formattedDate.match(/(\d+)/g);

  // Map the numeric parts to their corresponding date components
  const dateComponents = {
    day: sampleDate.getDate().toString(),
    month: (sampleDate.getMonth() + 1).toString(),
    year: sampleDate.getFullYear().toString(),
  };

  const formatParts = parts?.map((part) => {
    if (part === dateComponents.day) return "DD";
    if (part === dateComponents.month) return "MM";
    if (part === dateComponents.year) return "YYYY";
    return part;
  });
  console.log(formatParts);

  // Extract the separator used in the formatted date
  const separatorMatch = formattedDate.match(/[^0-9]+/);
  const separator = separatorMatch ? separatorMatch[0] : "/";

  return formatParts?.join(separator) || "MM/DD/YYYY";
}
