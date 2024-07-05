interface ButtonProps {
  text: string;
  className?: string;
  icon?: React.ReactNode;
  styling?: ButtonStyles;
  onClick: () => void;
}

type ButtonStyles =
  | "neutral"
  | "positive"
  | "primary"
  | "negative"
  | "disabled";

export default function Button(props: ButtonProps): JSX.Element {
  let classNameStyling = "";
  switch (props.styling) {
    case "positive":
      classNameStyling = "bg-green-600 hover:bg-green-500 active:bg-green-700";
      break;
    case "primary":
      classNameStyling = "bg-blue-600 hover:bg-blue-500 active:bg-blue-700";
      break;
    case "negative":
      classNameStyling = "bg-red-600 hover:bg-red-500 active:bg-red-700";
      break;
    case "neutral":
    default:
      classNameStyling = "bg-gray-700 hover:bg-gray-600 active:bg-gray-800";
      break;
  }

  return (
    <button
      className={`p-3 uppercase font-medium rounded-md min-w-36 ${classNameStyling} ${props.className}`}
      onClick={() => props.onClick()}
    >
      {props.icon && props.icon}
      {props.text}
    </button>
  );
}
