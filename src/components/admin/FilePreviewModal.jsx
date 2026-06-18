/**
 * FilePreviewModal — visualização de arquivos em modal
 * Suporta: imagens, PDF, TXT, DOC/DOCX/XLS/XLSX (via Google Docs Viewer)
 */
import { useState, useEffect } from "react";
import {
  X, Loader2, Download, ExternalLink, AlertCircle,
  File, FileImage, FileText, FileSpreadsheet,
} from "lucide-react";

/* ── Detecta o tipo de preview ──────────────────────────── */
function getPreviewType(file) {
  const type = file.type ?? "";
  const name = file.name ?? "";
  const ext  = name.split(".").pop()?.toLowerCase();

  if (type.startsWith("image/"))                          return "image";
  if (type === "application/pdf")                         return "pdf";
  if (type === "text/plain" || ext === "txt")             return "text";
  if (
    ext === "doc" || ext === "docx" ||
    ext === "xls" || ext === "xlsx" ||
    type.includes("word") || type.includes("spreadsheet") || type.includes("excel")
  )                                                       return "office";
  return "none";
}

/* ── Ícone pelo tipo ─────────────────────────────────────── */
function FileTypeIcon({ file, className = "w-5 h-5" }) {
  const type = file.type ?? "";
  const name = file.name ?? "";
  if (type.startsWith("image/"))
    return <FileImage className={`${className} text-indigo-400`} />;
  if (type === "application/pdf")
    return <FileText className={`${className} text-rose-400`} />;
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || type.includes("spreadsheet") || type.includes("excel"))
    return <FileSpreadsheet className={`${className} text-emerald-400`} />;
  return <File className={`${className} text-muted-foreground`} />;
}

/* ── Modal ───────────────────────────────────────────────── */
export function FilePreviewModal({ file, onClose }) {
  const [textContent,  setTextContent]  = useState("");
  const [frameLoaded,  setFrameLoaded]  = useState(false);
  const [imgLoaded,    setImgLoaded]    = useState(false);
  const [textLoading,  setTextLoading]  = useState(false);

  const previewType = getPreviewType(file);
  const loading = previewType === "image"  ? !imgLoaded
                : previewType === "pdf"    ? !frameLoaded
                : previewType === "office" ? !frameLoaded
                : previewType === "text"   ? textLoading
                : false;

  /* Carrega TXT */
  useEffect(() => {
    if (previewType !== "text") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTextLoading(true);
    fetch(file.url)
      .then((r) => r.text())
      .then((t) => { setTextContent(t); setTextLoading(false); })
      .catch(() => { setTextContent("Não foi possível carregar o conteúdo."); setTextLoading(false); });
  }, [file.url, previewType]);

  /* Fecha com ESC */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const officeUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
          <FileTypeIcon file={file} className="w-4 h-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{file.name}</p>
            {file.size && (
              <p className="text-[10px] text-muted-foreground">
                {file.size < 1024 * 1024
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
              </p>
            )}
          </div>

          {/* Ações — no mobile só ícones, no desktop com label */}
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-auto sm:px-3 sm:gap-1.5 rounded-lg flex items-center justify-center text-xs font-semibold text-muted-foreground border border-border hover:text-foreground hover:bg-accent transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir</span>
            </a>

            <a
              href={file.url}
              download={file.name}
              className="w-8 h-8 sm:w-auto sm:px-3 sm:gap-1.5 rounded-lg flex items-center justify-center text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/8 transition-colors"
              title="Baixar"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Conteúdo ─────────────────────────────────── */}
        <div className="flex-1 overflow-auto relative min-h-[300px]">

          {/* Imagem */}
          {previewType === "image" && (
            <div className="flex items-center justify-center p-6 min-h-[400px] bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-lg"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
              />
            </div>
          )}

          {/* PDF */}
          {previewType === "pdf" && (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full border-0"
              style={{ height: "75vh" }}
              onLoad={() => setFrameLoaded(true)}
            />
          )}

          {/* TXT */}
          {previewType === "text" && !textLoading && (
            <div className="p-6">
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {textContent}
              </pre>
            </div>
          )}

          {/* DOC / DOCX / XLS / XLSX via Google Docs Viewer */}
          {previewType === "office" && (
            <div className="flex flex-col">
              <div className="px-4 py-2 bg-amber-500/8 border-b border-amber-500/15 text-xs text-amber-600 dark:text-amber-400">
                Visualização via Google Docs Viewer. Se o preview não carregar,{" "}
                <a href={file.url} download={file.name} className="font-semibold underline">
                  baixe o arquivo
                </a>.
              </div>
              <iframe
                src={officeUrl}
                title={file.name}
                className="w-full border-0"
                style={{ height: "72vh" }}
                onLoad={() => setFrameLoaded(true)}
              />
            </div>
          )}

          {/* Sem preview */}
          {previewType === "none" && (
            <div className="flex flex-col items-center gap-4 py-20 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Pré-visualização indisponível</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este formato não tem suporte de preview. Use o botão "Baixar" para abrir o arquivo.
                </p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
