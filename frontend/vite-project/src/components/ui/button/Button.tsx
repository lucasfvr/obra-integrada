import React, { ReactNode } from "react";
import { useAuth } from "../../../hooks/useAuth.js";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  form?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  form,
}) => {
  const { isImpersonating } = useAuth();
  
  // No modo impersonar, botões de ação são desativados por padrão para segurança visual
  const isDisabled = disabled || isImpersonating;

  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  const variantClasses = {
    primary: "bg-indigo-600 text-white shadow-theme-xs hover:bg-indigo-700 disabled:bg-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-700",
    outline: "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]",
    danger:  "bg-rose-600 text-white shadow-theme-xs hover:bg-rose-700 disabled:bg-rose-300",
  };

  return (
    <button
      type={type}
      form={form}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        isDisabled ? "cursor-not-allowed opacity-50 grayscale-[0.5]" : ""
      }`}
      onClick={(e) => !isDisabled && onClick?.(e)}
      disabled={isDisabled}
      title={isImpersonating ? "Ações bloqueadas no modo de visualização" : ""}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
