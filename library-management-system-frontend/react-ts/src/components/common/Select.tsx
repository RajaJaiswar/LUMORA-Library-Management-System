import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps<T extends string | number = string | number> {
  id?: string;
  name?: string;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  options?: SelectOption<T>[];
  children?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  isError?: boolean;
  selectSize?: SelectSize;
  className?: string;
  menuClassName?: string;
  fullWidth?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const sizeStyles: Record<SelectSize, { trigger: string; option: string; text: string }> = {
  sm: {
    trigger: 'h-9 px-3 text-xs gap-1.5',
    option: 'px-3 py-1.5 text-xs',
    text: 'text-xs',
  },
  md: {
    trigger: 'h-11 px-3.5 text-sm gap-2',
    option: 'px-3.5 py-2 text-sm',
    text: 'text-sm',
  },
  lg: {
    trigger: 'h-12 px-4 text-base gap-2.5',
    option: 'px-4 py-2.5 text-base',
    text: 'text-base',
  },
};

export function Select<T extends string | number = string | number>({
  id: explicitId,
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  options: propOptions,
  children,
  placeholder = 'Select an option',
  disabled = false,
  isError = false,
  selectSize = 'sm',
  className = '',
  menuClassName = '',
  fullWidth = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: SelectProps<T>) {
  const generatedId = useId();
  const selectId = explicitId || generatedId;
  const listboxId = `${selectId}-listbox`;

  // Parse children into options if propOptions is not provided
  const parsedOptions = useMemo<SelectOption<T>[]>(() => {
    if (propOptions && propOptions.length > 0) {
      return propOptions;
    }

    const items: SelectOption<T>[] = [];
    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement<{
          value?: T;
          children?: React.ReactNode;
          disabled?: boolean;
        }>(child)
      ) {
        const props = child.props;
        const val = props.value as T;
        const rawLabel = props.children;
        const label =
          typeof rawLabel === 'string' || typeof rawLabel === 'number'
            ? String(rawLabel)
            : String(val ?? '');
        items.push({
          value: val,
          label,
          disabled: Boolean(props.disabled),
        });
      }
    });
    return items;
  }, [propOptions, children]);

  // Internal selection state for controlled / uncontrolled support
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<T>(() => {
    if (controlledValue !== undefined) return controlledValue;
    if (defaultValue !== undefined) return defaultValue;
    if (parsedOptions.length > 0) return parsedOptions[0].value;
    return '' as unknown as T;
  });

  const selectedValue = isControlled ? controlledValue : internalValue;

  // Selected option lookup
  const selectedOption = useMemo(() => {
    return parsedOptions.find((opt) => String(opt.value) === String(selectedValue));
  }, [parsedOptions, selectedValue]);

  // Open/close menu state
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Trigger & Menu Refs for positioning and click-outside
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Position state for portal
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  }>({
    top: 0,
    left: 0,
    width: 0,
    placement: 'bottom',
  });

  // Calculate menu position on open
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = Math.min(parsedOptions.length * 36 + 16, 260);

    const placement: 'bottom' | 'top' =
      spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

    const top =
      placement === 'bottom'
        ? rect.bottom + 4
        : rect.top - estimatedHeight - 4;

    setMenuPosition({
      top: Math.max(8, top),
      left: Math.max(8, rect.left),
      width: Math.max(rect.width, 140),
      placement,
    });
  }, [parsedOptions.length]);

  // Handle open / toggle
  const openMenu = useCallback(() => {
    if (disabled) return;
    updatePosition();
    setIsOpen(true);
    // Highlight currently selected item
    const idx = parsedOptions.findIndex((opt) => String(opt.value) === String(selectedValue));
    setHighlightedIndex(idx >= 0 ? idx : 0);
  }, [disabled, updatePosition, parsedOptions, selectedValue]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, closeMenu, openMenu]);

  // Select an option
  const selectOption = useCallback(
    (option: SelectOption<T>) => {
      if (option.disabled) return;
      if (!isControlled) {
        setInternalValue(option.value);
      }
      onChange?.(option.value);
      closeMenu();
    },
    [isControlled, onChange, closeMenu]
  );

  // Outside click & window scroll/resize listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, closeMenu, updatePosition]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !menuRef.current) return;
    const optionElements = menuRef.current.querySelectorAll<HTMLElement>('[role="option"]');
    const targetElement = optionElements[highlightedIndex];
    if (targetElement) {
      targetElement.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  // Keyboard navigation on trigger button
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < parsedOptions.length) {
            selectOption(parsedOptions[highlightedIndex]);
          }
        } else {
          openMenu();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (next < parsedOptions.length && parsedOptions[next].disabled) {
              next++;
            }
            return next < parsedOptions.length ? next : prev;
          });
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && parsedOptions[next].disabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
        }
        break;

      case 'Home':
        if (isOpen) {
          e.preventDefault();
          const first = parsedOptions.findIndex((opt) => !opt.disabled);
          if (first >= 0) setHighlightedIndex(first);
        }
        break;

      case 'End':
        if (isOpen) {
          e.preventDefault();
          for (let i = parsedOptions.length - 1; i >= 0; i--) {
            if (!parsedOptions[i].disabled) {
              setHighlightedIndex(i);
              break;
            }
          }
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          closeMenu();
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      default:
        // Typeahead support: jump to item starting with pressed letter
        if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
          const char = e.key.toLowerCase();
          const startIndex = isOpen ? highlightedIndex + 1 : 0;
          let matchIndex = parsedOptions.findIndex(
            (opt, i) => i >= startIndex && !opt.disabled && opt.label.toLowerCase().startsWith(char)
          );
          if (matchIndex === -1) {
            matchIndex = parsedOptions.findIndex(
              (opt) => !opt.disabled && opt.label.toLowerCase().startsWith(char)
            );
          }
          if (matchIndex >= 0) {
            if (!isOpen) openMenu();
            setHighlightedIndex(matchIndex);
          }
        }
        break;
    }
  };

  const currentSize = sizeStyles[selectSize];

  return (
    <div className={`relative inline-block ${fullWidth ? 'w-full' : ''}`}>
      {/* Hidden input for form data & standard test accessibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedValue !== undefined ? String(selectedValue) : ''}
        />
      )}

      {/* Styled Trigger Control */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 ? `${selectId}-opt-${highlightedIndex}` : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={isError ? 'true' : undefined}
        className={`flex items-center justify-between rounded-control border bg-surface text-text font-medium shadow-2xs transition-all duration-150 cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 disabled:bg-surface-subtle disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50 ${
          currentSize.trigger
        } ${
          isError
            ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/20'
            : isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border hover:border-slate-300 focus-visible:border-primary focus-visible:ring-primary/20'
        } ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        <span
          className={`truncate block text-left ${
            !selectedOption ? 'text-text-muted font-normal' : 'text-text'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Dropdown Chevron Icon */}
        <span
          className={`shrink-0 text-text-muted transition-transform duration-150 pointer-events-none ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
          aria-hidden="true"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Floating Options Menu (rendered in portal to avoid overflow clipping) */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={selectId}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              zIndex: 9999,
            }}
            className={`max-h-64 overflow-y-auto rounded-control border border-border bg-surface p-1 shadow-popover text-text animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
          >
            {parsedOptions.length === 0 ? (
              <div className="p-3 text-xs text-text-muted text-center">No options available</div>
            ) : (
              parsedOptions.map((opt, index) => {
                const isSelected = String(opt.value) === String(selectedValue);
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${String(opt.value)}-${index}`}
                    id={`${selectId}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                    className={`relative flex items-center justify-between rounded-sm cursor-pointer select-none transition-colors ${
                      currentSize.option
                    } ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed text-text-muted'
                        : isSelected
                        ? 'bg-primary-soft text-primary font-semibold'
                        : isHighlighted
                        ? 'bg-surface-subtle text-text'
                        : 'text-text hover:bg-surface-subtle'
                    }`}
                  >
                    <span className="truncate block mr-2">{opt.label}</span>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <span className="shrink-0 text-primary" aria-hidden="true">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

export default Select;
