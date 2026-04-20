"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

const sizeClasses = {
  sm: "h-8 px-4 text-xs",
  md: "h-10 px-6 text-sm",
  lg: "h-12 px-8 text-base"
};

const variantClasses = {
  primary: cn(
    "bg-[var(--ll-accent)] text-[var(--ll-text-inverse)] font-semibold",
    "hover:bg-[var(--ll-accent-hover)] shadow-[0_0_20px_rgba(45,212,191,0.25)] hover:shadow-[0_0_32px_rgba(45,212,191,0.45)]"
  ),
  secondary: cn(
    "bg-transparent border border-[var(--ll-border-default)] text-[var(--ll-text-primary)] font-medium",
    "hover:border-[var(--ll-accent-border)] hover:text-[var(--ll-accent)] hover:shadow-[var(--ll-glow-accent)]"
  ),
  ghost: cn(
    "bg-transparent text-[var(--ll-text-secondary)] font-medium",
    "hover:text-[var(--ll-text-primary)] hover:bg-[var(--ll-bg-elevated)]"
  )
};

export function GlowButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  type = "button",
  disabled,
  onClick
}: GlowButtonProps) {
  const reduceMotion = useReducedMotion();
  const base = cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--ll-radius-md)] font-[var(--ll-font-ui)] tracking-[-0.01em] transition-all duration-200 cursor-pointer select-none outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--ll-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ll-bg-base)]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  const motionTapHover = reduceMotion
    ? {}
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.15, ease: "easeOut" as const }
      };

  return (
    <motion.button
      type={type}
      {...(disabled !== undefined ? { disabled } : {})}
      {...(onClick !== undefined ? { onClick } : {})}
      className={base}
      {...motionTapHover}
    >
      {children}
    </motion.button>
  );
}
