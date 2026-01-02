"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Switch({
  checked = false,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={(event) => {
        props.onClick?.(event);
        if (disabled) return;
        onCheckedChange?.(!checked);
      }}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        "data-[state=checked]:bg-primary/70 data-[state=unchecked]:bg-primary/20 dark:data-[state=unchecked]:bg-primary/40",
        className
      )}
      {...props}>
      <span
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "pointer-events-none absolute h-5 w-5 rounded-full bg-background shadow transition",
          checked ? "right-0.5" : "left-0.5"
        )}
      />
    </button>
  );
}
