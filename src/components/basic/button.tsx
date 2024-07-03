interface ButtonProps {
  text: string;
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
  let bg = "";
  let hover = "";
  let active = "";
  switch (props.styling) {
    case "positive":
      bg = "bg-green-600";
      hover = "hover:bg-green-500";
      active = "active:bg-green-700";
      break;
    case "primary":
      bg = "bg-blue-600";
      hover = "hover:bg-blue-500";
      active = "active:bg-blue-700";
      break;
    case "negative":
      bg = "bg-red-600";
      hover = "hover:bg-red-500";
      active = "active:bg-red-700";
      break;
    case "neutral":
    default:
      bg = "bg-gray-700";
      hover = "hover:bg-gray-600";
      active = "active:bg-gray-800";
      break;
  }

  return (
    <button
      className={`p-3 uppercase font-medium rounded-md min-w-36 ${bg} ${hover} ${active}`}
      onClick={() => props.onClick()}
    >
      {props.icon && props.icon}
      {props.text}
    </button>
  );
}
