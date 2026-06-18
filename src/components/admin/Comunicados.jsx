import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "@infra/firebase";
import { toast } from "sonner";
import {
  Plus, Trash2, Edit2, Check, X, Eye, EyeOff, Megaphone,
  Info, AlertTriangle, Loader2,
} from "lucide-react";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const TIPOS = [
  { value: "info",     label: "Informativo", icon: Info },
  { value: "aviso",    label: "Aviso",       icon: AlertTriangle },
  { value: "destaque", label: "Destaque",    icon: Megaphone },
];

const EMPTY = { titulo: "", texto: "", tipo: "info", link: "", ativo: true };

const TIPO_STYLE = {
  info:     "text-primary bg-primary/8 border-primary/20",
  aviso:    "text-amber-600 dark:text-amber-400 bg-amber-500/8 border-amber-500/20",
  destaque: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 border-emerald-500/20",
};

/* ── Field wrapper ────────────────────────────────────────── */
function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

/* ── Inline form (new or edit) ────────────────────────────── */
function ComunicadoForm({ initial = EMPTY, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Título (opcional)">
          <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Novo recurso" />
        </Field>
        <Field label="Tipo">
          <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Mensagem" >
        <Textarea
          required
          rows={2}
          value={form.texto}
          onChange={(e) => set("texto", e.target.value)}
          placeholder="Texto do comunicado…"
        />
      </Field>

      <Field label="Link (opcional)" hint="URL interna (/noticias) ou externa (https://…)">
        <Input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://… ou /pagina" />
      </Field>

      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Ativo toggle */}
        <button
          type="button"
          onClick={() => set("ativo", !form.ativo)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${form.ativo ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/8" : "text-muted-foreground border-border"}`}
        >
          {form.ativo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {form.ativo ? "Ativo — visível no portal" : "Inativo — oculto"}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !form.texto.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   Comunicados — página admin
   ═══════════════════════════════════════════════════════════ */
export function Comunicados() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editing, setEditing] = useState(null); // id of item being edited
  const [saving,  setSaving]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "comunicados"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  async function handleAdd(form) {
    setSaving(true);
    try {
      await addDoc(collection(db, "comunicados"), { ...form, createdAt: serverTimestamp() });
      toast.success("Comunicado criado!");
      setAdding(false);
    } catch (e) {
      toast.error("Erro ao criar", { description: e.message });
    } finally { setSaving(false); }
  }

  async function handleEdit(form) {
    setSaving(true);
    try {
      await updateDoc(doc(db, "comunicados", editing), { ...form, updatedAt: serverTimestamp() });
      toast.success("Comunicado atualizado!");
      setEditing(null);
    } catch (e) {
      toast.error("Erro ao atualizar", { description: e.message });
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "comunicados", id));
      toast.success("Comunicado removido.");
    } catch (e) {
      toast.error("Erro ao remover", { description: e.message });
    }
    setDeleteTarget(null);
  }

  async function toggleAtivo(item) {
    try {
      await updateDoc(doc(db, "comunicados", item.id), { ativo: !item.ativo });
    } catch (e) {
      toast.error("Erro", { description: e.message });
    }
  }

  return (
    <>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Remover comunicado?"
        description="Essa ação é irreversível."
        confirmLabel="Sim, remover"
        cancelLabel="Cancelar"
        onConfirm={() => handleDelete(deleteTarget)}
        variant="destructive"
      />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-bold text-foreground text-xl">Comunicados</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Banners exibidos no topo da página inicial para todos os usuários.
            </p>
          </div>
          {!adding && (
            <button
              onClick={() => { setAdding(true); setEditing(null); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Novo comunicado
            </button>
          )}
        </div>

        {/* New form */}
        {adding && (
          <ComunicadoForm
            onSave={handleAdd}
            onCancel={() => setAdding(false)}
            saving={saving}
          />
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground/60 text-sm">Nenhum comunicado criado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const tipoInfo = TIPOS.find((t) => t.value === item.tipo) ?? TIPOS[0];
              const TIcon    = tipoInfo.icon;
              const chipCls  = TIPO_STYLE[item.tipo] ?? TIPO_STYLE.info;

              if (editing === item.id) {
                return (
                  <ComunicadoForm
                    key={item.id}
                    initial={{ titulo: item.titulo ?? "", texto: item.texto ?? "", tipo: item.tipo ?? "info", link: item.link ?? "", ativo: item.ativo ?? true }}
                    onSave={handleEdit}
                    onCancel={() => setEditing(null)}
                    saving={saving}
                  />
                );
              }

              return (
                <div key={item.id} className={`flex items-start gap-3 p-4 rounded-2xl border glass-card transition-opacity ${item.ativo ? "" : "opacity-50"}`}>
                  <span className={`mt-0.5 shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${chipCls}`}>
                    <TIcon className="w-2.5 h-2.5" />
                    {tipoInfo.label}
                  </span>

                  <div className="flex-1 min-w-0">
                    {item.titulo && <p className="text-xs font-semibold text-foreground">{item.titulo}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.texto}</p>
                    {item.link && <p className="text-[10px] text-primary/60 mt-0.5 truncate">{item.link}</p>}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleAtivo(item)}
                      title={item.ativo ? "Desativar" : "Ativar"}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-all"
                    >
                      {item.ativo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { setEditing(item.id); setAdding(false); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/8 border border-transparent hover:border-destructive/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
