import { Link } from "react-router";
import type { ReactNode } from "react";

interface DropdownItemProps {
  tag?: "a" | "button";
  to?: string;
  className?: string;
  onItemClick?: () => void;
  children: ReactNode;
}

export function DropdownItem({
  tag,
  to,
  className,
  onItemClick,
  children,
}: DropdownItemProps) {
  if (tag === "a" && to) {
    return (
      <a href={to} className={className} onClick={onItemClick}>
        {children}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={className} onClick={onItemClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onItemClick}
    >
      {children}
    </button>
  );
}
