import { cn } from "@/lib/utils";

function Label({ className, required, children, ...props }) {
  return (
    <label
      data-slot="label"
      className={cn(
        "block text-xs font-semibold uppercase tracking-wider",
        "text-muted-foreground select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-destructive" aria-hidden="true">*</span>
      )}
    </label>
  );
}

export { Label };
