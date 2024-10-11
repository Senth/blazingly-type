import React from "react"

interface TableProps {
  children: React.ReactNode[]
  trClassName?: string
  tdClassName?: string
  className?: string
  columns: number
}

export function Table(props: TableProps): JSX.Element {
  const rows: { node: React.ReactNode; colspan?: number }[][] = []
  let columns: { node: React.ReactNode; colspan?: number }[] = []
  let columnId = 0

  props.children.forEach((child, index) => {
    // Get potential colspan from the child
    let colspan = 1
    const element = child as React.ReactElement
    if (element?.type === "td") {
      colspan = element.props.colSpan || 1
    }

    columnId += colspan || 1
    columns.push({ node: child, colspan })

    if (columnId >= props.columns || props.children.length === index + 1) {
      if (columns.length > 0) {
        rows.push(columns)
      }
      columns = []
      columnId = 0
    }
  })

  return (
    <table className={props.className}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={props.trClassName}>
            {row.map((column, j) => {
              const element = column.node as React.ReactElement
              if (element?.type === "td") {
                return React.cloneElement(element, {
                  key: j,
                  className: `${element.props.className} ${props.tdClassName}`,
                })
              }
              return (
                <td key={j} className={props.tdClassName} colSpan={column.colspan}>
                  {column.node}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
