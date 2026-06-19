/**
 * CreationForm — Add or edit an AI Creation
 * Supports: YouTube URL, external URL, or file upload (video / image / audio)
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@infra/firebase";
import { aiTools } from "@/data/aiTools";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Upload,
  Link2,
  Loader2,
  X,
  CheckCircle2,
  FileVideo,
  AlertCircle,
  CloudUpload,
  Music,
  Image as ImageIcon,
  Trash2,
  Film,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ── YouTube helpers ──────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
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
    if (e?.code !== "storage/object-not-found")
      console.warn("[deleteStorageFile]", e);
  }
}

const TOOL_NAMES = aiTools.map((t) => t.name);

/* ── Drop zone icon (declared outside render to avoid re-create) ── */
function DropZoneIcon({ dragging, file }) {
  if (dragging) return <CloudUpload className="w-6 h-6 text-primary" />;
  if (file) {
    const t = getMimeCategory(file);
    if (t === "image") return <ImageIcon className="w-6 h-6 text-primary" />;
    if (t === "audio") return <Music className="w-6 h-6 text-primary" />;
    return <FileVideo className="w-6 h-6 text-primary" />;
  }
  return <Upload className="w-6 h-6 text-primary/70" />;
}

const AREAS = [
  "Comercial",
  "Diretoria",
  "Financeiro",
  "Jurídico",
  "Jornalismo",
  "Marketing",
  "Operações",
  "RH",
  "TI",
  "Outro",
];

const EMPTY = {
  title: "",
  description: "",
  prompt: "",
  date: "",
  author: "",
  where: "",
  aiUsed: [],
  videoUrl: "",
  thumbnailUrl: null,
  mediaType: "video",
  published: true,
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
          {value
            ? "Visível para todos no portal"
            : "Somente administradores podem ver"}
        </p>
      </div>
    </div>
  );
}

