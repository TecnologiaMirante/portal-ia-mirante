import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        /* layout */
        months:          "flex flex-col gap-4",
        month:           "flex flex-col gap-3",
        month_caption:   "flex items-center justify-between px-1 py-1",
        caption_label:   "text-sm font-semibold text-foreground capitalize",
        nav:             "flex items-center gap-1",

        /* nav buttons */
        button_previous: cn(
          "flex items-center justify-center w-7 h-7 rounded-lg",
          "text-muted-foreground hover:text-foreground hover:bg-accent",
          "border border-transparent hover:border-border",
          "transition-colors duration-150 cursor-pointer",
        ),
        button_next: cn(
          "flex items-center justify-center w-7 h-7 rounded-lg",
          "text-muted-foreground hover:text-foreground hover:bg-accent",
          "border border-transparent hover:border-border",
          "transition-colors duration-150 cursor-pointer",
        ),

        /* grid */
        month_grid: "w-full border-collapse",
        weekdays:   "flex mb-1",
        weekday:    "w-9 text-[10px] font-semibold text-muted-foreground/50 text-center uppercase tracking-wider py-1",
        week:       "flex w-full mt-0.5",

        /* day cells */
        day: cn(
          "relative p-0 text-center",
          "focus-within:relative focus-within:z-20",
        ),
        day_button: cn(
          "flex items-center justify-center w-9 h-9 rounded-xl",
          "text-sm font-medium text-foreground",
          "transition-all duration-150 cursor-pointer",
          "hover:bg-primary/10 hover:text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ),

        /* states */
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:shadow-sm [&>button]:shadow-primary/25",
        today:
          "[&>button:not([aria-selected])]:bg-accent [&>button:not([aria-selected])]:text-foreground [&>button:not([aria-selected])]:font-bold",
        outside:
          "text-muted-foreground/30 [&>button]:text-muted-foreground/30 [&>button]:hover:bg-transparent [&>button]:hover:text-muted-foreground/50",
        disabled:
          "text-muted-foreground/20 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
        range_middle:
          "[&>button]:rounded-none [&>button]:bg-primary/10 [&>button]:text-foreground",
        range_start:
          "[&>button]:rounded-l-xl [&>button]:rounded-r-none",
        range_end:
          "[&>button]:rounded-r-xl [&>button]:rounded-l-none",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeft className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />,
      }}
      {...props}
    />
  );
}
