export interface CheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChecked: (checked: boolean) => void;
  children?: React.ReactNode;
}

export default function Checkbox({
  label,
  checked,
  disabled,
  children,
  onChecked,
}: CheckboxProps): JSX.Element {
  return (
    <div>
      <input
        className="mr-2"
        type="checkbox"
        id={label}
        name={label}
        value={label}
        checked={checked}
        disabled={disabled}
        onChange={(checked) => onChecked(checked.currentTarget.checked)}
      />
      {children ? children : label}
    </div>
  );
}
