import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@infra/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Film,
  Loader2,
  AlertCircle,
  Music,
  Image as ImageIcon,
  Search,
  X,
  ExternalLink,
  MapPin,
  User,
  CalendarDays,
  ZoomIn,
  Play,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { aiTools } from "@/data/aiTools";

/* ── YouTube helper ──────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

/* ── Storage helpers ─────────────────────────────────────── */
function storagePathFromUrl(url) {
  if (!url || !url.includes("firebasestorage")) return null;
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/o\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}
async function deleteStorageFile(url) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (e) {
    if (e.code !== "storage/object-not-found")
      console.warn("[storage delete]", e);
  }
}

/* ── Thumbnail helper ────────────────────────────────────── */
function getThumb(c) {
  const type = c.mediaType ?? "video";
  if (type === "image") return c.thumbnailUrl ?? c.videoUrl ?? null;
  const ytId = getYouTubeId(c.videoUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  return c.thumbnailUrl ?? null;
}

function getMediaType(c) {
  return c.mediaType ?? "video";
}

/* ── Media type chip ─────────────────────────────────────── */
function MediaTypeBadge({ type }) {
  const map = {
    video: {
      label: "Vídeo",
      cls: "bg-blue-500/10   text-blue-400   border-blue-500/20",
      Icon: Film,
    },
    image: {
      label: "Foto",
      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Icon: ImageIcon,
    },
    audio: {
      label: "Áudio",
      cls: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      Icon: Music,
    },
  };
  const { label, cls, Icon } = map[type] ?? map.video;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${cls}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

/* ── Tool badge ──────────────────────────────────────────── */
function ToolBadge({ name }) {
  const tool = aiTools.find((t) => t.name === name);
  const color = tool?.color ?? "#6366f1";
  return (
    <span
      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border leading-none"
      style={{ background: `${color}18`, borderColor: `${color}40`, color }}
    >
      {name}
    </span>
  );
}

/* ── Quick-view modal ────────────────────────────────────── */
function QuickViewModal({ creation, onClose }) {
  const type = getMediaType(creation);
  const ytId = type === "video" ? getYouTubeId(creation.videoUrl) : null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const fmtDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200 flex flex-col rounded-2xl overflow-hidden bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* media */}
        {type === "image" ? (
          <div className="w-full bg-black/90 flex items-center justify-center">
            <img
              src={creation.videoUrl}
              alt={creation.title}
              className="max-h-[55vh] w-auto max-w-full object-contain"
            />
          </div>
        ) : type === "audio" ? (
          <div className="w-full p-8 bg-linear-to-br from-primary/10 via-transparent to-primary/5 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Music className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <audio
              src={creation.videoUrl}
              controls
              autoPlay
              className="w-full max-w-sm"
            />
          </div>
        ) : (
          <div className="aspect-video bg-black w-full">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
                title={creation.title}
              />
            ) : creation.videoUrl ? (
              <video
                src={creation.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-12 h-12 text-white/20" />
              </div>
            )}
          </div>
        )}

        {/* info */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <MediaTypeBadge type={type} />
            <h3 className="font-bold text-foreground text-sm leading-snug flex-1">
              {creation.title}
            </h3>
            {creation.videoUrl && (
              <a
                href={creation.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {creation.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {creation.description}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {creation.where && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary/60" />
                {creation.where}
              </span>
            )}
            {creation.author && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-primary/60" />
                {creation.author}
              </span>
            )}
            {creation.date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-primary/60" />
                {fmtDate(creation.date)}
              </span>
            )}
          </div>
          {(creation.aiUsed ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
              {creation.aiUsed.map((t) => (
                <ToolBadge key={t} name={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AdminDashboard
   ═══════════════════════════════════════════════════════════ */
export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState(null);

  /* delete dialog */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── welcome toast (once per session) ─────────────────── */
  useEffect(() => {
    if (!sessionStorage.getItem("admin_welcomed")) {
      sessionStorage.setItem("admin_welcomed", "1");
      const name = user?.email?.split("@")[0] ?? "Admin";
      setTimeout(() => {
        toast(`Bem-vindo de volta, ${name}! 👋`, {
          description: "Portal IA Mirante · Painel de administração",
          duration: 5000,
        });
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── load creations ────────────────────────────────────── */
  useEffect(() => {
    const q = query(collection(db, "creations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCreations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  /* ── toggle published ──────────────────────────────────── */
  const handleTogglePublished = async (creation) => {
    if (togglingId) return;
    setTogglingId(creation.id);
    const next = !creation.published;
    try {
      await updateDoc(doc(db, "creations", creation.id), { published: next });
      toast.success(next ? "Publicado na galeria ✓" : "Movido para rascunho", {
        description: creation.title,
        duration: 3000,
      });
    } catch (e) {
      toast.error("Erro ao alterar", { description: e.message });
    } finally {
      setTogglingId(null);
    }
  };

  /* ── delete ────────────────────────────────────────────── */
  const askDelete = (creation) => {
    setDialogTarget(creation);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!dialogTarget) return;
    const { id, title, videoUrl, thumbnailUrl } = dialogTarget;
    setDeleting(true);
    const toastId = `del-${id}`;
    toast.loading("Excluindo…", { id: toastId });
    try {
      await deleteDoc(doc(db, "creations", id));
      await Promise.all([
        deleteStorageFile(videoUrl),
        deleteStorageFile(thumbnailUrl),
      ]);
      toast.success("Criação excluída", { id: toastId, description: title });
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir", { id: toastId, description: e.message });
    } finally {
      setDeleting(false);
      setDialogTarget(null);
    }
  };

  /* ── filtered list ─────────────────────────────────────── */
  const q = search.trim().toLowerCase();
  const filtered = creations.filter(
    (c) =>
      !q ||
      [c.title, c.author, c.where, ...(c.aiUsed ?? [])].some((f) =>
        f?.toLowerCase().includes(q),
      ),
  );
  const published = creations.filter((c) => c.published);
  const drafts = creations.filter((c) => !c.published);

  const openPreview = useCallback((c) => setPreviewItem(c), []);
  const closePreview = useCallback(() => setPreviewItem(null), []);

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total", value: creations.length, color: "text-primary" },
          {
            label: "Publicados",
            value: published.length,
            color: "text-emerald-400",
          },
          { label: "Rascunhos", value: drafts.length, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Header + Search ───────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="font-bold text-foreground text-lg shrink-0">
          Todas as Criações
        </h2>

        {/* search */}
        <div className="relative flex-1 min-w-45">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, autor, área…"
            className="w-full h-9 pl-8 pr-8 rounded-xl text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/50 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => navigate("/admin/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Criação
        </button>
      </div>

      {/* search results count */}
      {search && !loading && (
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para{" "}
          <span className="font-medium text-foreground">"{search}"</span>
        </p>
      )}

      {/* ── Content ───────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : creations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
          <div>
            <p className="font-medium text-muted-foreground">
              Nenhuma criação ainda
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Clique em "Nova Criação" para começar
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Search className="w-8 h-8 text-muted-foreground/20" />
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Nenhuma criação encontrada
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-xs text-primary hover:underline mt-1"
            >
              Limpar busca
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => {
            const type = getMediaType(c);
            const thumb = getThumb(c);
            return (
              <div
                key={c.id}
                className="glass-card rounded-2xl p-3 flex items-center gap-3"
              >
                {/* ── Thumbnail ──────────────────────────── */}
                <button
                  type="button"
                  onClick={() => openPreview(c)}
                  title="Visualizar"
                  className="group relative shrink-0 w-20 h-11.25 rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/40 transition-all"
                >
                  {type === "audio" ? (
                    <div className="w-full h-full bg-linear-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center">
                      <Music className="w-4 h-4 text-violet-300" />
                    </div>
                  ) : thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      {type === "image" ? (
                        <ImageIcon className="w-4 h-4 text-primary/40" />
                      ) : (
                        <Film className="w-4 h-4 text-primary/40" />
                      )}
                    </div>
                  )}
                  {/* hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {type === "audio" ? (
                      <Music className="w-3.5 h-3.5 text-white" />
                    ) : type === "image" ? (
                      <ZoomIn className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    )}
                  </div>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <MediaTypeBadge type={type} />
                    <p className="font-semibold text-foreground text-sm leading-tight truncate">
                      {c.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {c.where && (
                      <span className="text-[10px] text-muted-foreground">
                        {c.where}
                      </span>
                    )}
                    {c.author && (
                      <span className="text-[10px] text-muted-foreground/60">
                        · {c.author}
                      </span>
                    )}
                    {c.date && (
                      <span className="text-[10px] text-muted-foreground/60">
                        · {c.date}
                      </span>
                    )}
                  </div>
                  {(c.aiUsed ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(c.aiUsed ?? []).map((t) => (
                        <ToolBadge key={t} name={t} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* toggle published */}
                  <button
                    onClick={() => handleTogglePublished(c)}
                    disabled={togglingId === c.id}
                    title={
                      c.published
                        ? "Mover para rascunho"
                        : "Publicar na galeria"
                    }
                    className={[
                      "w-8 h-8 rounded-lg flex items-center justify-center border border-transparent transition-all",
                      c.published
                        ? "text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/20"
                        : "text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/20",
                      togglingId === c.id
                        ? "opacity-50 cursor-not-allowed"
                        : "",
                    ].join(" ")}
                  >
                    {togglingId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : c.published ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* edit */}
                  <button
                    onClick={() => navigate(`/admin/edit/${c.id}`)}
                    title="Editar"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* delete */}
                  <button
                    onClick={() => askDelete(c)}
                    title="Excluir"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && creations.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground/30 mt-6 flex items-center justify-center gap-1.5">
          Clique no <Eye className="w-3 h-3" /> para publicar/despublicar
        </p>
      )}

      {/* ── Confirm Delete Dialog ──────────────────────────── */}
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (!deleting) setDialogOpen(v);
        }}
        title="Excluir criação?"
        description={
          dialogTarget
            ? `"${dialogTarget.title}" será removido permanentemente da galeria e do Storage. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        loading={deleting}
        variant="destructive"
      />

      {/* ── Quick-view modal ────────────────────────────────── */}
      {previewItem && (
        <QuickViewModal creation={previewItem} onClose={closePreview} />
      )}
    </>
  );
}
