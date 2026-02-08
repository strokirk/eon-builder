export function PlusButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="fg-eon-red flex items-center border pl-2 rounded-md"
      onClick={onClick}
      type="button"
    >
      Lägg till
      <svg aria-hidden="true" className="stroke-current h-8 w-8" viewBox="0 0 100 100">
        <line strokeWidth="5" x1="32.5" x2="67.5" y1="50" y2="50"></line>
        <line strokeWidth="5" x1="50" x2="50" y1="32.5" y2="67.5"></line>
      </svg>
    </button>
  )
}

export function MinusButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="fg-eon-red" onClick={onClick} title="Ta bort" type="button">
      <svg className="stroke-current h-8 w-8" viewBox="0 0 100 100">
        <line strokeWidth="5" x1="32.5" x2="67.5" y1="50" y2="50"></line>
      </svg>
    </button>
  )
}