/**
 * LogoMirante — troca automaticamente entre claro e escuro conforme o tema.
 *
 * Props:
 *   className   string   — classes Tailwind (ex: "h-10 w-auto")
 *   alt         string   — texto alternativo (default "Mirante")
 */
import logoClaro  from "@/assets/logo_intranet_claro.png";
import logoEscuro from "@/assets/logo_intranet_escuro.png";
import { useTheme } from "@/hooks/useTheme";

export function LogoMirante({ className = "h-8 w-auto object-contain", alt = "Mirante" }) {
  const { dark } = useTheme();
  return (
    <img
      src={dark ? logoEscuro : logoClaro}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}
