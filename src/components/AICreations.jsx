/**
 * AICreations — live gallery connected to Firestore
 * Supports: video (YouTube / direct), image, and audio creations
 */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@infra/firebase";
import {
  Play, Pause,
  Film,
  X,
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
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
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

function getMediaItems(c) {
  if (c.mediaItems?.length > 0) return c.mediaItems;
  if (!c.videoUrl) return [];
  return [{ type: c.mediaType ?? "video", url: c.videoUrl, thumbnailUrl: c.thumbnailUrl ?? null }];
}

function getMediaType(c) {
  const items = getMediaItems(c);
  if (items.length > 0) return items[0].type;
  return "video";
}

function getThumbnail(c) {
  const items = getMediaItems(c);
  const first = items[0];
  if (!first) return null;
  if (first.type === "image") return first.thumbnailUrl ?? first.url ?? null;
  const ytId = getYouTubeId(first.url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return first.thumbnailUrl ?? null;
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

/* ─── CustomVideoPlayer ──────────────────────────────────── */
function CustomVideoPlayer({ src, poster }) {
  const videoRef     = useRef(null);
  const containerRef = useRef(null);
  const hideTimer    = useRef(null);
  const progressRef  = useRef(null);
  const playingRef   = useRef(false);

  const [playing,     setPlaying]     = useState(false);
  const [ended,       setEnded]       = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [buffered,    setBuffered]    = useState(0);
  const [volume,      setVolume]      = useState(1);
  const [muted,       setMuted]       = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [showCtrl,    setShowCtrl]    = useState(true);
  const [isFS,        setIsFS]        = useState(false);
  const [seekTip,     setSeekTip]     = useState({ visible: false, x: 0, time: 0 });

  useEffect(() => { playingRef.current = playing; }, [playing]);

  /* auto-hide controls after 3s of inactivity */
  const reveal = useCallback(() => {
    setShowCtrl(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playingRef.current) setShowCtrl(false);
    }, 3000);
  }, []);

  /* attach video events */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay     = () => { setPlaying(true);  setEnded(false); };
    const onPause    = () => { setPlaying(false); setShowCtrl(true); };
    const onTime     = () => setCurrentTime(v.currentTime);
    const onMeta     = () => { setDuration(v.duration); setLoading(false); };
    const onProgress = () => {
      if (v.buffered.length > 0 && v.duration)
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    };
    const onWait  = () => setLoading(true);
    const onCan   = () => setLoading(false);
    const onEnd   = () => { setPlaying(false); setEnded(true); setShowCtrl(true); };
    const onFS    = () => setIsFS(!!document.fullscreenElement);

    v.addEventListener("play",             onPlay);
    v.addEventListener("pause",            onPause);
    v.addEventListener("timeupdate",       onTime);
    v.addEventListener("loadedmetadata",   onMeta);
    v.addEventListener("progress",         onProgress);
    v.addEventListener("waiting",          onWait);
    v.addEventListener("canplay",          onCan);
    v.addEventListener("ended",            onEnd);
    document.addEventListener("fullscreenchange", onFS);
    v.play().catch(() => {});
    return () => {
      v.removeEventListener("play",           onPlay);
      v.removeEventListener("pause",          onPause);
      v.removeEventListener("timeupdate",     onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("progress",       onProgress);
      v.removeEventListener("waiting",        onWait);
      v.removeEventListener("canplay",        onCan);
      v.removeEventListener("ended",          onEnd);
      document.removeEventListener("fullscreenchange", onFS);
      clearTimeout(hideTimer.current);
    };
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.target !== el && !el.contains(e.target)) return;
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        playing ? v.pause() : v.play().catch(() => {});
        reveal();
      }
      if (e.key === "ArrowRight") { e.preventDefault(); v.currentTime = Math.min(v.currentTime + 5, v.duration); reveal(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); v.currentTime = Math.max(v.currentTime - 5, 0);           reveal(); }
      // eslint-disable-next-line react-hooks/immutability
      if (e.key === "m") { e.preventDefault(); toggleMute(); }
      // eslint-disable-next-line react-hooks/immutability
      if (e.key === "f") { e.preventDefault(); toggleFS(); }
    };
    el.setAttribute("tabindex", "0");
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [playing, reveal]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (ended) { v.currentTime = 0; v.play().catch(() => {}); setEnded(false); reveal(); return; }
    playing ? v.pause() : v.play().catch(() => {});
    reveal();
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const r = progressRef.current.getBoundingClientRect();
    v.currentTime = Math.max(0, Math.min(((e.clientX - r.left) / r.width) * duration, duration));
    reveal();
  };

  const onProgressHover = (e) => {
    if (!duration || !progressRef.current) return;
    const r = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min((e.clientX - r.left) / r.width, 1));
    setSeekTip({ visible: true, x: pct * 100, time: pct * duration });
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeVolume = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted  = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleFS = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const fmt = (s) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, "0");
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volPct = muted ? 0 : volume * 100;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black select-none outline-none"
      onMouseMove={reveal}
      onMouseLeave={() => { if (playingRef.current) setShowCtrl(false); setSeekTip(t => ({ ...t, visible: false })); }}
    >
      {/* video — no context menu, no download */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        style={{ cursor: showCtrl ? "default" : "none" }}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full border-[3px] border-white/10 border-t-white/70 animate-spin" />
        </div>
      )}

      {/* Centre overlay: play / pause flash / replay */}
      <button
        className={[
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          (!playing && !loading) ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={togglePlay}
        tabIndex={-1}
      >
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: "oklch(0.52 0.28 264 / 0.88)",
            boxShadow: "0 0 0 12px oklch(0.52 0.28 264 / 0.18), 0 0 40px oklch(0.52 0.28 264 / 0.40)",
          }}
        >
          {ended
            ? <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
            : <Play className="w-8 h-8 text-white fill-white ml-1" />
          }
        </div>
      </button>

      {/* Controls bar */}
      <div className={[
        "absolute inset-x-0 bottom-0 transition-all duration-300",
        showCtrl ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
      ].join(" ")}>
        {/* deep gradient behind controls */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-4 pt-1 flex flex-col gap-3">

          {/* ── Progress bar ─────────────────────────────── */}
          <div
            ref={progressRef}
            className="group/prog w-full cursor-pointer flex items-center"
            style={{ height: "20px" }}
            onClick={seek}
            onMouseMove={onProgressHover}
            onMouseLeave={() => setSeekTip(t => ({ ...t, visible: false }))}
          >
            {/* seek time tooltip */}
            {seekTip.visible && (
              <div
                className="absolute bottom-full mb-1 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono pointer-events-none"
                style={{ left: `${seekTip.x}%` }}
              >
                {fmt(seekTip.time)}
              </div>
            )}

            <div className="w-full relative rounded-full overflow-visible"
              style={{ height: "4px", transition: "height 0.15s" }}
            >
              {/* track */}
              <div className="absolute inset-0 bg-white/15 rounded-full" />
              {/* buffered */}
              <div className="absolute left-0 top-0 h-full bg-white/25 rounded-full transition-all duration-300"
                style={{ width: `${buffered}%` }} />
              {/* played */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, oklch(0.65 0.28 264), oklch(0.62 0.26 295))",
                  boxShadow: "0 0 8px oklch(0.62 0.26 264 / 0.60)",
                }}
              />
              {/* thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover/prog:opacity-100 transition-opacity scale-0 group-hover/prog:scale-100"
                style={{
                  left: `calc(${pct}% - 8px)`,
                  boxShadow: "0 0 0 3px oklch(0.62 0.26 264 / 0.40)",
                  transitionProperty: "opacity, transform",
                  transitionDuration: "150ms",
                }}
              />
            </div>
          </div>

          {/* ── Controls row ─────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Play / Pause / Replay */}
            <button onClick={togglePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/12 transition-colors shrink-0"
            >
              {ended
                ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                : playing
                  ? <Pause className="w-4 h-4 fill-white" />
                  : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            {/* Volume group */}
            <div className="group/vol flex items-center gap-1.5 shrink-0">
              <button onClick={toggleMute}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-colors"
              >
                {muted || volPct === 0
                  ? <VolumeX className="w-4 h-4" />
                  : <Volume2 className="w-4 h-4" />}
              </button>
              {/* volume slider */}
              <div className="w-0 group-hover/vol:w-16 overflow-hidden transition-all duration-200">
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={muted ? 0 : volume}
                  onChange={changeVolume}
                  className="w-16 h-1 appearance-none rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, white ${volPct}%, rgba(255,255,255,0.25) ${volPct}%)`,
                    accentColor: "white",
                  }}
                />
              </div>
            </div>

            {/* time */}
            <span className="text-white/55 text-[11px] font-mono tabular-nums flex-1 select-none px-2">
              {fmt(currentTime)}
              <span className="text-white/20 mx-1.5">/</span>
              {fmt(duration)}
            </span>

            {/* keyboard hint */}
            <span className="hidden sm:flex items-center gap-1 text-white/20 text-[10px] mr-1 select-none">
              <kbd className="px-1 py-0.5 rounded border border-white/15 font-mono">Space</kbd>
              <kbd className="px-1 py-0.5 rounded border border-white/15 font-mono">←→</kbd>
            </span>

            {/* Fullscreen */}
            <button onClick={toggleFS}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-colors shrink-0"
            >
              {isFS ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CopyPromptBtn ──────────────────────────────────────── */
function CopyPromptBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    let ok = false;
    /* tenta clipboard moderna (HTTPS / localhost) */
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:fixed;top:-9999px;left:-9999px";
        document.body.appendChild(el);
        el.focus();
        el.select();
        ok = document.execCommand("copy");
        document.body.removeChild(el);
      } catch { ok = false; }
    }
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0"
      style={copied
        ? { background: "oklch(0.55 0.20 150 / 0.12)", borderColor: "oklch(0.55 0.20 150 / 0.40)", color: "oklch(0.55 0.20 150)" }
        : { background: "oklch(0.55 0.28 264 / 0.08)", borderColor: "oklch(0.55 0.28 264 / 0.30)", color: "oklch(0.55 0.28 264)" }
      }
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copiado!" : "Copiar Prompt"}
    </button>
  );
}

