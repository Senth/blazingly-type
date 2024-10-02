import { useEffect, useRef, useState } from "react";

interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  onCommit?: (value: ValueType) => void;
  validate?: (value: ValueType) => Validation;
  updateValidationMessage?: (value: ValueType) => void;
}

export type ValueType = string | number | readonly string[];

export interface Validation {
  isValid: boolean;
  message: string;
  value?: ValueType;
}

export default function Input(props: InputProps): JSX.Element {
  const [tempValue, setTempValue] = useState(props.value);
  const [isValid, setIsValid] = useState(true);
  const leaveState = useRef("");

  useEffect(() => {
    setTempValue(props.value);
  }, [props.value]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "Tab") {
      leaveState.current = event.key;
      if (event.key === "Enter") {
        event.currentTarget.blur();
      }
    } else if (event.key === "Escape") {
      setTempValue(props.value);
      leaveState.current = "Escape";
      event.currentTarget.blur();
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTempValue(event.currentTarget.value);
    if (props.onChange) {
      props.onChange(event);
    }
  }

  function handleBlur() {
    if (
      props.onCommit &&
      leaveState.current !== "Escape" &&
      tempValue !== undefined &&
      tempValue !== props.value
    ) {
      let isValid = true;
      let committedValue = tempValue;
      if (props.validate) {
        const validation = props.validate(tempValue);
        isValid = validation.isValid;
        setIsValid(isValid);
        if (props.updateValidationMessage) {
          props.updateValidationMessage(validation.message);
        }
        if (validation.value) {
          committedValue = validation.value;
          setTempValue(committedValue);
        }
      }
      if (isValid) {
        props.onCommit(committedValue);
      }
    }
  }

  function handleFocus() {
    leaveState.current = "";
  }

  const inputProps = { ...props };
  delete inputProps.onCommit;
  delete inputProps.label;
  delete inputProps.validate;
  delete inputProps.updateValidationMessage;

  return (
    <div className={`flex flex-col ${props.className}`}>
      {props.label && <label className="mb-1">{props.label}</label>}
      <input
        {...inputProps}
        className={`p-2 rounded-md border w-full text-black ${props.disabled ? "bg-gray-400 border-gray-600" : "border-gray-300"} ${!isValid && "border-red-700 border-1"}`}
        value={tempValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </div>
  );
}
