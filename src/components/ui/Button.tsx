"use client";

import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "link";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  withArrow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      withArrow = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150 rounded-pill focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const sizeStyles = {
      sm: "h-9 px-4 text-xs tracking-tight",
      md: "h-11 px-5 text-sm tracking-tight",
      lg: "h-12 px-6 text-base tracking-tight",
    };

    let variantStyles = "";
    if (variant === "primary") {
      variantStyles =
        "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm";
    } else if (variant === "secondary") {
      variantStyles =
        "bg-transparent border border-border-strong text-text hover:bg-bg-subtle active:scale-[0.98]";
    } else if (variant === "tertiary" || variant === "link") {
      variantStyles =
        "bg-transparent text-text hover:text-accent p-0 h-auto font-normal group inline-flex items-center gap-1.5";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variant !== "tertiary" && variant !== "link" ? sizeStyles[size] : ""} ${variantStyles} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Loading...</span>
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
            {children}
            {withArrow && (
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-150 group-hover:translate-x-1" />
            )}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
