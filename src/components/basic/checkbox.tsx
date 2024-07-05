export interface CheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  helpText?: string;
  onChecked: (checked: boolean) => void;
  children?: React.ReactNode;
}

export default function Checkbox({
  label,
  checked,
  disabled,
  children,
  helpText,
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
      {helpText && (
        <>
          <br />
          <span className="text-sm text-gray-400">{helpText}</span>
        </>
      )}
    </div>
  );
}
