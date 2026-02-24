export function NumberInput(props: {
  value?: number
  onChange: (newValue: number) => void
  id?: string
  name?: string
  className?: string
  min?: number
  positive?: boolean
  srOnlyLabel?: string
}) {
  return (
    <>
      {props.srOnlyLabel && (
        <label htmlFor={props.id} className="sr-only">
          {props.srOnlyLabel}
        </label>
      )}
      <input
        id={props.id}
        name={props.name}
        type="number"
        min={props.min ?? (props.positive ? 0 : undefined)}
        className={
          "input-base input-compact text-center" + (props.className ? " " + props.className : "")
        }
        value={props.value}
        onChange={(e) => props.onChange(parseInt(e.target.value) || 0)}
      />
    </>
  )
}