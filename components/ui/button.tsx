import React from 'react';
type ButtonHTMLAttributes<T> = React.ButtonHTMLAttributes<T>;

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
