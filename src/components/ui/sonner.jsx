import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";

export function Toaster() {
  const { dark } = useTheme();

  return (
    <SonnerToaster
      theme={dark ? "dark" : "light"}
      position="bottom-right"
      richColors
      expand
      gap={8}
      duration={4000}
      style={{
        "--normal-bg":           "var(--card)",
        "--normal-text":         "var(--card-foreground)",
        "--normal-border":       "var(--border)",
        "--success-bg":          "var(--card)",
        "--success-text":        "var(--card-foreground)",
        "--success-border":      "var(--border)",
        "--error-bg":            "var(--card)",
        "--error-text":          "var(--card-foreground)",
        "--error-border":        "var(--border)",
        "--border-radius":       "0.875rem",
        "--toast-shadow":        "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
      }}
      toastOptions={{
        classNames: {
          toast:       "!font-sans !text-sm !shadow-xl",
          title:       "!font-semibold",
          description: "!text-muted-foreground !text-xs !mt-0.5",
          icon:        "!mt-0.5",
          closeButton: "!rounded-lg !border-border",
          actionButton:"!rounded-lg !text-xs !font-semibold",
          cancelButton:"!rounded-lg !text-xs",
          loader:      "!text-primary",
          success:     "!border-emerald-500/20 [&_[data-icon]]:!text-emerald-500",
          error:       "!border-destructive/20 [&_[data-icon]]:!text-destructive",
          warning:     "!border-amber-500/20 [&_[data-icon]]:!text-amber-500",
          info:        "!border-primary/20 [&_[data-icon]]:!text-primary",
        },
      }}
    />
  );
}
