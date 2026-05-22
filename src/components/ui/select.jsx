import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Root ─────────────────────────────────────────────────── */
function Select(props) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

/* ── Trigger ─────────────────────────────────────────────── */
function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // base
        "group flex h-10 w-full items-center justify-between gap-2",
        "rounded-xl border border-border bg-background",
        "px-3.5 py-2 text-sm text-foreground",
        "shadow-sm outline-none cursor-pointer",
        "transition-[color,border-color,box-shadow,background-color] duration-200",
        // placeholder styling
        "[&>[data-placeholder]]:text-muted-foreground/45",
        // hover
        "hover:border-primary/40 hover:bg-accent/40",
        // focus
        "focus:border-primary/60 focus:ring-4 focus:ring-primary/10",
        // dark
        "dark:bg-input/30 dark:border-input",
        "dark:hover:bg-input/50 dark:hover:border-primary/35",
        "dark:focus:ring-primary/15",
        // disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground/60",
            "transition-transform duration-200",
            "group-data-[state=open]:rotate-180",
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/* ── Value (placeholder) ─────────────────────────────────── */
function SelectValue(props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/* ── Scroll buttons ──────────────────────────────────────── */
function SelectScrollUpButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex cursor-default items-center justify-center py-1.5 text-muted-foreground/60",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex cursor-default items-center justify-center py-1.5 text-muted-foreground/60",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

/* ── Content (dropdown panel) ────────────────────────────── */
function SelectContent({ className, children, position = "popper", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          // base
          "relative z-50 overflow-hidden",
          "min-w-[var(--radix-select-trigger-width)]",
          "max-h-[min(var(--radix-select-content-available-height),320px)]",
          "rounded-2xl border border-border",
          "bg-popover text-popover-foreground",
          "shadow-xl shadow-black/10 dark:shadow-black/30",
          // animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          // popper offset
          position === "popper" && [
            "data-[side=bottom]:translate-y-1",
            "data-[side=top]:-translate-y-1",
          ],
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/* ── Item ────────────────────────────────────────────────── */
function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center",
        "rounded-lg py-2 pl-3 pr-9 text-sm text-foreground outline-none",
        "transition-colors duration-100",
        // hover / focus
        "hover:bg-primary/8 hover:text-foreground",
        "focus:bg-primary/10 focus:text-foreground",
        // checked
        "data-[state=checked]:font-medium data-[state=checked]:text-primary",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className,
      )}
      {...props}
    >
      {/* Check mark */}
      <span className="absolute right-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5 text-primary" strokeWidth={2.5} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/* ── Group + Label ───────────────────────────────────────── */
function SelectGroup(props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50",
        className,
      )}
      {...props}
    />
  );
}

/* ── Separator ───────────────────────────────────────────── */
function SelectSeparator({ className, ...props }) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1.5 h-px bg-border/60", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
