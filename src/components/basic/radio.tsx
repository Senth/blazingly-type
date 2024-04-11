export interface RadioProps {
  label: string;
  checked: boolean;
  onChecked: () => void;
}

export default function Radio({
  label,
  checked,
  onChecked,
}: RadioProps): JSX.Element {
  return (
    <label htmlFor={label}>
      <input
        className="mr-2"
        type="radio"
        id={label}
        name="lesson"
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
