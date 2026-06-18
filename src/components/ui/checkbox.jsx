import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer h-4.5 w-4.5 shrink-0 rounded-md border border-border",
        "bg-background shadow-sm outline-none cursor-pointer",
        "transition-[color,border-color,box-shadow,background-color] duration-150",
        "hover:border-primary/50 hover:bg-accent/30",
        "focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="h-3 w-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
