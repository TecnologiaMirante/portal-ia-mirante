import { ExternalLink, ShieldCheck } from "lucide-react";
import { LogoMirante } from "@/components/LogoMirante";

const footerLinks = [
  {
    title: "Portal",
    links: [
      { label: "Recursos", href: "#recursos" },
      { label: "Ferramentas", href: "#ferramentas" },
      { label: "Portais IA", href: "#implementacoes" },
      { label: "Criações", href: "#criacoes" },
      { label: "Banco de Prompts", href: "#banco-prompts" },
      { label: "Prêmio IA", href: "#premio-ia" },
    ],
  },
  {
    title: "Ferramentas",
    links: [
      { label: "ChatGPT", href: "https://chatgpt.com", external: true },
      { label: "Claude", href: "https://claude.ai", external: true },
      { label: "Gemini", href: "https://gemini.google.com", external: true },
      {
        label: "Google AI Studio",
        href: "https://aistudio.google.com",
        external: true,
      },
      { label: "HeyGen", href: "https://www.heygen.com", external: true },
      { label: "ElevenLabs", href: "https://elevenlabs.io", external: true },
      { label: "Suno", href: "https://suno.com", external: true },
      {
        label: "Veo",
        href: "https://labs.google/fx/pt/tools/flow",
        external: true,
      },
      { label: "Gamma", href: "https://gamma.app", external: true },
      {
        label: "NotebookLM",
        href: "https://notebooklm.google.com",
        external: true,
      },
    ],
  },
  {
    title: "Portais Mirante",
    links: [
      {
        label: "PDMI — Mara",
        href: "https://pdmi.onrender.com",
        external: true,
      },
      {
        label: "Mira Creative",
        href: "https://miracreative.vercel.app",
        external: true,
      },
      {
        label: "Produtos e Soluções",
        href: "http://produtosesolucoes.mirante.com.br",
        external: true,
      },
      {
        label: "Banco de Prompts",
        href: "https://bancodeprompts-mirante.onrender.com",
        external: true,
      },
    ],
  },
  {
    title: "Empresa",
    links: [
      {
        label: "Intranet",
        href: "https://intranet.mirante.com.br/",
        external: true,
      },
      { label: "Imirante", href: "https://imirante.com", external: true },
      { label: "Contato", href: "mailto:team@mirante.com.br" },
    ],
  },
];

export function Footer({ onOpenPolicy }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <LogoMirante className="h-10 w-auto object-contain opacity-90" />
              <span className="font-semibold text-foreground">
                Mirante <span className="gradient-text font-bold">IA</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-50">
              O portal de Inteligência Artificial da Mirante — para equipes que
              fazem mais.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                {col.title}
              </span>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink className="w-3 h-3 opacity-40" />
                      )}
                    </a>
                  </li>
                ))}
                {/* Botão Política de IA — só na coluna Empresa */}
                {col.title === "Empresa" && (
                  <li>
                    <button
                      onClick={onOpenPolicy}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Política de IA
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} Mirante. Portal IA — uso interno.
          </p>
          <p className="text-xs text-muted-foreground">
            Desenvolvido pelo time de IA Mirante
          </p>
        </div>
      </div>
    </footer>
  );
}
