import { ReactNode, useState } from "react"

export function TogglableSection(props: {
  children?: ReactNode
  id?: string
  isCollapsed?: boolean
  name: string
}) {
  const [isCollapsed, setCollapsed] = useState(
    props.isCollapsed === undefined ? false : props.isCollapsed,
  )
  const sectionKey =
    props.id ||
    props.name
      .toLowerCase()
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-z0-9-]/g, "")
  const sectionContentId = `${sectionKey}-content`
  const collapsedStatus = isCollapsed ? "▸" : "▾"

  return (
    <div className="section-card">
      <h2>
        <button
          aria-controls={sectionContentId}
          aria-expanded={!isCollapsed}
          className="section-toggle btn btn--ghost"
          onClick={() => setCollapsed(!isCollapsed)}
          type="button"
        >
          <span>{props.name}</span>
          <span className="section-toggle-status" aria-hidden="true">
            {collapsedStatus}
          </span>
        </button>
      </h2>
      <div id={sectionContentId} className={`section-content ${isCollapsed ? "is-collapsed" : ""}`}>
        {props.children}
      </div>
    </div>
  )
}