/* ─── FullscreenImageViewer ──────────────────────────────── */
function FullscreenImageViewer({ items, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const item = items[idx] ?? items[0];
  const isZoomed = scale > 1;

  const resetZoom = useCallback(() => { setScale(1); setPan({ x: 0, y: 0 }); }, []);

  // Keyboard: capture phase so Escape doesn't bubble to modal
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); onClose(); return; }
      if (isZoomed) return;
      if (e.key === "ArrowLeft") { e.stopImmediatePropagation(); setIdx(i => (i - 1 + items.length) % items.length); setScale(1); setPan({ x: 0, y: 0 }); }
      if (e.key === "ArrowRight") { e.stopImmediatePropagation(); setIdx(i => (i + 1) % items.length); setScale(1); setPan({ x: 0, y: 0 }); }
    };
    document.addEventListener("keydown", h, true);
    return () => document.removeEventListener("keydown", h, true);
  }, [isZoomed, items.length, onClose]);

  // Wheel zoom (non-passive so we can preventDefault)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setScale(s => {
      const ns = Math.max(1, Math.min(6, s * factor));
      if (ns <= 1) setPan({ x: 0, y: 0 });
      return ns;
    });
  }, []);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onMouseDown = (e) => {
    if (!isZoomed) return;
    e.preventDefault();
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onMouseUp = () => { dragging.current = false; };

  const handleImgClick = (e) => {
    e.stopPropagation();
    if (isZoomed) resetZoom();
    else setScale(2.5);
  };

  if (!item) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center select-none"
      onClick={onClose}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10 bg-gradient-to-b from-black/70 to-transparent">
        <span className="text-white/60 text-sm font-medium">
          {items.length > 1 ? `${idx + 1} / ${items.length}` : ""}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <img
        src={item.url}
        alt=""
        className="max-w-full max-h-full object-contain"
        style={{
          transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
          cursor: isZoomed ? "grab" : "zoom-in",
          transition: dragging.current ? "none" : "transform 0.18s ease",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        }}
        onClick={handleImgClick}
        onMouseDown={onMouseDown}
        draggable={false}
      />

      {/* Nav arrows */}
      {items.length > 1 && !isZoomed && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + items.length) % items.length); resetZoom(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % items.length); resetZoom(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom: dots + hint */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 py-5 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        {items.length > 1 && (
          <div className="flex gap-1.5 items-center pointer-events-auto">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); resetZoom(); }}
                className={`rounded-full transition-all duration-200 ${i === idx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>
        )}
        <p className="text-white/30 text-[11px] flex items-center gap-2">
          {!isZoomed ? (
            <>
              <span>Clique ou scroll para ampliar</span>
              {items.length > 1 && <><span>·</span><span>← → para navegar</span></>}
              <span>·</span><span>Esc para fechar</span>
            </>
          ) : (
            <span>Arraste para mover · Clique ou Esc para sair do zoom</span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ─── MediaModal ─────────────────────────────────────────── */
function MediaModal({ creation, onClose }) {
  const items = getMediaItems(creation);
  const [idx, setIdx] = useState(0);
  const [fsOpen, setFsOpen] = useState(false);

  const item = items[idx] ?? { type: "video", url: creation.videoUrl, thumbnailUrl: creation.thumbnailUrl };
  const type = item.type;
  const ytId = type === "video" ? getYouTubeId(item.url) : null;
  const imageItems = useMemo(() => items.filter(it => it.type === "image"), [items]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Modal Escape — only when fullscreen is not open
  useEffect(() => {
    if (fsOpen) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose, fsOpen]);

  // Carousel arrow keys — only when fullscreen is not open
  useEffect(() => {
    if (items.length <= 1 || fsOpen) return;
    const h = (e) => {
      if (e.key === "ArrowLeft") setIdx(i => (i - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % items.length);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [items.length, fsOpen]);

  const prev = () => setIdx(i => (i - 1 + items.length) % items.length);
  const next = () => setIdx(i => (i + 1) % items.length);

  const openFullscreen = () => {
    if (imageItems.length === 0) return;
    setFsOpen(true);
  };

  // accent color
  const accent = type === "audio" ? "oklch(0.55 0.28 264)" : type === "image" ? "oklch(0.60 0.22 230)" : "oklch(0.55 0.28 264)";

  // current image index within imageItems (for fullscreen startIdx)
  const fsStartIdx = imageItems.indexOf(item) >= 0 ? imageItems.indexOf(item) : 0;

  return (
    <>
      {fsOpen && (
        <FullscreenImageViewer
          items={imageItems}
          startIdx={fsStartIdx}
          onClose={() => setFsOpen(false)}
        />
      )}

      <div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl animate-in zoom-in-95 fade-in duration-200 flex flex-col rounded-3xl bg-card border border-border/80 max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: `0 0 0 1px ${accent.replace(")", "/0.20)")}, 0 24px 80px rgba(0,0,0,0.55), 0 0 60px ${accent.replace(")", "/0.12)")}` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* top accent strip */}
          <div className="h-[3px] w-full shrink-0"
            style={{ background: `linear-gradient(90deg, ${accent}, ${accent.replace("264)", "295)")}, transparent)` }}
          />

          {/* close button */}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/75 transition-all"
          >
          <X className="w-4 h-4" />
        </button>

          {/* ── media area ─────────────────────────────────────── */}
          <div className="relative">
            {type === "image" ? (
              <div
                className="w-full relative flex items-center justify-center overflow-hidden cursor-pointer group"
                style={{ minHeight: "200px", maxHeight: "50vh", background: "#000" }}
                onClick={openFullscreen}
              >
                <img src={item.url} aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-30 pointer-events-none"
                />
                <img src={item.url} alt={creation.title}
                  className="relative z-10 max-h-[50vh] w-auto max-w-full object-contain"
                />
                <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
                <p className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 text-[11px] bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Clique para tela cheia
                </p>
              </div>
            ) : type === "audio" ? (
              <div className="w-full px-8 py-10 flex flex-col items-center gap-5"
                style={{ background: "linear-gradient(135deg, oklch(0.55 0.28 264 / 0.10), oklch(0.58 0.26 295 / 0.06), transparent)" }}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full animate-ping opacity-10" style={{ background: "oklch(0.55 0.28 264)" }} />
                  <div className="absolute w-20 h-20 rounded-full animate-pulse opacity-15" style={{ background: "oklch(0.55 0.28 264)" }} />
                  <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center border"
                    style={{ background: "oklch(0.55 0.28 264 / 0.15)", borderColor: "oklch(0.55 0.28 264 / 0.30)" }}>
                    <Music className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3, 0.7, 1, 0.5].map((h, i) => (
                    <div key={i} className="w-1.5 rounded-full"
                      style={{ height: `${h * 100}%`, background: "oklch(0.55 0.28 264)", opacity: 0.6,
                        animation: `equalizer ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>
                <audio src={item.url} controls autoPlay className="w-full max-w-md" />
              </div>
            ) : (
              <div className="w-full bg-black">
                {ytId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                      title={creation.title}
                    />
                  </div>
                ) : item.url ? (
                  <CustomVideoPlayer src={item.url} poster={item.thumbnailUrl ?? undefined} />
                ) : (
                  <div className="aspect-video flex items-center justify-center">
                    <Film className="w-12 h-12 text-white/15" />
                  </div>
                )}
              </div>
            )}

            {/* Carousel arrows */}
            {items.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {items.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                    className={`rounded-full transition-all duration-200 ${i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── info panel ─────────────────────────────────────── */}
          <div className="p-5 flex flex-col gap-3">
            {items.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Layers className="w-3 h-3" />
                {idx + 1} de {items.length} itens
              </div>
            )}

            <h3 className="font-bold text-foreground text-base leading-snug">
              {creation.title}
            </h3>

            {creation.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {creation.description}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {creation.where && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0 text-primary/50" />
                  {creation.where}
                </span>
              )}
              {creation.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3 shrink-0 text-primary/50" />
                  {creation.author}
                </span>
              )}
              {creation.date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3 shrink-0 text-primary/50" />
                  {formatDate(creation.date, true)}
                </span>
              )}
            </div>

            {creation.prompt && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Prompt</span>
                  <CopyPromptBtn text={creation.prompt} />
                </div>
                <pre className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-xl p-3 border border-border/50 max-h-40 overflow-y-auto">
                  {creation.prompt}
                </pre>
              </div>
            )}

            {(creation.aiUsed ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                {creation.aiUsed.map((t) => (
                  <AiBadge key={t} name={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── CreationCard ───────────────────────────────────────── */
function CreationCard({ creation, index, onClick }) {
  const items    = getMediaItems(creation);
  const type     = getMediaType(creation);
  void (type === "video");
  const isImage  = type === "image";
  const isAudio  = type === "audio";
  const thumb    = getThumbnail(creation);
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const hasMedia = items.length > 0;
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
            isImage ? (
              /* Imagem vertical: fundo borrado + imagem contida */
              <div className="w-full h-full relative">
                <img
                  src={thumb}
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg opacity-40 pointer-events-none"
                />
                <img
                  src={thumb}
                  alt={creation.title}
                  loading="lazy"
                  className="relative w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <img
                src={thumb}
                alt={creation.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            )
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
          {/* multi-item count badge */}
          {items.length > 1 && (
            <span className="absolute top-2 right-2 text-[10px] font-semibold text-white/90 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 leading-tight flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> {items.length}
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
