import { useRef, useState } from "react";

interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  onCommit?: (value: string | number | readonly string[]) => void;
}

export default function Input(props: InputProps): JSX.Element {
  const [value, setValue] = useState(props.value);
  const [tempValue, setTempValue] = useState(props.value);
  const leaveState = useRef("");

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "Tab") {
      leaveState.current = event.key;
      if (event.key === "Enter") {
        event.currentTarget.blur();
      }
    } else if (event.key === "Escape") {
      setTempValue(value);
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
    console.log("blurred");
    if (
      props.onCommit &&
      leaveState.current !== "Escape" &&
      tempValue !== undefined &&
      tempValue !== value
    ) {
      console.log("blurred and committed ", tempValue);
      props.onCommit(tempValue);
    }
    setValue(tempValue);
  }

  function handleFocus() {
    leaveState.current = "";
  }

  const inputProps = { ...props };
  delete inputProps.onCommit;
  delete inputProps.label;

  return (
    <div className={`flex flex-col ${props.className}`}>
      {props.label && <label className="mb-1">{props.label}</label>}
      <input
        {...inputProps}
        className={`p-2 rounded-md border w-full text-black ${props.disabled ? "bg-gray-400 border-gray-600" : "border-gray-300"}`}
        value={tempValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </div>
  );
}
