import { ReactNode, useState } from "react"

export function TogglableSection(props: {
  children?: ReactNode
  isCollapsed?: boolean
  name: string
}) {
  const [isCollapsed, setCollapsed] = useState(
    props.isCollapsed === undefined ? false : props.isCollapsed,
  )
  let hidden = isCollapsed ? { style: { display: "none" } } : {}
  let collapsedStatus = isCollapsed ? " ▸" : " ▾"
  return (
    <div>
      <h2>
        <button onClick={() => setCollapsed(!isCollapsed)} type="button">
          {props.name}
          {collapsedStatus}
        </button>
      </h2>
      <div {...hidden}>{props.children}</div>
    </div>
  )
}