/* ── Current media preview (edit mode) ───────────────────── */
function CurrentMediaPreview({ url, thumbnailUrl, mediaType, onRemove }) {
  const type = mediaType ?? "video";
  const ytId = type === "video" ? getYouTubeId(url) : null;

  const typeLabel =
    { video: "Vídeo", image: "Imagem", audio: "Áudio" }[type] ?? "Mídia";

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
          <img
            src={url}
            alt="Mídia atual"
            className="max-h-52 w-auto object-contain"
          />
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
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
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
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [mediaMode, setMediaMode] = useState("url"); // "url" | "upload"
  const [files, setFiles] = useState([]); // new File[] queued for upload
  const [dragging, setDragging] = useState(false);
  const [progresses, setProgresses] = useState({}); // { [idx]: 0-100 }
  const [uploadError, setUploadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(isEdit);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  /* Existing media items loaded from Firestore (edit mode) */
  const [existingItems, setExistingItems] = useState([]);
  const [originalExistingItems, setOriginalExistingItems] = useState([]);

  /* Load existing document for edit */
  useEffect(() => {
    if (!isEdit) return;
    getDoc(doc(db, "creations", id)).then((snap) => {
      if (snap.exists()) {
        const data = { ...EMPTY, ...snap.data() };
        setForm(data);
        // Derive existing media items (new format or legacy)
        const loaded = data.mediaItems?.length > 0
          ? data.mediaItems
          : (data.videoUrl ? [{ type: data.mediaType ?? "video", url: data.videoUrl, thumbnailUrl: data.thumbnailUrl ?? null }] : []);
        setExistingItems(loaded);
        setOriginalExistingItems(loaded);
      }
      setLoadingDoc(false);
    });
  }, [id, isEdit]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const toggleTool = (name) =>
    set(
      "aiUsed",
      form.aiUsed.includes(name)
        ? form.aiUsed.filter((t) => t !== name)
        : [...form.aiUsed, name],
    );

  /* ── Remove one existing item ────────────────────────────── */
  function removeExistingItem(idx) {
    setExistingItems(prev => prev.filter((_, i) => i !== idx));
  }

  /* ── auto-switch to upload when user drags a file ─────────── */
  useEffect(() => {
    const onDragEnter = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) setMediaMode("upload");
    };
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  /* ── file picker with validation (multi) ──────────────────── */
  function pickFiles(newFiles) {
    if (!newFiles?.length) return;
    const valid = [];
    for (const f of newFiles) {
      const category = getMimeCategory(f);
      if (!category) {
        toast.error("Formato inválido", { description: `${f.name} — envie vídeo, imagem ou áudio.` });
        continue;
      }
      const limitMB = SIZE_LIMITS[category];
      if (f.size > limitMB * 1024 * 1024) {
        const labels = { video: "vídeos", image: "imagens", audio: "áudios" };
        toast.error("Arquivo muito grande", { description: `${f.name} — limite ${labels[category]} é ${limitMB} MB.` });
        continue;
      }
      valid.push(f);
    }
    if (valid.length) {
      setFiles(prev => [...prev, ...valid]);
      setUploadError(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    pickFiles(Array.from(e.dataTransfer.files ?? []));
  }

  /* ── compress image before upload ──────────────────────────── */
  async function compressImage(file, maxPx = 1920, quality = 0.85) {
    return new Promise((resolve) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const { naturalWidth: nw, naturalHeight: nh } = img;
        const scale = nw > maxPx ? maxPx / nw : 1;
        const w = Math.round(nw * scale);
        const h = Math.round(nh * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }
            // keep original extension readable but send as JPEG
            const name = file.name.replace(/\.[^.]+$/, ".jpg");
            resolve(new File([blob], name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(file);
      };
      img.src = objUrl;
    });
  }

  /* ── extract first frame of video as JPEG blob ─────────────── */
  function extractFirstFrame(videoFile) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const objUrl = URL.createObjectURL(videoFile);
      let done = false;
      let seekStarted = false;

      const finish = (blob) => {
        if (done) return;
        done = true;
        video.onloadedmetadata = null;
        video.onloadeddata = null;
        video.onseeked = null;
        video.oncanplay = null;
        video.onerror = null;
        video.src = "";
        URL.revokeObjectURL(objUrl);
        resolve(blob);
      };

      const capture = () => {
        try {
          const vw = video.videoWidth,
            vh = video.videoHeight;
          if (!vw || !vh) {
            finish(null);
            return;
          }
          const w = Math.min(vw, 1280),
            h = Math.round(vh * (w / vw));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(video, 0, 0, w, h);
          canvas.toBlob((blob) => finish(blob ?? null), "image/jpeg", 0.82);
        } catch {
          finish(null);
        }
      };

      const doSeek = () => {
        if (seekStarted || done) return;
        seekStarted = true;
        // Seek to 10% of duration or 0.5s — whichever is smaller — to get a real frame
        const target =
          video.duration && isFinite(video.duration)
            ? Math.min(video.duration * 0.1, 0.5)
            : 0.1;
        video.currentTime = Math.max(target, 0.05);
      };

      const timeout = setTimeout(() => {
        console.warn("[extractFirstFrame] timeout — capturing current frame");
        if (video.videoWidth > 0) capture();
        else finish(null);
      }, 15_000);

      // ⚠️ crossOrigin MUST NOT be set for blob: URLs — it breaks canvas capture
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata"; // "metadata" is enough to trigger loadedmetadata faster

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

      video.onerror = () => {
        clearTimeout(timeout);
        finish(null);
      };

      video.src = objUrl;
      video.load();
    });
  }

  /* ── upload one file to Storage ──────────────────────────── */
  async function uploadOneFile(file, fileIdx) {
    const category = getMimeCategory(file) ?? "video";
    const STORAGE_ERRORS = {
      "storage/unauthorized": "Sem permissão. Verifique as regras do Firebase Storage.",
      "storage/canceled": "Upload cancelado.",
      "storage/retry-limit-exceeded": "Upload falhou — CORS não configurado.",
      "storage/cannot-slice-blob": "Não foi possível ler o arquivo. Tente novamente.",
    };
    const folderMap = { video: "videos", image: "images", audio: "audio" };
    const labelMap = { video: "Enviando vídeo…", image: "Enviando imagem…", audio: "Enviando áudio…" };
    const folder = folderMap[category] ?? "videos";
    const loadMsg = `${labelMap[category] ?? "Enviando…"} (${fileIdx + 1}/${files.length})`;
    const toastId = `upload-${fileIdx}`;

    let fileToUpload = file;
    if (category === "image") {
      toast.loading("Comprimindo imagem…", { id: toastId });
      fileToUpload = await compressImage(file);
    }

    toast.loading(loadMsg, { id: toastId, description: "0%" });
    const mediaRef = ref(storage, `${folder}/${Date.now()}_${fileToUpload.name}`);

    const url = await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(mediaRef, fileToUpload);
      task.on("state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setProgresses(prev => ({ ...prev, [fileIdx]: pct }));
          toast.loading(loadMsg, { id: toastId, description: `${pct}%` });
        },
        (err) => {
          const msg = STORAGE_ERRORS[err.code] ?? `Erro (${err.code})`;
          toast.error("Falha no upload", { id: toastId, description: msg });
          setUploadError(msg);
          const wrapped = new Error(msg); wrapped.isStorageError = true;
          reject(wrapped);
        },
        () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject),
      );
    });

    let thumbnailUrl = null;
    if (category === "image") {
      thumbnailUrl = url;
      toast.success("Imagem enviada!", { id: toastId, description: "Upload concluído ✓" });
    } else if (category === "video") {
      toast.loading("Gerando thumbnail…", { id: toastId });
      try {
        const blob = await extractFirstFrame(file);
        if (blob) {
          const tRef = ref(storage, `thumbnails/${Date.now()}_thumb.jpg`);
          await uploadBytes(tRef, blob);
          thumbnailUrl = await getDownloadURL(tRef);
        }
      } catch (e) { console.warn("[thumb]", e); }
      toast.success("Vídeo enviado!", { id: toastId, description: thumbnailUrl ? "Thumbnail gerada ✓" : "Sem thumbnail" });
    } else {
      toast.success("Áudio enviado!", { id: toastId });
    }
    return { type: category, url, thumbnailUrl };
  }

  /* ── upload all queued files ──────────────────────────────── */
  async function uploadAllFiles() {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      results.push(await uploadOneFile(files[i], i));
    }
    return results;
  }

  /* ── save ──────────────────────────────────────────────────── */
  async function handleSave(e) {
    e.preventDefault();

    if (!form.where) {
      toast.error("Campo obrigatório", { description: "Selecione a área onde foi utilizado." });
      return;
    }

    const hasMedia = existingItems.length > 0 || files.length > 0 || (mediaMode === "url" && form.videoUrl.trim());
    if (!hasMedia) {
      toast.error("Mídia obrigatória", { description: "Adicione pelo menos um vídeo, imagem ou áudio." });
      return;
    }

    setSaving(true);
    setUploadError(null);

    try {
      // Upload new files
      const newItems = files.length > 0 ? await uploadAllFiles() : [];

      // Build mediaItems: existing (kept) + new uploads + optional URL item
      let mediaItems;
      if (mediaMode === "url" && form.videoUrl.trim() && existingItems.length === 0 && files.length === 0) {
        mediaItems = [{ type: "video", url: form.videoUrl.trim(), thumbnailUrl: null }];
      } else {
        mediaItems = [...existingItems, ...newItems];
      }

      // Delete storage files that were removed from existingItems
      for (const orig of originalExistingItems) {
        const kept = existingItems.some(it => it.url === orig.url);
        if (!kept) {
          await deleteStorageFile(orig.url);
          if (orig.thumbnailUrl) await deleteStorageFile(orig.thumbnailUrl);
        }
      }

      // Legacy fields from first item for backward compat
      const first = mediaItems[0];
      const payload = {
        ...form,
        mediaItems,
        videoUrl: first?.url ?? "",
        thumbnailUrl: first?.thumbnailUrl ?? null,
        mediaType: first?.type ?? "video",
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(doc(db, "creations", id), payload);
      } else {
        await addDoc(collection(db, "creations"), { ...payload, createdAt: serverTimestamp() });
      }

      toast.success(isEdit ? "Criação atualizada!" : "Criação publicada! 🎉", { description: form.title, duration: 5000 });
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

  if (loadingDoc) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const showExistingItems = existingItems.length > 0;

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
              {isEdit
                ? "Atualize os dados do conteúdo"
                : "Adicione um novo conteúdo à galeria"}
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

          {/* ── Prompt ──────────────────────────────────────── */}
          <Field
            label="Prompt utilizado"
            hint="Visível na galeria com botão de cópia. Deixe em branco para omitir."
          >
            <Textarea
              rows={4}
              value={form.prompt}
              onChange={(e) => set("prompt", e.target.value)}
              placeholder="Cole aqui o prompt que gerou esse resultado…"
              className="font-mono text-xs"
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
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* ── AI Tools ─────────────────────────────────────── */}
          <Field label="IAs utilizadas" required>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {TOOL_NAMES.map((name) => {
                const active = form.aiUsed.includes(name);
                const toolDef = aiTools.find((t) => t.name === name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleTool(name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                    style={{
                      background: active
                        ? `${toolDef?.color}18`
                        : "transparent",
                      borderColor: active
                        ? `${toolDef?.color}55`
                        : "var(--border)",
                      color: active
                        ? toolDef?.color
                        : "var(--muted-foreground)",
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
              {(existingItems.length + files.length) > 0 && (
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {existingItems.length + files.length} item(s)
                </span>
              )}
            </div>

            {/* ── Existing items list (edit mode) ──────── */}
            {showExistingItems && (
              <div className="flex flex-col gap-2">
                {existingItems.map((item, i) => (
                  <div key={item.url} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20">
                    {/* mini preview */}
                    {item.type === "image" && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {item.type === "video" && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-black flex items-center justify-center">
                        {item.thumbnailUrl
                          ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          : <Film className="w-5 h-5 text-white/40" />}
                      </div>
                    )}
                    {item.type === "audio" && (
                      <div className="w-12 h-12 rounded-lg border border-border shrink-0 bg-primary/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground capitalize">{item.type}</p>
                      <p className="text-[11px] text-muted-foreground/60 truncate">{item.url.split("/").pop()?.split("?")[0]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingItem(i)}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── New files queued ─────────────────────── */}
            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                {files.map((f, i) => {
                  const cat = getMimeCategory(f);
                  const pct = progresses[i] ?? 0;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/[0.03]">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {cat === "image" ? <ImageIcon className="w-5 h-5 text-primary" /> : cat === "audio" ? <Music className="w-5 h-5 text-primary" /> : <Film className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                        <p className="text-[11px] text-muted-foreground/60">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                        {saving && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold text-primary tabular-nums w-8 text-right">{pct}%</span>
                          </div>
                        )}
                      </div>
                      {!saving && (
                        <button type="button"
                          onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Mode toggle (only when no existing items, or always to add more) ── */}
            {(!showExistingItems || files.length > 0 || mediaMode === "url") && !saving && (
              <div className="flex gap-2">
                {!showExistingItems && (
                  <ModeBtn active={mediaMode === "url"} icon={Link2} label="URL (YouTube / link)"
                    onClick={() => { setMediaMode("url"); setFiles([]); }}
                  />
                )}
                <ModeBtn active={mediaMode === "upload"} icon={Upload}
                  label={showExistingItems ? "Adicionar mais arquivos" : "Upload de arquivo"}
                  onClick={() => setMediaMode("upload")}
                />
              </div>
            )}

            {/* ── URL mode ─────────────────────────────── */}
            {mediaMode === "url" && !showExistingItems && (
              <Input
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://youtu.be/... ou URL do vídeo"
              />
            )}

            {/* ── Upload / drop zone ────────────────────── */}
            {(mediaMode === "upload" || showExistingItems) && !saving && (
              <label
                className={[
                  "relative flex flex-col items-center justify-center gap-3",
                  "border-2 border-dashed rounded-2xl p-6 cursor-pointer",
                  "transition-all duration-200 text-center select-none",
                  dragging ? "border-primary bg-primary/8 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-primary/[0.03]",
                ].join(" ")}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
                onDrop={handleDrop}
              >
                <div className={["w-10 h-10 rounded-2xl flex items-center justify-center transition-colors", dragging ? "bg-primary/20" : "bg-primary/10"].join(" ")}>
                  <Upload className={`w-5 h-5 ${dragging ? "text-primary" : "text-primary/70"}`} />
                </div>
                {dragging ? (
                  <p className="text-sm font-semibold text-primary">Solte os arquivos aqui</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Arraste arquivos ou{" "}
                      <span className="text-primary underline underline-offset-2">clique para selecionar</span>
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                      Múltiplos arquivos · Vídeo (500 MB) · Imagem (20 MB) · Áudio (100 MB)
                    </p>
                  </>
                )}
                <input type="file" accept="video/*,image/*,audio/*" multiple className="hidden"
                  onChange={(e) => pickFiles(Array.from(e.target.files ?? []))}
                />
              </label>
            )}

            {/* upload error */}
            {uploadError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-xs text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{uploadError}</span>
              </div>
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
                <>
                  <CheckCircle2 className="w-4 h-4" /> Salvo!
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />{" "}
                  {isEdit ? "Atualizar" : "Publicar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
