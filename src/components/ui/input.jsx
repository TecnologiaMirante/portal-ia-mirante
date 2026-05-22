import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base
        "flex h-10 w-full min-w-0 rounded-xl border border-border",
        "bg-background px-3.5 py-2 text-sm text-foreground",
        "shadow-sm transition-[color,border-color,box-shadow,background-color] duration-200",
        "outline-none",
        // placeholder
        "placeholder:text-muted-foreground/45",
        // hover
        "hover:border-primary/40 hover:bg-accent/40",
        // focus
        "focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10",
        // date icon theming
        "dark:bg-input/30 dark:border-input",
        "dark:hover:bg-input/50 dark:hover:border-primary/35",
        "dark:focus-visible:ring-primary/15",
        // date-specific: color-scheme drives native picker theme
        "[type=date]:cursor-pointer",
        "[type=date]:color-scheme-light dark:[type=date]:color-scheme-dark",
        // calendar icon
        "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
        "[&::-webkit-calendar-picker-indicator]:opacity-50",
        "[&::-webkit-calendar-picker-indicator]:rounded",
        "[&::-webkit-calendar-picker-indicator]:transition-opacity",
        "[&::-webkit-calendar-picker-indicator]:hover:opacity-100",
        "dark:[&::-webkit-calendar-picker-indicator]:invert",
        // disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
