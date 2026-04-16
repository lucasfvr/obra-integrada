import { useEffect, useRef, type ReactNode } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}

export function Dropdown({ isOpen, onClose, className, children }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        onClose &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className={className}>
      {children}
    </div>
  );
}
