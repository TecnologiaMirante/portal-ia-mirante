/**
 * DatePicker
 * Props:
 *   value      — string "YYYY-MM-DD" or ""
 *   onChange   — (string "YYYY-MM-DD") => void
 *   placeholder — string (default "Selecione uma data")
 *   disabled   — bool
 */
import * as React from "react";
import { CalendarDays, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/* ── helpers ──────────────────────────────────────────────── */

/** "YYYY-MM-DD" → Date (local, avoids UTC off-by-one) */
function strToDate(str) {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Date → "YYYY-MM-DD" */
function dateToStr(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → "12 de maio de 2025" */
const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
function formatDisplay(str) {
  const d = strToDate(str);
  return d ? fmt.format(d) : "";
}

/* ── Component ────────────────────────────────────────────── */
export function DatePicker({
  value = "",
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const selected = strToDate(value);

  function handleSelect(date) {
    onChange?.(date ? dateToStr(date) : "");
    setOpen(false);
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange?.("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            // same visual language as Input
            "group flex h-10 w-full items-center gap-2.5",
            "rounded-xl border border-border bg-background",
            "px-3.5 text-sm text-left",
            "shadow-sm outline-none cursor-pointer",
            "transition-[color,border-color,box-shadow,background-color] duration-200",
            // hover
            "hover:border-primary/40 hover:bg-accent/40",
            // open/focus
            "data-[state=open]:border-primary/60 data-[state=open]:ring-4 data-[state=open]:ring-primary/10",
            // dark
            "dark:bg-input/30 dark:border-input",
            "dark:hover:bg-input/50 dark:hover:border-primary/35",
            "dark:data-[state=open]:ring-primary/15",
            // disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          {/* calendar icon */}
          <CalendarDays
            className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              value ? "text-primary" : "text-muted-foreground/50",
            )}
          />

          {/* label / placeholder */}
          <span className={cn("flex-1 truncate", !value && "text-muted-foreground/45")}>
            {value ? formatDisplay(value) : placeholder}
          </span>

          {/* clear button or chevron */}
          {value ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e)}
              className="flex items-center justify-center w-5 h-5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors shrink-0"
              aria-label="Limpar data"
            >
              <X className="w-3 h-3" />
            </span>
          ) : (
            <span className="text-muted-foreground/30 text-xs shrink-0">▼</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected ?? new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
