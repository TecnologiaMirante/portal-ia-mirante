/**
 * CreationForm — Add or edit an AI Creation
 * Supports: YouTube URL, external URL, or file upload (video / image / audio)
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection, doc, addDoc, updateDoc, getDoc, serverTimestamp,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, uploadBytes, getDownloadURL, deleteObject,
} from "firebase/storage";
import { db, storage } from "@infra/firebase";
import { aiTools } from "@/data/aiTools";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Upload, Link2, Loader2, X, CheckCircle2,
  FileVideo, AlertCircle, CloudUpload, Music, Image as ImageIcon,
  Trash2, Film, RefreshCw,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/alert-dialog";

import { Input }      from "@/components/ui/input";
import { Textarea }   from "@/components/ui/textarea";
import { Label }      from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ── YouTube helpers ──────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/* ── Storage helpers ──────────────────────────────────────── */
function storagePathFromUrl(url) {
  try {
    const u = new URL(url);
    const raw = u.pathname.match(/\/o\/(.+)$/)?.[1];
    return raw ? decodeURIComponent(raw) : null;
  } catch {
    return null;
  }
}

async function deleteStorageFile(url) {
  if (!url || !url.includes("firebasestorage.googleapis.com")) return;
  try {
    const path = storagePathFromUrl(url);
    if (path) await deleteObject(ref(storage, path));
  } catch (e) {
    if (e?.code !== "storage/object-not-found") console.warn("[deleteStorageFile]", e);
  }
}

const TOOL_NAMES = aiTools.map((t) => t.name);

const AREAS = [
  "Marketing", "Comercial", "Operações", "RH", "TI",
  "Financeiro", "Jurídico", "Diretoria", "Outro",
];

const EMPTY = {
  title: "", description: "", date: "", author: "",
  where: "", aiUsed: [], videoUrl: "", thumbnailUrl: null,
  mediaType: "video", published: true,
};

/* ── detect media type from MIME ─────────────────────────── */
function getMimeCategory(file) {
  if (!file) return null;
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
}

const SIZE_LIMITS = { video: 500, image: 20, audio: 100 };

/* ── Field wrapper ────────────────────────────────────────── */
function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

/* ── Mode toggle button ───────────────────────────────────── */
function ModeBtn({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-accent/40",
      ].join(" ")}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

/* ── Published toggle ─────────────────────────────────────── */
function PublishedToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-secondary/20 dark:bg-secondary/10">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          "relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          value ? "bg-primary" : "bg-border",
        ].join(" ")}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: value ? "22px" : "2px" }}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-foreground leading-tight">
          {value ? "Publicado na galeria" : "Rascunho (oculto)"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {value ? "Visível para todos no portal" : "Somente administradores podem ver"}
        </p>
      </div>
    </div>
  );
}

