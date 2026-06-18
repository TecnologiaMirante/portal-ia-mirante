/**
 * ConfirmDialog — Radix AlertDialog estilizado
 *
 * Props:
 *   open           boolean
 *   onOpenChange   (open: boolean) => void
 *   title          string
 *   description    string
 *   confirmLabel   string  (default "Confirmar")
 *   cancelLabel    string  (default "Cancelar")
 *   onConfirm      () => void | Promise<void>
 *   variant        "destructive" | "default"   (default "destructive")
 *   loading        boolean  (mostra spinner no botão confirmar)
 */
import { AlertDialog } from "radix-ui";
import { AlertTriangle, Info, Loader2 } from "lucide-react";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel  = "Confirmar",
  cancelLabel   = "Cancelar",
  onConfirm,
  variant       = "destructive",
  loading       = false,
}) {
  const isDestructive = variant === "destructive";

  const handleConfirm = async () => {
    await onConfirm?.();
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        {/* Backdrop */}
        <AlertDialog.Overlay
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Dialog */}
        <AlertDialog.Content
          className={[
            "fixed left-1/2 top-1/2 z-[101] w-full max-w-sm",
            "-translate-x-1/2 -translate-y-1/2",
            "bg-card border border-border rounded-2xl shadow-2xl p-6",
            "outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-200",
          ].join(" ")}
        >
          {/* Icon */}
          <div className={[
            "w-11 h-11 rounded-2xl flex items-center justify-center mb-4",
            isDestructive
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-primary/10 border border-primary/20",
          ].join(" ")}>
            {isDestructive
              ? <AlertTriangle className="w-5 h-5 text-destructive" />
              : <Info className="w-5 h-5 text-primary" />
            }
          </div>

          {/* Title */}
          <AlertDialog.Title className="font-bold text-foreground text-base leading-snug mb-1.5">
            {title}
          </AlertDialog.Title>

          {/* Description */}
          {description && (
            <AlertDialog.Description className="text-sm text-muted-foreground leading-relaxed mb-6">
              {description}
            </AlertDialog.Description>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60",
                  isDestructive
                    ? "bg-destructive text-white hover:bg-destructive/90 shadow-sm shadow-destructive/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
                ].join(" ")}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
