import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@infra/firebase";
import { X, Info, AlertTriangle, Megaphone, ArrowRight } from "lucide-react";

const TIPO_STYLE = {
  info:    { icon: Info,         bg: "bg-primary/8 border-primary/20",          text: "text-primary",          dot: "bg-primary"          },
  aviso:   { icon: AlertTriangle, bg: "bg-amber-500/8 border-amber-500/20",     text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  destaque:{ icon: Megaphone,    bg: "bg-emerald-500/8 border-emerald-500/20",  text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
};

export function ComunicadosBanner() {
  const [items, setItems]       = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("dismissed_comunicados") ?? "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    const q = query(
      collection(db, "comunicados"),
      where("ativo", "==", true),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, []);

  const visible = items.filter((i) => !dismissed.includes(i.id));
  if (visible.length === 0) return null;

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    sessionStorage.setItem("dismissed_comunicados", JSON.stringify(next));
  };

  return (
    <div className="flex flex-col gap-0">
      {visible.map((item) => {
        const style = TIPO_STYLE[item.tipo] ?? TIPO_STYLE.info;
        const Icon  = style.icon;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-2.5 border-b ${style.bg} animate-in slide-in-from-top-1 duration-200`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${style.text}`} />
            <p className={`flex-1 text-xs font-medium ${style.text}`}>
              {item.titulo && <strong className="mr-1.5">{item.titulo}:</strong>}
              {item.texto}
              {item.link && (
                <a
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-0.5 underline underline-offset-2 hover:opacity-80"
                >
                  Saiba mais <ArrowRight className="w-2.5 h-2.5" />
                </a>
              )}
            </p>
            <button
              onClick={() => dismiss(item.id)}
              className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity ${style.text}`}
              aria-label="Fechar"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
