import Input, { Validation, ValueType } from "@components/basic/input";
import TopBar from "@components/TopBar";
import useSettingsStore from "@stores/settings";
import React, { HTMLProps } from "react";
import { useState } from "react";

export default function Settings(): JSX.Element {
  return (
    <div className="h-full w-full flex flex-col">
      <TopBar />
      <div className="h-full w-full flex p-5">
        <ExerciseSettings />
      </div>
    </div>
  );
}

function ExerciseSettings(): JSX.Element {
  const { settings, setExercise } = useSettingsStore();
  const [autoSkipTimeMessage, setAutoSkipTimeMessage] = useState<string>("");
  const [wpmDecayPerDayMessage, setWpmDecayPerDayMessage] =
    useState<string>("");

  return (
    <div>
      <h2 className="text-4xl">Exercise Settings</h2>
      <Table columns={3} className="mt-5" tdClassName="px-3">
        <SettingsLabel>Auto skip time</SettingsLabel>
        <Input
          className="w-16"
          type="string"
          value={settings.exercise.autoSkipTime}
          onCommit={(value) => {
            if (typeof value === "string") {
              setExercise({ ...settings.exercise, autoSkipTime: value });
            }
          }}
          validate={validateAutoSkipTime}
          updateValidationMessage={(message) =>
            typeof message === "string" && setAutoSkipTimeMessage(message)
          }
        />
        <SettingsDescription>
          Max time per exercise. When reached, it will automatically move you to
          the next exercise.
          <br />
          It's recommended to keep between 2:00 and 4:00 minutes. Default is
          3:00 minutes.
        </SettingsDescription>
        <td></td>
        <td colSpan={2} className="text-sm text-red-500 h-10 align-top">
          {autoSkipTimeMessage}
        </td>
        <SettingsLabel>WPM Decay (for slowest)</SettingsLabel>
        <Input
          className="w-16"
          type="number"
          step="0.5"
          value={settings.exercise.wpmDecayPerDay}
          onCommit={(value) => {
            if (typeof value === "number") {
              setExercise({ ...settings.exercise, wpmDecayPerDay: value });
            }
          }}
          validate={validateWpmDecay}
          updateValidationMessage={(message) =>
            typeof message === "string" && setWpmDecayPerDayMessage(message)
          }
        />
        <SettingsDescription>
          Used to sort words by WPM. A lower value will make the slowest words
          appear more often.
          <br />
          It's recommended to keep between 1.0 and 5.0. Default is 2.5.
        </SettingsDescription>
        <td></td>
        <td colSpan={2} className="text-sm text-red-500 h-10 align-top">
          {wpmDecayPerDayMessage}
        </td>
      </Table>
    </div>
  );
}

function SettingsLabel(props: HTMLProps<HTMLLabelElement>): JSX.Element {
  return (
    <label className={`text-lg ${props.className}`}>{props.children}</label>
  );
}

function SettingsDescription(props: {
  children: React.ReactNode;
}): JSX.Element {
  return <span className="text-md text-stone-300">{props.children}</span>;
}

interface TableProps {
  children: React.ReactNode[];
  trClassName?: string;
  tdClassName?: string;
  className?: string;
  columns: number;
}

export function Table(props: TableProps): JSX.Element {
  const rows: { node: React.ReactNode; colspan?: number }[][] = [];
  let columns: { node: React.ReactNode; colspan?: number }[] = [];
  let columnId = 0;

  props.children.forEach((child, index) => {
    // Get potential colspan from the child
    let colspan = 1;
    const element = child as React.ReactElement;
    if (element?.type === "td") {
      colspan = element.props.colSpan || 1;
    }

    columnId += colspan || 1;
    columns.push({ node: child, colspan });

    if (columnId >= props.columns || props.children.length === index + 1) {
      if (columns.length > 0) {
        rows.push(columns);
      }
      columns = [];
      columnId = 0;
    }
  });

  return (
    <table className={props.className}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={props.trClassName}>
            {row.map((column, j) => {
              const element = column.node as React.ReactElement;
              if (element?.type === "td") {
                return React.cloneElement(element, {
                  key: j,
                  className: `${element.props.className} ${props.tdClassName}`,
                });
              }
              return (
                <td
                  key={j}
                  className={props.tdClassName}
                  colSpan={column.colspan}
                >
                  {column.node}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function validateAutoSkipTime(value: ValueType): Validation {
  if (!value) {
    return { isValid: false, message: "Cannot be empty" };
  }

  if (typeof value === "number") {
    value = value.toString();
  }

  if (typeof value !== "string") {
    return { isValid: false, message: "Must be in the format MM:SS" };
  }

  // Make sure it's a time in the input of MM:SS. Where [MM:]SS is valid.
  const timeParts = value.split(":");
  if (timeParts.length > 2) {
    return { isValid: false, message: "Must be in the format MM:SS" };
  }

  // Check if the values are numbers
  if (timeParts.some((part: string) => isNaN(Number(part)))) {
    return { isValid: false, message: "Must be in the format MM:SS" };
  }

  // Check if the values are within the correct range
  // Minutes
  const minutes = timeParts.length === 2 ? timeParts[0] : "0";
  if (timeParts.length === 2) {
    if (Number(timeParts[0]) < 0) {
      return { isValid: false, message: "Minutes must be positive" };
    }
    if (Number(timeParts[0]) > 60) {
      return { isValid: false, message: "Minutes must be 60 or less" };
    }
  }

  // Seconds
  const seconds = timeParts[timeParts.length - 1];
  if (Number(seconds) < 0) {
    return { isValid: false, message: "Seconds must be positive" };
  }
  if (Number(seconds) >= 60) {
    return { isValid: false, message: "Seconds must be less than 60" };
  }

  // Format the value to MM:SS
  if (timeParts.length === 1) {
    value = `0:${seconds.padStart(2, "0")}`;
  } else {
    value = `${minutes}:${seconds.padStart(2, "0")}`;
  }

  return { isValid: true, message: "", value };
}

function validateWpmDecay(value: ValueType): Validation {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  if (
    typeof value !== "number" ||
    isNaN(value) ||
    !isFinite(value) ||
    value < 0.1 ||
    value > 1000.0
  ) {
    return {
      isValid: false,
      message: "Must be a number between 0.1 and 1000.0",
      value,
    };
  }

  return { isValid: true, message: "", value };
}
