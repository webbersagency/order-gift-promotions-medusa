import {EllipseMiniSolid, Plus, TrianglesMini, XMarkMini} from "@medusajs/icons"
import {clx, Text} from "@medusajs/ui"
import {
  ComponentPropsWithoutRef,
  CSSProperties,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import * as Popover from "@radix-ui/react-popover"

interface Option {
  id: string
  value: string
}

interface ComboboxProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "value" | "defaultValue" | "onChange"
  > {
  value: string | string[]
  onChange: (value: string | string[]) => void
  options?: Option[]
  onSearch?: (query: string) => void
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  onCreateOption?: (value: string) => void
  isLoading?: boolean
  multiple?: boolean
}

const TABLUAR_NUM_WIDTH = 8
const TAG_BASE_WIDTH = 28

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      value,
      onChange,
      className,
      options = [],
      onSearch,
      searchValue = "",
      onSearchValueChange,
      onCreateOption,
      isLoading = false,
      multiple = false,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLInputElement>(null)

    useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      ref,
      () => innerRef.current,
      []
    )

    const [open, setOpen] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState<number>(-1)

    const selectedValues = multiple
      ? Array.isArray(value)
        ? value
        : []
      : Array.isArray(value)
        ? []
        : value
          ? [value]
          : []

    const sortedOptions = useMemo(() => {
      return [...options].sort((a, b) => {
        const isSelectedA = selectedValues.includes(a.id)
        const isSelectedB = selectedValues.includes(b.id)

        if (isSelectedA && !isSelectedB) return -1
        if (!isSelectedA && isSelectedB) return 1
        return 0
      })
    }, [options, selectedValues])

    const handleSelect = useCallback(
      (option: Option) => {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault()
          e.stopPropagation()

          if (multiple) {
            if (isSelected(selectedValues, option.id)) {
              onChange(selectedValues.filter((v) => v !== option.id))
            } else {
              onChange([...selectedValues, option.id])
            }
          } else {
            onChange(option.id)
            handleOpenChange(false)
          }

          innerRef.current?.focus()
        }
      },
      [value, onChange, multiple, selectedValues]
    )

    function handleOpenChange(open: boolean) {
      if (!open) {
        onSearchValueChange?.("")
      }

      if (open) {
        requestAnimationFrame(() => {
          innerRef.current?.focus()
        })
      }

      setOpen(open)
    }

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault()
      onChange(multiple ? [] : "")
    }

    const showTag = selectedValues.length > 0
    const showSelected = !open && selectedValues.length > 0

    const tagWidth = useMemo(() => {
      const count = selectedValues.length
      const digits = count.toString().length

      return TAG_BASE_WIDTH + digits * TABLUAR_NUM_WIDTH
    }, [selectedValues])

    const selectedOption = !multiple && options.find((opt) => opt.id === value)

    return (
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Anchor
          asChild
          onClick={() => {
            if (!open) {
              handleOpenChange(true)
            }
          }}
        >
          <div
            data-anchor
            className={clx(
              "relative flex cursor-pointer items-center gap-x-2 overflow-hidden",
              "h-8 w-full rounded-md",
              "bg-ui-bg-field transition-fg shadow-borders-base",
              "has-[input:focus]:shadow-borders-interactive-with-active",
              "has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error",
              "has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed",
              {
                "shadow-borders-interactive-with-active": open,
              },
              className
            )}
            style={
              {
                "--tag-width": `${tagWidth}px`,
              } as CSSProperties
            }
          >
            {multiple && showTag && (
              <button
                type="button"
                onClick={handleClear}
                className="bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute left-0.5 top-0.5 flex h-[28px] items-center rounded-[4px] border py-[3px] pl-1.5 pr-1 outline-none"
              >
                <span className="tabular-nums">{selectedValues.length}</span>
                <XMarkMini className="text-ui-fg-muted" />
              </button>
            )}
            {!multiple && selectedOption && !open && (
              <div className="pointer-events-none absolute inset-y-0 left-2 flex size-full items-center">
                <Text size="small" leading="compact">
                  {selectedOption.value}
                </Text>
              </div>
            )}
            {multiple && showSelected && (
              <div className="pointer-events-none absolute inset-y-0 left-[calc(var(--tag-width)+8px)] flex size-full items-center">
                <Text size="small" leading="compact">
                  Selected
                </Text>
              </div>
            )}
            <input
              ref={innerRef}
              className={clx(
                "txt-compact-small size-full cursor-pointer appearance-none bg-transparent pr-8 outline-none",
                "hover:bg-ui-bg-field-hover",
                "focus:cursor-text",
                "placeholder:text-ui-fg-muted",
                {
                  "pl-2": !showTag && (!selectedOption || open),
                  "pl-[calc(var(--tag-width)+8px)]": multiple && showTag,
                  invisible: !multiple && selectedOption && !open,
                }
              )}
              value={searchValue}
              onChange={(e) => onSearchValueChange?.(e.target.value)}
              {...props}
            />
            <button
              type="button"
              onClick={() => handleOpenChange(true)}
              className="text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute right-0 flex size-8 items-center justify-center rounded-r outline-none"
            >
              <TrianglesMini className="text-ui-fg-muted" />
            </button>
          </div>
        </Popover.Anchor>
        <Popover.Content
          sideOffset={4}
          role="listbox"
          className={clx(
            "shadow-elevation-flyout bg-ui-bg-base -left-2 z-50 w-[var(--radix-popper-anchor-width)] rounded-[8px]",
            "max-h-[200px] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          onInteractOutside={(e) => {
            e.preventDefault()
            const target = e.target as HTMLElement
            if (target.closest("[data-anchor]")) {
              return
            }
            handleOpenChange(false)
          }}
        >
          <div className="p-1">
            {sortedOptions.length > 0 ? (
              <>
                {sortedOptions.map((option, index) => (
                  <div
                    key={option.id}
                    className={clx(
                      "transition-fg bg-ui-bg-base grid cursor-pointer grid-cols-1 items-center gap-2 overflow-hidden"
                    )}
                  >
                    <button
                      data-active={focusedIndex === index}
                      type="button"
                      role="option"
                      className={clx(
                        "grid h-full w-full appearance-none grid-cols-[20px_1fr] items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left outline-none",
                        "data-[active=true]:bg-ui-bg-field-hover"
                      )}
                      onClick={handleSelect(option)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      onMouseLeave={() => setFocusedIndex(-1)}
                      tabIndex={-1}
                    >
                      <div className="flex size-5 items-center justify-center">
                        {isSelected(selectedValues, option.id) && (
                          <EllipseMiniSolid />
                        )}
                      </div>
                      <Text
                        as="span"
                        size="small"
                        leading="compact"
                        className="w-full truncate"
                      >
                        {option.value}
                      </Text>
                    </button>
                  </div>
                ))}
                {searchValue && onCreateOption && (
                  <button
                    onClick={() => onCreateOption(searchValue)}
                    className="font-normal font-sans txt-small px-2 py-1 flex items-center gap-2"
                  >
                    <Plus />
                    Create {searchValue}
                  </button>
                )}
              </>
            ) : (
              <div
                className={
                  "font-normal font-sans txt-small px-2 py-1 flex flex-col gap-2"
                }
              >
                <p className="text-ui-fg-muted">No results</p>
                {searchValue && onCreateOption && (
                  <button
                    onClick={() => onCreateOption(searchValue)}
                    className="flex items-center gap-2"
                  >
                    <Plus />
                    Create {searchValue}
                  </button>
                )}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Root>
    )
  }
)

Combobox.displayName = "Combobox"

function isSelected(values: string[], value: string): boolean {
  return values?.includes(value)
}
