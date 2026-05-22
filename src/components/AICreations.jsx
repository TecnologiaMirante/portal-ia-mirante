/**
 * AICreations — live gallery connected to Firestore
 * Supports: video (YouTube / direct), image, and audio creations
 */
import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@infra/firebase";
import {
  Play,
  Film,
  X,
  ExternalLink,
  CalendarDays,
  MapPin,
  User,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  Search,
  ArrowUp,
  ArrowDown,
  Music,
  Image as ImageIcon,
  ZoomIn,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { TiltCard } from "@/components/effects/TiltCard";
import { aiTools } from "@/data/aiTools";

const PAGE_SIZE = 8;

/* ─── helpers ───────────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function getMediaType(c) {
  // explicit field takes priority
  if (c.mediaType) return c.mediaType;
  // legacy: if no field, assume video
  return "video";
}

function getThumbnail(c) {
  const type = getMediaType(c);
  if (type === "image") return c.thumbnailUrl ?? c.videoUrl ?? null;
  const ytId = getYouTubeId(c.videoUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return c.thumbnailUrl ?? null;
}

const fmtShort = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const fmtLong = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(str, long = false) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return (long ? fmtLong : fmtShort).format(new Date(y, m - 1, d));
}

const GRADIENTS = [
  "from-violet-500/40 via-indigo-500/30 to-blue-500/40",
  "from-rose-500/40 via-pink-500/30 to-amber-500/40",
  "from-emerald-500/40 via-teal-500/30 to-cyan-500/40",
  "from-amber-500/40 via-orange-500/30 to-rose-500/40",
  "from-sky-500/40 via-blue-500/30 to-violet-500/40",
];

/* ─── AiBadge ────────────────────────────────────────────── */
function AiBadge({ name }) {
  const tool = aiTools.find((x) => x.name === name);
  const color = tool?.color ?? "#6366f1";
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-none"
      style={{ background: `${color}15`, borderColor: `${color}40`, color }}
    >
      {name}
    </span>
  );
}

/* ─── FilterChip ─────────────────────────────────────────── */
function FilterChip({ label, active, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-accent/40",
      ].join(" ")}
      style={
        active && color
          ? { background: color, borderColor: color, color: "#fff" }
          : {}
      }
    >
      {label}
    </button>
  );
}

