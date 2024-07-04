export interface RadioProps {
  label: string;
  checked: boolean;
  name: string;
  children?: React.ReactNode;
  onChecked: () => void;
}

export default function Radio({
  label,
  checked,
  name,
  children,
  onChecked,
}: RadioProps): JSX.Element {
  return (
    <label htmlFor={label}>
      <input
        className="mr-2"
        type="radio"
        id={label}
        name={name}
        value={label}
        checked={checked}
        onChange={(checked) => {
          checked && onChecked();
        }}
      />
      {children ? children : label}
    </label>
  );
}
