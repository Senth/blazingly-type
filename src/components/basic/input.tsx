interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
}

export default function Input(props: InputProps): JSX.Element {
  return (
    <div className={`flex flex-col ${props.className}`}>
      {props.label && <label className="mb-1">{props.label}</label>}
      <input
        className={`p-2 rounded-md border w-full text-black ${props.disabled ? "bg-gray-400 border-gray-600" : "border-gray-300"}`}
        disabled={props.disabled}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}
