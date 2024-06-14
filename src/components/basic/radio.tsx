export interface RadioProps {
  label: string;
  checked: boolean;
  name: string;
  onChecked: () => void;
}

export default function Radio({
  label,
  checked,
  name,
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
      {label}
    </label>
  );
}