/* ─── MediaModal ─────────────────────────────────────────── */
function MediaModal({ creation, onClose }) {
  const type = getMediaType(creation);
  const ytId = type === "video" ? getYouTubeId(creation.videoUrl) : null;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  function handleCopy() {
    const url = creation.videoUrl ?? window.location.href;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    toast.success("Link copiado!", { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl animate-in zoom-in-95 fade-in duration-200 flex flex-col rounded-2xl overflow-hidden bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── media area ─────────────────────────────────────── */}
        {type === "image" ? (
          <div className="w-full bg-black/90 flex items-center justify-center">
            <img
              src={creation.videoUrl}
              alt={creation.title}
              className="max-h-[65vh] w-auto max-w-full object-contain"
            />
          </div>
        ) : type === "audio" ? (
          <div className="w-full p-8 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Music className="w-9 h-9 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-foreground text-center max-w-sm leading-snug">
              {creation.title}
            </p>
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

        {/* ── info ───────────────────────────────────────────── */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <h3 className="font-bold text-foreground text-base leading-snug flex-1">
              {creation.title}
            </h3>
            {/* copy link */}
            {creation.videoUrl && (
              <button
                onClick={handleCopy}
                title="Copiar link da mídia"
                className="shrink-0 mt-0.5 w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                {copied
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5" />
                }
              </button>
            )}
            {/* open in new tab */}
            {creation.videoUrl && type !== "audio" && (
              <a
                href={creation.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir em nova aba"
                className="shrink-0 mt-0.5 w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
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
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {creation.where && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                {creation.where}
              </span>
            )}
            {creation.author && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 shrink-0 text-primary/60" />
                {creation.author}
              </span>
            )}
            {creation.date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 shrink-0 text-primary/60" />
                {formatDate(creation.date, true)}
              </span>
            )}
          </div>
          {(creation.aiUsed ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/60">
              {creation.aiUsed.map((t) => (
                <AiBadge key={t} name={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── CreationCard ───────────────────────────────────────── */
function CreationCard({ creation, index, onClick }) {
  const type     = getMediaType(creation);
  const isVideo  = type === "video";
  const isImage  = type === "image";
  const isAudio  = type === "audio";
  const thumb    = getThumbnail(creation);
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const hasMedia = Boolean(creation.videoUrl);
  const dateStr  = formatDate(creation.date);

  return (
    <div
      style={{
        animationName: "cardAppear",
        animationDuration: "420ms",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        animationDelay: `${Math.min(index * 55, 440)}ms`,
        animationFillMode: "both",
      }}
    >
      <TiltCard
        intensity={4}
        className="group glass-card rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer"
        onClick={onClick}
      >
        {/* ── thumbnail / media preview ──────────────────── */}
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          {isAudio ? (
            /* Audio — gradient placeholder */
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Music className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
          ) : thumb ? (
            <img
              src={thumb}
              alt={creation.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            /* No thumbnail fallback */
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              {isImage
                ? <ImageIcon className="w-8 h-8 text-white/40" strokeWidth={1.5} />
                : <Film className="w-8 h-8 text-white/40" strokeWidth={1.5} />
              }
            </div>
          )}

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* hover overlay icon */}
          {hasMedia && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100">
                {isAudio
                  ? <Music className="w-5 h-5 text-white" />
                  : isImage
                    ? <ZoomIn className="w-5 h-5 text-white" />
                    : <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                }
              </div>
            </div>
          )}

          {/* media type badge (only for non-video) */}
          {isAudio && (
            <span className="absolute top-2 left-2 text-[10px] font-medium text-white/90 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5 leading-tight flex items-center gap-1">
              <Music className="w-2.5 h-2.5" /> Áudio
            </span>
          )}
          {isImage && (
            <span className="absolute top-2 left-2 text-[10px] font-medium text-white/90 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5 leading-tight flex items-center gap-1">
              <ImageIcon className="w-2.5 h-2.5" /> Foto
            </span>
          )}

          {/* date */}
          {dateStr && (
            <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white/90 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5 leading-tight">
              {dateStr}
            </span>
          )}
          {/* area */}
          {creation.where && (
            <span className="absolute bottom-2 right-2 text-[10px] font-medium text-white/90 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5 leading-tight flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {creation.where}
            </span>
          )}
        </div>

        {/* ── info ───────────────────────────────────────── */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
            {creation.title}
          </h3>
          {creation.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {creation.description}
            </p>
          )}
          {creation.author && (
            <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1 mt-auto">
              <User className="w-3 h-3 shrink-0" />
              {creation.author}
            </p>
          )}
        </div>

        {(creation.aiUsed ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-4 pt-3 border-t border-border/60">
            {creation.aiUsed.map((t) => (
              <AiBadge key={t} name={t} />
            ))}
          </div>
        )}
      </TiltCard>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────── */
export function AICreations() {
  const [creations, setCreations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [active,    setActive]    = useState(null);

  /* filters + search + sort */
  const [filterArea,    setFilterArea]    = useState(null);
  const [filterTools,   setFilterTools]   = useState([]);
  const [filterType,    setFilterType]    = useState(null); // "video"|"image"|"audio"|null
  const [search,        setSearch]        = useState("");
  const [sortOrder,     setSortOrder]     = useState("desc");
  const [visibleCount,  setVisibleCount]  = useState(PAGE_SIZE);
  const [showToolFilter, setShowToolFilter] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "creations"),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const published = all
          .filter((c) => c.published === true)
          .sort((a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
          );
        setCreations(published);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[AICreations]", err);
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  /* derive filter options */
  const areas = useMemo(() => {
    const s = new Set(creations.map((c) => c.where).filter(Boolean));
    return Array.from(s).sort();
  }, [creations]);

  const toolNames = useMemo(() => {
    const s = new Set(creations.flatMap((c) => c.aiUsed ?? []));
    return Array.from(s).sort();
  }, [creations]);

  /* which media types exist in data */
  const existingTypes = useMemo(() => {
    const s = new Set(creations.map(getMediaType));
    return Array.from(s);
  }, [creations]);

  /* filtered + searched + sorted + paginated */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return creations
      .filter((c) => !filterArea || c.where === filterArea)
      .filter((c) => filterTools.length === 0 || filterTools.some((t) => c.aiUsed?.includes(t)))
      .filter((c) => !filterType || getMediaType(c) === filterType)
      .filter((c) =>
        !q || [c.title, c.description, c.author, c.where].some((f) => f?.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        const diff = (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0);
        return sortOrder === "desc" ? -diff : diff;
      });
  }, [creations, filterArea, filterTools, filterType, search, sortOrder]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterArea, filterTools, filterType, search, sortOrder]);

  const toggleTool = (name) =>
    setFilterTools((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );

  const clearFilters = () => {
    setFilterArea(null);
    setFilterTools([]);
    setFilterType(null);
    setSearch("");
  };

  const activeFiltersCount =
    (filterArea ? 1 : 0) + filterTools.length + (filterType ? 1 : 0) + (search ? 1 : 0);

  const openModal  = useCallback((c) => setActive(c), []);
  const closeModal = useCallback(() => setActive(null), []);

  const TYPE_LABELS = { video: "Vídeo", image: "Foto", audio: "Áudio" };

  return (
    <>
      <section id="criacoes" className="py-16 relative section-alt">
        <div className="section-divider mb-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* ── header ─────────────────────────────── */}
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div className="reveal">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
                Criações com IA
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                O que já criamos{" "}
                <span className="gradient-text">com Inteligência Artificial</span>
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Vídeos, imagens, áudios e produções feitas pelo time Mirante usando ferramentas de IA.
              </p>
            </div>

            <div className="reveal reveal-delay-1 flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  error ? "bg-destructive"
                    : loading ? "bg-amber-400 animate-pulse"
                    : "bg-emerald-400 animate-pulse"
                }`}
              />
              {loading
                ? "Carregando…"
                : error
                  ? "Erro ao carregar"
                  : `${filtered.length} criaç${filtered.length !== 1 ? "ões" : "ão"}`}
            </div>
          </div>

          {/* ── search + sort ──────────────────────── */}
          {!loading && !error && creations.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar criações…"
                  className={[
                    "w-full h-10 pl-9 pr-4 rounded-xl text-sm",
                    "bg-card border border-border",
                    "text-foreground placeholder:text-muted-foreground/50",
                    "hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10",
                    "outline-none transition-all duration-200",
                  ].join(" ")}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setSortOrder((v) => (v === "desc" ? "asc" : "desc"))}
                title={sortOrder === "desc" ? "Mais recente primeiro" : "Mais antigo primeiro"}
                className="flex items-center gap-1.5 px-3 h-10 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/40 transition-all shrink-0"
              >
                {sortOrder === "desc"
                  ? <ArrowDown className="w-3.5 h-3.5" />
                  : <ArrowUp className="w-3.5 h-3.5" />
                }
                <span className="hidden sm:inline">
                  {sortOrder === "desc" ? "Mais recente" : "Mais antigo"}
                </span>
              </button>
            </div>
          )}

          {/* ── filters ────────────────────────────── */}
          {!loading && !error && creations.length > 0 && (
            <div className="flex flex-col gap-3 mb-8">
              {/* area chips */}
              {areas.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                  <FilterChip label="Todas as áreas" active={filterArea === null} onClick={() => setFilterArea(null)} />
                  {areas.map((a) => (
                    <FilterChip
                      key={a}
                      label={a}
                      active={filterArea === a}
                      onClick={() => setFilterArea(filterArea === a ? null : a)}
                    />
                  ))}
                </div>
              )}

              {/* media type chips (only if more than one type exists) */}
              {existingTypes.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                  <FilterChip label="Todos os tipos" active={filterType === null} onClick={() => setFilterType(null)} />
                  {existingTypes.map((t) => (
                    <FilterChip
                      key={t}
                      label={TYPE_LABELS[t] ?? t}
                      active={filterType === t}
                      onClick={() => setFilterType(filterType === t ? null : t)}
                    />
                  ))}
                </div>
              )}

              {/* AI tools toggle + chips */}
              {toolNames.length > 0 && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowToolFilter((v) => !v)}
                    className="flex items-center gap-1.5 self-start text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filtrar por ferramenta
                    {filterTools.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                        {filterTools.length}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showToolFilter ? "rotate-180" : ""}`} />
                  </button>

                  {showToolFilter && (
                    <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden sm:flex-wrap animate-in slide-in-from-top-1 fade-in duration-150">
                      {toolNames.map((t) => {
                        const color = aiTools.find((x) => x.name === t)?.color;
                        return (
                          <FilterChip
                            key={t}
                            label={t}
                            active={filterTools.includes(t)}
                            color={color}
                            onClick={() => toggleTool(t)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* active filters summary */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {activeFiltersCount} filtro{activeFiltersCount !== 1 ? "s" : ""} ativo{activeFiltersCount !== 1 ? "s" : ""}
                    {" · "}
                    <span className="text-foreground font-medium">
                      {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline underline-offset-2 transition-colors">
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── grid ───────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((c, i) => (
              <CreationCard key={c.id} creation={c} index={i} onClick={() => openModal(c)} />
            ))}

            {/* skeletons */}
            {loading && [0, 1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted/60" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 rounded-lg bg-muted/60 w-3/4" />
                  <div className="h-3 rounded-lg bg-muted/40 w-1/2" />
                </div>
              </div>
            ))}

            {/* empty after filter */}
            {!loading && !error && filtered.length === 0 && creations.length > 0 && (
              <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Nenhuma criação com esses filtros</p>
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline mt-1">
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}

            {/* error */}
            {!loading && error && (
              <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Erro ao carregar criações</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Verifique as regras do Firestore.</p>
                  <p className="text-[10px] font-mono text-destructive/50 mt-2 max-w-md break-all">{error}</p>
                </div>
              </div>
            )}

            {/* empty (no data at all) */}
            {!loading && !error && creations.length === 0 && (
              <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
                  <Film className="w-5 h-5 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground/50 text-sm">
                  Nenhuma criação publicada ainda — em breve!
                </p>
              </div>
            )}
          </div>

          {/* ── load more ──────────────────────────── */}
          {!loading && hasMore && (
            <div className="flex flex-col items-center gap-2 mt-10 pb-4">
              <p className="text-xs text-muted-foreground">
                Exibindo{" "}
                <span className="font-semibold text-foreground">{visible.length}</span>
                {" "}de{" "}
                <span className="font-semibold text-foreground">{filtered.length}</span>
              </p>
              <button
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/40 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
                Ver mais criações
              </button>
            </div>
          )}

          {!loading && !hasMore && filtered.length > PAGE_SIZE && (
            <p className="text-center text-xs text-muted-foreground/40 mt-8 pb-4">
              Todas as {filtered.length} criações exibidas
            </p>
          )}
        </div>

        <div className="section-divider mt-4" />
      </section>

      {active && <MediaModal creation={active} onClose={closeModal} />}
    </>
  );
}
