import Input from "@components/basic/input";
import TopBar from "@components/TopBar";
import useSettingsStore from "@stores/settings";

export default function Settings(): JSX.Element {
  return (
    <div className="h-full w-full flex flex-col">
      <TopBar />
      <div className="h-full w-full flex p-5">
        <ExerciseSettings />
      </div>
    </div>
  );
}

function ExerciseSettings(): JSX.Element {
  const { settings, setExercise } = useSettingsStore();

  return (
    <div>
      <h2 className="text-4xl">Exercise Settings</h2>
      <Table columns={3} className="mt-5" tdClassName="p-3">
        <SettingsLabel>Auto skip time</SettingsLabel>
        <Input
          className="w-16"
          type="string"
          value={settings.exercise.autoSkipTime}
          onCommit={(value) => {
            if (typeof value === "string") {
              setExercise({ ...settings.exercise, autoSkipTime: value });
            }
          }}
        />
        <SettingsDescription>
          Max time per exercise. When reached, it will automatically move you to
          the next exercise.
          <br />
          It's recommended to keep this value between 2 and 4 minutes.
        </SettingsDescription>
      </Table>
    </div>
  );
}

function SettingsLabel(props: { children: React.ReactNode }): JSX.Element {
  return <label className="text-lg">{props.children}</label>;
}

function SettingsDescription(props: {
  children: React.ReactNode;
}): JSX.Element {
  return <span className="text-md text-stone-300">{props.children}</span>;
}

interface TableProps {
  children: React.ReactNode[];
  trClassName?: string;
  tdClassName?: string;
  className?: string;
  columns: number;
}

export function Table(props: TableProps): JSX.Element {
  const rows: { node: React.ReactNode; colspan?: number }[][] = [];
  let columns: { node: React.ReactNode; colspan?: number }[] = [];
  let columnId = 0;

  props.children.forEach((child, index) => {
    // Get potential colspan from the child
    const colspan = (child as any).props?.colspan;
    columnId += colspan || 1;
    columns.push({ node: child, colspan });

    if (columnId >= props.columns || props.children.length === index + 1) {
      if (columns.length > 0) {
        rows.push(columns);
      }
      columns = [];
      columnId = 0;
    }
  });

  return (
    <table className={props.className}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={props.trClassName}>
            {row.map((column, j) => (
              <td
                key={j}
                className={props.tdClassName}
                colSpan={column.colspan}
              >
                {column.node}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
