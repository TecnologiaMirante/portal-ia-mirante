/**
 * PremioInscricoes — /admin/inscricoes
 * Lista em tempo real de inscrições do Prêmio IA salvas no Firestore.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, onSnapshot, deleteDoc, doc, orderBy, query,
} from "firebase/firestore";
import { ref as storageRef, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "@infra/firebase";
import { toast } from "sonner";
import {
  Trophy, Trash2, Eye, Search, X, Loader2,
  User, MapPin, CalendarDays, Users, ChevronRight,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/alert-dialog";

/* ── Status config ───────────────────────────────────────── */
// eslint-disable-next-line react-refresh/only-export-components
export const STATUS_MAP = {
  pendente:   { label: "Pendente",   cls: "bg-amber-500/10   text-amber-600   dark:text-amber-400   border-amber-500/25"   },
  em_analise: { label: "Em análise", cls: "bg-indigo-500/10  text-indigo-600  dark:text-indigo-400  border-indigo-500/25"  },
  aprovado:   { label: "Aprovado",   cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" },
  rejeitado:  { label: "Rejeitado",  cls: "bg-rose-500/10    text-rose-600    dark:text-rose-400    border-rose-500/25"    },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pendente;
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/* ═══════════════════════════════════════════════════════════
   PremioInscricoes
   ═══════════════════════════════════════════════════════════ */
export function PremioInscricoes() {
  const navigate = useNavigate();
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [dialogTarget, setDialogTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  /* ── Listener em tempo real ────────────────────────────── */
  useEffect(() => {
    const q = query(collection(db, "premioInscricoes"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setInscricoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  /* ── Filtros ───────────────────────────────────────────── */
  const term = search.trim().toLowerCase();
  const filtered = inscricoes.filter((i) => {
    const matchSearch = !term || [i.name, i.dept, i.email, ...(i.tools ?? [])].some(
      (f) => f?.toLowerCase().includes(term),
    );
    const matchStatus = statusFilter === "todos" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const byStatus = (s) => inscricoes.filter((i) => (i.status ?? "pendente") === s);

  /* ── Delete ────────────────────────────────────────────── */
  const askDelete = (item) => { setDialogTarget(item); setDialogOpen(true); };
  const handleDelete = async () => {
    if (!dialogTarget) return;
    setDeleting(true);
    const tid = `del-${dialogTarget.id}`;
    toast.loading("Excluindo…", { id: tid });
    try {
      /* 1. Remove arquivos do Storage (pasta premioInscricoes/{id}/) */
      try {
        const folderRef = storageRef(storage, `premioInscricoes/${dialogTarget.id}`);
        const { items } = await listAll(folderRef);
        await Promise.all(items.map((item) => deleteObject(item)));
      } catch (storageErr) {
        /* Pasta pode não existir se não havia arquivos — ignora */
        if (storageErr.code !== "storage/object-not-found") {
          console.warn("[storage delete]", storageErr);
        }
      }

      /* 2. Remove documento do Firestore */
      await deleteDoc(doc(db, "premioInscricoes", dialogTarget.id));
      toast.success("Inscrição e arquivos excluídos", { id: tid });
      setDialogOpen(false);
    } catch (e) {
      toast.error("Erro ao excluir", { id: tid, description: e.message });
    } finally {
      setDeleting(false);
      setDialogTarget(null);
    }
  };

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",       value: inscricoes.length,           color: "text-primary" },
          { label: "Pendentes",   value: byStatus("pendente").length,  color: "text-amber-400" },
          { label: "Em análise",  value: byStatus("em_analise").length, color: "text-indigo-400" },
          { label: "Aprovadas",   value: byStatus("aprovado").length,  color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Header + Filters ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5 flex-wrap">
        <h2 className="font-bold text-foreground text-lg shrink-0">
          Inscrições Prêmio IA
        </h2>

        {/* Search */}
        <div className="relative flex-1 min-w-45">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, área, e-mail…"
            className="w-full h-9 pl-8 pr-8 rounded-xl text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/50 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-xl text-sm bg-card border border-border text-foreground hover:border-primary/40 focus:border-primary outline-none transition-all shrink-0"
        >
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {search && !loading && (
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para{" "}
          <span className="font-medium text-foreground">"{search}"</span>
        </p>
      )}

      {/* ── List ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : inscricoes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Trophy className="w-10 h-10 text-muted-foreground/20" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-muted-foreground">Nenhuma inscrição ainda</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              As inscrições aparecem aqui em tempo real
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Search className="w-8 h-8 text-muted-foreground/20" />
          <div>
            <p className="font-medium text-muted-foreground text-sm">Nenhuma inscrição encontrada</p>
            <button onClick={() => { setSearch(""); setStatusFilter("todos"); }}
              className="text-xs text-primary hover:underline mt-1">
              Limpar filtros
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-600 dark:text-amber-400">
                {initials(item.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm truncate">{item.name}</span>
                  <StatusBadge status={item.status ?? "pendente"} />
                  {item.score != null && (
                    <span className="text-[10px] font-bold text-primary">
                      {item.score} pts
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {item.dept && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" />{item.dept}
                    </span>
                  )}
                  {item.email && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <User className="w-2.5 h-2.5" />{item.email}
                    </span>
                  )}
                  {item.createdAt && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CalendarDays className="w-2.5 h-2.5" />{fmtDate(item.createdAt)}
                    </span>
                  )}
                  {item.hasCoautor && (
                    <span className="flex items-center gap-1 text-[10px] text-indigo-500 dark:text-indigo-400">
                      <Users className="w-2.5 h-2.5" />+ {item.coautorName || "coautor"}
                    </span>
                  )}
                </div>
                {(item.tools ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(item.tools ?? []).slice(0, 4).map((t) => (
                      <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-primary/5 border-primary/20 text-primary">
                        {t}
                      </span>
                    ))}
                    {item.toolOther && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-primary/5 border-primary/20 text-primary">
                        {item.toolOther}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => navigate(`/admin/inscricoes/${item.id}`)}
                  title="Ver detalhes"
                  className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => askDelete(item)}
                  title="Excluir"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && inscricoes.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground/30 mt-6">
          {inscricoes.length} inscrição{inscricoes.length !== 1 ? "ões" : ""} registrada{inscricoes.length !== 1 ? "s" : ""}
        </p>
      )}

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(v) => { if (!deleting) setDialogOpen(v); }}
        title="Excluir inscrição?"
        description={
          dialogTarget
            ? `A inscrição de "${dialogTarget.name}" será removida permanentemente. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        loading={deleting}
        variant="destructive"
      />
    </>
  );
}
