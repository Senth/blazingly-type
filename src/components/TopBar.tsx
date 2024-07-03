interface TopBarProps {
  menu?: React.ReactNode;
}

export default function TopBar(props: TopBarProps): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b-slate-500 h-16 bg-slate-900 text-white px-5">
      {props.menu && <div className="mr-10">{props.menu}</div>}
    </div>
  );
}
