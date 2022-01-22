import classNames from "classnames"
import { useCombobox } from "downshift"
import { useState } from "react"

export function DropdownCombobox({
  className,
  items,
  onChange,
  value,

  placeholder,
}: {
  className?: string
  items: string[]
  placeholder?: string
  value?: string
  onChange?: (changes: string) => void
}) {
  const [inputItems, setInputItems] = useState(items)
  const {
    getComboboxProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    highlightedIndex,
    isOpen,
    openMenu,
  } = useCombobox({
    initialInputValue: value,
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      // @ts-expect-error
      onChange?.(inputValue)
      setInputItems(
        items.filter((item) =>
          // @ts-expect-error
          item.toLowerCase().startsWith(inputValue.toLowerCase()),
        ),
      )
    },
  })

  return (
    <div className="relative flex-1">
      <div {...getComboboxProps()} className="w-full h-full">
        <input
          className={classNames(className, " w-full h-full px-2")}
          placeholder={placeholder}
          {...getInputProps({
            onFocus() {
              openMenu()
            },
          })}
        />
      </div>
      <ul
        {...getMenuProps()}
        className={classNames(
          isOpen && "absolute bg-white border p-2 top-10 z-10 space-y-1",
        )}
      >
        {isOpen &&
          inputItems.map((item, index) => {
            return (
              <li
                key={`${item}${index}`}
                style={
                  highlightedIndex === index
                    ? { backgroundColor: "#bde4ff" }
                    : {}
                }
                {...getItemProps({ item, index })}
              >
                {item}
              </li>
            )
          })}
      </ul>
    </div>
  )
}
