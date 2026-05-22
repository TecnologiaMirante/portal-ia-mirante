import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-border",
        "bg-background px-3.5 py-2.5 text-sm text-foreground",
        "shadow-sm transition-[color,border-color,box-shadow,background-color] duration-200",
        "outline-none resize-none",
        "placeholder:text-muted-foreground/45",
        "hover:border-primary/40 hover:bg-accent/40",
        "focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10",
        "dark:bg-input/30 dark:border-input",
        "dark:hover:bg-input/50 dark:hover:border-primary/35",
        "dark:focus-visible:ring-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