/* ── Current media preview (edit mode) ───────────────────── */
function CurrentMediaPreview({ url, thumbnailUrl, mediaType, onRemove }) {
  const type = mediaType ?? "video";
  const ytId = type === "video" ? getYouTubeId(url) : null;

  const typeLabel = { video: "Vídeo", image: "Imagem", audio: "Áudio" }[type] ?? "Mídia";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Mídia atual · <span className="text-foreground">{typeLabel}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive border border-border hover:border-destructive/40 rounded-lg px-2.5 py-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remover
          </button>
        </div>
      </div>

      {/* Preview */}
      {type === "image" && (
        <div className="rounded-xl overflow-hidden border border-border bg-muted/30 max-h-52 flex items-center justify-center">
          <img src={url} alt="Mídia atual" className="max-h-52 w-auto object-contain" />
        </div>
      )}

      {type === "audio" && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Music className="w-4.5 h-4.5 text-primary" />
          </div>
          <audio src={url} controls className="flex-1 h-8" />
        </div>
      )}

      {type === "video" && (
        <div className="rounded-xl overflow-hidden border border-border aspect-video bg-black">
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
              className="w-full h-full border-0"
              title="Vídeo atual"
              allowFullScreen
            />
          ) : thumbnailUrl ? (
            <div className="relative w-full h-full">
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <video src={url} controls className="w-full h-full" />
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════ */
export function CreationForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);

  const [form, setForm]           = useState(EMPTY);
  const [mediaMode, setMediaMode] = useState("url");   // "url" | "upload"
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [progress, setProgress]   = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loadingDoc, setLoadingDoc]   = useState(isEdit);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  /* Track the original uploaded URLs so we can delete them on replace */
  const [originalMedia, setOriginalMedia] = useState({ url: null, thumbnailUrl: null });
  /* Whether user explicitly removed the current media */
  const [mediaRemoved, setMediaRemoved]   = useState(false);

  /* Load existing document for edit */
  useEffect(() => {
    if (!isEdit) return;
    getDoc(doc(db, "creations", id)).then((snap) => {
      if (snap.exists()) {
        const data = { ...EMPTY, ...snap.data() };
        setForm(data);
        setOriginalMedia({
          url:          data.videoUrl     ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
        });
      }
      setLoadingDoc(false);
    });
  }, [id, isEdit]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const toggleTool = (name) =>
    set("aiUsed", form.aiUsed.includes(name)
      ? form.aiUsed.filter((t) => t !== name)
      : [...form.aiUsed, name]);

  /* ── Handle "remove current media" ──────────────────────── */
  function handleRemoveMedia() {
    setMediaRemoved(true);
    setForm((f) => ({ ...f, videoUrl: "", thumbnailUrl: null }));
    setMediaMode("upload"); // default to upload after removing
    setFile(null);
    setProgress(0);
    setUploadError(null);
  }

  /* ── auto-switch to upload when user drags a file ─────────── */
  useEffect(() => {
    const onDragEnter = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) setMediaMode("upload");
    };
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  /* ── file picker with validation ──────────────────────────── */
  function pickFile(f) {
    if (!f) return;
    const category = getMimeCategory(f);
    if (!category) {
      toast.error("Formato inválido", {
        description: "Envie um vídeo (MP4, MOV), imagem (JPG, PNG, WebP) ou áudio (MP3, WAV, OGG).",
      });
      return;
    }
    const limitMB = SIZE_LIMITS[category];
    if (f.size > limitMB * 1024 * 1024) {
      const labels = { video: "vídeos", image: "imagens", audio: "áudios" };
      toast.error("Arquivo muito grande", {
        description: `O limite para ${labels[category]} é ${limitMB} MB.`,
      });
      return;
    }
    setFile(f);
    set("mediaType", category);
    setProgress(0);
    setUploadError(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  /* ── compress image before upload ──────────────────────────── */
  async function compressImage(file, maxPx = 1920, quality = 0.85) {
    return new Promise((resolve) => {
      const img    = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const { naturalWidth: nw, naturalHeight: nh } = img;
        const scale = nw > maxPx ? maxPx / nw : 1;
        const w = Math.round(nw * scale);
        const h = Math.round(nh * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) { resolve(file); return; }
            // keep original extension readable but send as JPEG
            const name = file.name.replace(/\.[^.]+$/, ".jpg");
            resolve(new File([blob], name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(file); };
      img.src = objUrl;
    });
  }

  /* ── extract first frame of video as JPEG blob ─────────────── */
  function extractFirstFrame(videoFile) {
    return new Promise((resolve) => {
      const video  = document.createElement("video");
      const objUrl = URL.createObjectURL(videoFile);
      let done        = false;
      let seekStarted = false;

      const finish = (blob) => {
        if (done) return;
        done = true;
        video.onloadedmetadata = null;
        video.onloadeddata     = null;
        video.onseeked         = null;
        video.oncanplay        = null;
        video.onerror          = null;
        video.src = "";
        URL.revokeObjectURL(objUrl);
        resolve(blob);
      };

      const capture = () => {
        try {
          const vw = video.videoWidth, vh = video.videoHeight;
          if (!vw || !vh) { finish(null); return; }
          const w = Math.min(vw, 1280), h = Math.round(vh * (w / vw));
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(video, 0, 0, w, h);
          canvas.toBlob((blob) => finish(blob ?? null), "image/jpeg", 0.82);
        } catch { finish(null); }
      };

      const doSeek = () => {
        if (seekStarted || done) return;
        seekStarted = true;
        // Seek to 10% of duration or 0.5s — whichever is smaller — to get a real frame
        const target = video.duration && isFinite(video.duration)
          ? Math.min(video.duration * 0.1, 0.5)
          : 0.1;
        video.currentTime = Math.max(target, 0.05);
      };

      const timeout = setTimeout(() => {
        console.warn("[extractFirstFrame] timeout — capturing current frame");
        if (video.videoWidth > 0) capture(); else finish(null);
      }, 15_000);

      // ⚠️ crossOrigin MUST NOT be set for blob: URLs — it breaks canvas capture
      video.muted       = true;
      video.playsInline = true;
      video.preload     = "metadata"; // "metadata" is enough to trigger loadedmetadata faster

      // 1. loadedmetadata → we know the duration, safe to seek
      video.onloadedmetadata = () => {
        if (video.videoWidth > 0) doSeek();
      };

      // 2. loadeddata fallback → frame data available
      video.onloadeddata = () => {
        if (!seekStarted && video.videoWidth > 0) doSeek();
      };

      // 3. seeked → frame is at the seeked position, capture it
      video.onseeked = () => {
        clearTimeout(timeout);
        capture();
      };

      // 4. canplay last-resort fallback
      video.oncanplay = () => {
        if (!done && !seekStarted && video.videoWidth > 0) doSeek();
      };

      video.onerror = () => { clearTimeout(timeout); finish(null); };

      video.src = objUrl;
      video.load();
    });
  }

  /* ── upload media to Storage ────────────────────────────────── */
  async function uploadMedia() {
    if (!file) return { videoUrl: form.videoUrl, thumbnailUrl: form.thumbnailUrl };

    setUploadError(null);
    const toastId  = "upload";
    const category = getMimeCategory(file) ?? form.mediaType ?? "video";

    const STORAGE_ERRORS = {
      "storage/unauthorized":         "Sem permissão. Verifique as regras do Firebase Storage.",
      "storage/canceled":             "Upload cancelado.",
      "storage/retry-limit-exceeded": "Upload falhou — CORS não configurado. Rode: gsutil cors set cors.json gs://SEU-BUCKET",
      "storage/cannot-slice-blob":    "Não foi possível ler o arquivo. Tente novamente.",
    };

    const folderMap = { video: "videos", image: "images", audio: "audio" };
    const labelMap  = { video: "Enviando vídeo…", image: "Enviando imagem…", audio: "Enviando áudio…" };
    const folder    = folderMap[category] ?? "videos";
    const loadMsg   = labelMap[category]  ?? "Enviando arquivo…";

    // Compress images before upload (max 1920px, JPEG 85%)
    let fileToUpload = file;
    if (category === "image") {
      toast.loading("Comprimindo imagem…", { id: toastId });
      fileToUpload = await compressImage(file);
      const saved = Math.round((1 - fileToUpload.size / file.size) * 100);
      if (saved > 5) console.info(`[compress] ${(file.size/1024).toFixed(0)} KB → ${(fileToUpload.size/1024).toFixed(0)} KB (−${saved}%)`);
    }

    toast.loading(loadMsg, { id: toastId, description: "0%" });
    const mediaRef = ref(storage, `${folder}/${Date.now()}_${fileToUpload.name}`);

    const mediaUrl = await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(mediaRef, fileToUpload);
      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setProgress(pct);
          toast.loading(loadMsg, { id: toastId, description: `${pct}%` });
        },
        (err) => {
          const msg = STORAGE_ERRORS[err.code] ?? `Erro (${err.code})`;
          toast.error("Falha no upload", { id: toastId, description: msg });
          setUploadError(msg);
          const wrapped = new Error(msg);
          wrapped.isStorageError = true;
          reject(wrapped);
        },
        () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject),
      );
    });

    let thumbnailUrl = null;

    if (category === "image") {
      thumbnailUrl = mediaUrl; // image IS its own thumbnail
      const savedKB = Math.round((file.size - fileToUpload.size) / 1024);
      toast.success("Imagem enviada!", {
        id: toastId,
        description: savedKB > 10 ? `Comprimida — economizou ${savedKB} KB ✓` : "Upload concluído ✓",
      });
    } else if (category === "video") {
      toast.loading("Gerando thumbnail…", { id: toastId, description: "Extraindo primeiro frame…" });
      try {
        const thumbBlob = await extractFirstFrame(file);
        if (thumbBlob) {
          toast.loading("Enviando thumbnail…", { id: toastId });
          const thumbRef = ref(storage, `thumbnails/${Date.now()}_thumb.jpg`);
          await uploadBytes(thumbRef, thumbBlob);
          thumbnailUrl = await getDownloadURL(thumbRef);
        }
      } catch (e) { console.warn("[thumb]", e); }
      toast.success("Vídeo enviado!", {
        id: toastId,
        description: thumbnailUrl ? "Thumbnail gerada automaticamente ✓" : "Thumbnail indisponível",
      });
    } else {
      toast.success("Áudio enviado!", { id: toastId });
    }

    return { videoUrl: mediaUrl, thumbnailUrl };
  }

  /* ── save ──────────────────────────────────────────────────── */
  async function handleSave(e) {
    e.preventDefault();

    if (!form.where) {
      toast.error("Campo obrigatório", { description: "Selecione a área onde foi utilizado." });
      return;
    }

    // Media is required in all modes
    const hasMedia = (mediaMode === "url" && form.videoUrl.trim()) || file;
    if (!hasMedia) {
      toast.error("Mídia obrigatória", {
        description: "Adicione um vídeo, imagem ou áudio antes de salvar.",
      });
      return;
    }

    setSaving(true);
    setUploadError(null);

    try {
      let videoUrl     = form.videoUrl;
      let thumbnailUrl = form.thumbnailUrl ?? null;
      let mediaType    = form.mediaType;

      // Upload new file if provided
      if (file) {
        ({ videoUrl, thumbnailUrl } = await uploadMedia());
        mediaType = getMimeCategory(file) ?? mediaType;
      }

      // Only force "video" type when explicitly using URL mode on a new creation
      // or after the user removed the old media and typed a new URL.
      // Do NOT overwrite mediaType when editing an existing creation without changing media.
      if (mediaMode === "url" && !file && (!isEdit || mediaRemoved)) {
        mediaType = "video";
      }

      // Delete old Storage files if replacing or removing
      if (isEdit && originalMedia.url) {
        const replacing = file !== null;                  // new file uploaded
        const removing  = mediaRemoved && !file && mediaMode === "url"; // removed + re-entered URL
        if (replacing || mediaRemoved) {
          await deleteStorageFile(originalMedia.url);
          if (originalMedia.thumbnailUrl) await deleteStorageFile(originalMedia.thumbnailUrl);
        }
      }

      const payload = { ...form, videoUrl, thumbnailUrl, mediaType, updatedAt: serverTimestamp() };

      if (isEdit) {
        await updateDoc(doc(db, "creations", id), payload);
      } else {
        await addDoc(collection(db, "creations"), { ...payload, createdAt: serverTimestamp() });
      }

      toast.success(
        isEdit ? "Criação atualizada!" : "Criação publicada! 🎉",
        { description: form.title, duration: 5000 },
      );
      setSaved(true);
      setTimeout(() => navigate("/admin"), 1400);
    } catch (err) {
      console.error(err);
      if (!err.isStorageError) {
        toast.error("Erro ao salvar", { description: err.message });
        setUploadError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  /* ── drop zone icon ─────────────────────────────────────────── */
  function DropZoneIcon() {
    if (dragging) return <CloudUpload className="w-6 h-6 text-primary" />;
    if (file) {
      const t = getMimeCategory(file);
      if (t === "image") return <ImageIcon className="w-6 h-6 text-primary" />;
      if (t === "audio") return <Music className="w-6 h-6 text-primary" />;
      return <FileVideo className="w-6 h-6 text-primary" />;
    }
    return <Upload className="w-6 h-6 text-primary/70" />;
  }

  if (loadingDoc) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /* helpers */
  const fileCategory   = file ? getMimeCategory(file) : null;
  const mediaTypeLabel = fileCategory === "image" ? "imagem" : fileCategory === "audio" ? "áudio" : "vídeo";
  /* Show current media preview when: edit mode, has URL, user hasn't removed it */
  const showCurrentMedia = isEdit && form.videoUrl && !mediaRemoved;

  return (
    <>
    <ConfirmDialog
      open={cancelDialogOpen}
      onOpenChange={setCancelDialogOpen}
      title="Descartar alterações?"
      description="Qualquer informação preenchida será perdida. Tem certeza que deseja sair?"
      confirmLabel="Sim, sair"
      cancelLabel="Continuar editando"
      onConfirm={() => navigate("/admin")}
      variant="default"
    />
    <div className="max-w-2xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setCancelDialogOpen(true)}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-bold text-foreground text-xl">
            {isEdit ? "Editar Criação" : "Nova Criação"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Atualize os dados do conteúdo" : "Adicione um novo conteúdo à galeria"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">

        {/* ── Title + Date ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Field label="Título" required>
              <Input
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Vídeo institucional com HeyGen"
              />
            </Field>
          </div>
          <Field label="Data">
            <DatePicker
              value={form.date}
              onChange={(v) => set("date", v)}
              placeholder="Escolha a data"
            />
          </Field>
        </div>

        {/* ── Description ─────────────────────────────────── */}
        <Field label="Descrição">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Descreva o que foi criado, contexto e resultado…"
          />
        </Field>

        {/* ── Author + Area ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Autor">
            <Input
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="Nome da pessoa"
            />
          </Field>

          <Field label="Onde foi usado" required>
            <Select value={form.where} onValueChange={(v) => set("where", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área…" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* ── AI Tools ─────────────────────────────────────── */}
        <Field label="IAs utilizadas" required>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {TOOL_NAMES.map((name) => {
              const active  = form.aiUsed.includes(name);
              const toolDef = aiTools.find((t) => t.name === name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleTool(name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                  style={{
                    background:  active ? `${toolDef?.color}18` : "transparent",
                    borderColor: active ? `${toolDef?.color}55` : "var(--border)",
                    color:       active ? toolDef?.color : "var(--muted-foreground)",
                  }}
                >
                  {active && <CheckCircle2 className="w-3 h-3" />}
                  {name}
                </button>
              );
            })}
          </div>
        </Field>

        {/* ── Mídia ────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Label>Mídia</Label>
            <span className="text-[10px] text-destructive font-medium">obrigatório</span>
          </div>

          {/* ── Current media preview (edit only) ──────── */}
          {showCurrentMedia ? (
            <CurrentMediaPreview
              url={form.videoUrl}
              thumbnailUrl={form.thumbnailUrl}
              mediaType={form.mediaType}
              onRemove={handleRemoveMedia}
            />
          ) : (
            <>
              {/* ── warning when media was removed ─────── */}
              {isEdit && mediaRemoved && !file && mediaMode !== "url" && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  Mídia removida. Adicione uma nova para salvar.
                </div>
              )}

              {/* Mode toggle */}
              <div className="flex gap-2">
                <ModeBtn
                  active={mediaMode === "url"}
                  icon={Link2}
                  label="URL (YouTube / link)"
                  onClick={() => { setMediaMode("url"); setFile(null); }}
                />
                <ModeBtn
                  active={mediaMode === "upload"}
                  icon={Upload}
                  label="Upload de arquivo"
                  onClick={() => setMediaMode("upload")}
                />
              </div>

              {/* ── URL mode ─────────────────────────────── */}
              {mediaMode === "url" && (
                <Input
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  placeholder="https://youtu.be/... ou URL do vídeo"
                />
              )}

              {/* ── Upload mode ──────────────────────────── */}
              {mediaMode === "upload" && (
                <div className="flex flex-col gap-3">

                  {/* drop zone */}
                  <label
                    className={[
                      "relative flex flex-col items-center justify-center gap-3",
                      "border-2 border-dashed rounded-2xl p-8 cursor-pointer",
                      "transition-all duration-200 text-center select-none",
                      dragging
                        ? "border-primary bg-primary/8 scale-[1.01]"
                        : file
                          ? "border-primary/40 bg-primary/[0.03]"
                          : "border-border hover:border-primary/40 hover:bg-primary/[0.03]",
                    ].join(" ")}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
                    }}
                    onDrop={handleDrop}
                  >
                    <div className={[
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      dragging ? "bg-primary/20" : "bg-primary/10",
                    ].join(" ")}>
                      <DropZoneIcon />
                    </div>

                    <div>
                      {dragging ? (
                        <p className="text-sm font-semibold text-primary">Solte o arquivo aqui</p>
                      ) : file ? (
                        <>
                          <p className="text-sm font-semibold text-foreground truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {(file.size / 1024 / 1024).toFixed(1)} MB · {mediaTypeLabel}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            Arraste um arquivo ou{" "}
                            <span className="text-primary underline underline-offset-2">clique para selecionar</span>
                          </p>
                          <p className="text-xs text-muted-foreground/50 mt-0.5">
                            Vídeo (MP4, MOV · 500 MB) · Imagem (JPG, PNG · 20 MB) · Áudio (MP3, WAV · 100 MB)
                          </p>
                        </>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="video/*,image/*,audio/*"
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0])}
                    />
                  </label>

                  {/* image preview */}
                  {file && getMimeCategory(file) === "image" && (
                    <div className="rounded-xl overflow-hidden border border-border bg-muted/30 max-h-48 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="max-h-48 w-auto object-contain"
                      />
                    </div>
                  )}

                  {/* audio preview */}
                  {file && getMimeCategory(file) === "audio" && !saving && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      <audio src={URL.createObjectURL(file)} controls className="flex-1 h-8" />
                    </div>
                  )}

                  {/* upload error */}
                  {uploadError && (
                    <div className="flex flex-col gap-2 rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-xs text-destructive">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-medium">{uploadError}</span>
                      </div>
                      {uploadError.includes("CORS") && (
                        <div className="ml-6 flex flex-col gap-1.5 text-destructive/80">
                          <p className="font-semibold text-destructive">Como corrigir:</p>
                          <p>1. Instale o <a href="https://cloud.google.com/storage/docs/gsutil_install" target="_blank" rel="noreferrer" className="underline">Google Cloud SDK</a> e faça login: <code className="bg-destructive/10 px-1 rounded">gcloud auth login</code></p>
                          <p>2. Crie um arquivo <code className="bg-destructive/10 px-1 rounded">cors.json</code> e execute:</p>
                          <pre className="bg-destructive/10 rounded-lg p-2 text-[10px] overflow-x-auto whitespace-pre">{`gsutil cors set cors.json gs://SEU-PROJETO.appspot.com`}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* progress bar */}
                  {file && saving && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-primary tabular-nums w-10 text-right">
                        {progress}%
                      </span>
                    </div>
                  )}

                  {/* clear file */}
                  {file && !saving && (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setProgress(0);
                        setUploadError(null);
                        set("mediaType", originalMedia.url ? form.mediaType : "video");
                      }}
                      className="flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remover arquivo
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Published toggle ─────────────────────────────── */}
        <PublishedToggle
          value={form.published}
          onChange={(v) => set("published", v)}
        />

        {/* ── Footer buttons ───────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setCancelDialogOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || saved}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all ml-auto shadow-sm shadow-primary/20"
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
            ) : saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</>
            ) : (
              <><Save className="w-4 h-4" /> {isEdit ? "Atualizar" : "Publicar"}</>
            )}
          </button>
        </div>

      </form>
    </div>
    </>
  );
}
