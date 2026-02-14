export function PlusButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="btn btn--secondary fg-eon-red flex items-center gap-1"
      onClick={onClick}
      type="button"
    >
      Lägg till
      <svg aria-hidden="true" className="stroke-current h-6 w-6" viewBox="0 0 100 100">
        <line strokeWidth="5" x1="32.5" x2="67.5" y1="50" y2="50"></line>
        <line strokeWidth="5" x1="50" x2="50" y1="32.5" y2="67.5"></line>
      </svg>
    </button>
  )
}

export function MinusButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="btn btn--ghost fg-eon-red px-1"
      onClick={onClick}
      title="Ta bort"
      type="button"
    >
      <svg aria-hidden="true" className="stroke-current h-5 w-5" viewBox="0 0 100 100">
        <line strokeWidth="5" x1="32.5" x2="67.5" y1="50" y2="50"></line>
      </svg>
    </button>
  )
}