/**
 * PremioInscricaoDetail — /admin/inscricoes/:id
 *
 * Painel completo de visualização + avaliação de uma inscrição.
 * Sistema de avaliação baseado no documento oficial "Comitê do Programa de Reconhecimento de IA":
 *   • 4 avaliadores pontuam (Marcus Sarney, Edson Lima, Pablo Lima, Danielle Lima)
 *   • 1 DPO valida sem pontuar (Hugo Aless)
 *   • Critérios: Impacto no Negócio 40% | Produtividade 25% | Inovação 20% | Replicabilidade 15%
 *   • Score final = média ponderada dos avaliadores × 10 (0–100)
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@infra/firebase";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, AlertCircle, Save, User,
  Zap, Users, CheckCircle2, Trophy, XCircle,
  FileText, BarChart3, Target, Shield,
  Download, File, FileImage, FileSpreadsheet, Paperclip, Eye,
  ChevronDown, ChevronUp, Star, Info,
} from "lucide-react";
import { FilePreviewModal } from "./FilePreviewModal";
import { STATUS_MAP } from "./PremioInscricoes";

import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ── Tooltip de ajuda ────────────────────────────────────────── */
function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((p) => !p)}
        className="w-4 h-4 rounded-full border border-muted-foreground/30 bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground/60 transition-colors"
        aria-label="Ajuda"
      >
        <Info className="w-2.5 h-2.5" />
      </button>
      {open && (
        <span className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 p-3 rounded-xl bg-popover border border-border shadow-xl text-xs text-muted-foreground leading-relaxed pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   Constantes do sistema de avaliação
   ══════════════════════════════════════════════════════════════ */
const CRITERIA = [
  { key: "impacto",         label: "Impacto no Negócio",    weight: 40,
    desc: "Resultado para receita, audiência ou eficiência operacional" },
  { key: "produtividade",   label: "Ganho de Produtividade", weight: 25,
    desc: "Redução de tempo ou esforço operacional" },
  { key: "inovacao",        label: "Inovação",              weight: 20,
    desc: "Uso criativo e transformador da IA" },
  { key: "replicabilidade", label: "Replicabilidade",       weight: 15,
    desc: "Potencial de expansão para outras áreas" },
];

const EVALUATORS = [
  { key: "marcus",   name: "Marcus Sarney",  title: "Presidente da Banca",
    role: "Executivo", color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/8 border-amber-500/20",
    avalia: "Alinhamento ao negócio · Impacto corporativo · Potencial de escala" },
  { key: "edson",    name: "Edson Lima",     title: "Diretor de Tecnologia",
    role: "Tecnologia", color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/8 border-indigo-500/20",
    avalia: "Alinhamento ao negócio · Impacto corporativo · Potencial de escala" },
  { key: "pablo",    name: "Pablo Lima",     title: "Gerência TI / Transf. Digital",
    role: "TI", color: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-500/8 border-cyan-500/20",
    avalia: "Uso adequado da IA · Qualidade da solução · Potencial de expansão" },
  { key: "danielle", name: "Danielle Lima",  title: "RH / Desenvolvimento Org.",
    role: "RH", color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/8 border-emerald-500/20",
    avalia: "Disseminação do conhecimento · Colaboração · Desenvolvimento de competências" },
];

const TRIAGEM_ITEMS = [
  { key: "formulario",  label: "Formulário preenchido corretamente" },
  { key: "evidencias",  label: "Evidências devidamente anexadas" },
  { key: "lgpd",        label: "Conformidade com LGPD declarada pelo participante" },
];

const DPO_ITEMS = [
  { key: "usoCorreto",   label: "Uso correto dos dados" },
  { key: "lgpd",         label: "Conformidade com LGPD" },
  { key: "politicas",    label: "Respeito às políticas internas" },
  { key: "ferramentas",  label: "Uso de ferramentas autorizadas" },
];

const PHASES = [
  { value: "triagem",      label: "Fase 1 — Triagem" },
  { value: "apresentacao", label: "Fase 2 — Apresentação" },
  { value: "deliberacao",  label: "Fase 3 — Deliberação" },
  { value: "premiacao",    label: "Fase 4 — Premiação" },
];

const CATEGORIES = [
  "Maior Ganho de Produtividade",
  "Melhor Inovação com IA",
  "Maior Impacto no Negócio",
  "IA Colaborativa",
  "Destaque do Trimestre",
];

const MEDALS = [
  { value: "ouro",         label: "🥇 Ouro",        pts: 100, cls: "border-amber-400/40  bg-amber-500/8  text-amber-600  dark:text-amber-400"  },
  { value: "prata",        label: "🥈 Prata",       pts: 70,  cls: "border-slate-400/40  bg-slate-500/8  text-slate-600  dark:text-slate-300"   },
  { value: "bronze",       label: "🥉 Bronze",      pts: 50,  cls: "border-orange-400/40 bg-orange-500/8 text-orange-600 dark:text-orange-400" },
  { value: "participacao", label: "✅ Participação", pts: 20,  cls: "border-emerald-400/40 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400" },
];

/* ── Cálculo de pontuação ───────────────────────────────────── */
function calcEvScore(evScores) {
  if (!evScores) return null;
  const hasAny = CRITERIA.some((c) => evScores[c.key] !== "" && evScores[c.key] != null);
  if (!hasAny) return null;
  return CRITERIA.reduce((sum, c) => sum + (Number(evScores[c.key] ?? 0) * c.weight), 0) / 10;
}

function calcFinalScore(scores) {
  if (!scores) return null;
  const evs = EVALUATORS.map((ev) => calcEvScore(scores[ev.key])).filter((s) => s !== null);
  if (!evs.length) return null;
  return Math.round((evs.reduce((a, b) => a + b, 0) / evs.length) * 10) / 10;
}

/* ══════════════════════════════════════════════════════════════
   Helpers de display
   ══════════════════════════════════════════════════════════════ */
function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Field({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">{label}</p>
      <p className={`text-sm text-foreground leading-relaxed ${mono ? "font-mono" : ""}`}>
        {Array.isArray(value) ? value.join(", ") || "—" : value}
      </p>
    </div>
  );
}

function Section({ title, icon: Icon, children, accent, info }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-amber-500/10" : "bg-primary/10"}`}>
          <Icon className={`w-3.5 h-3.5 ${accent ? "text-amber-500 dark:text-amber-400" : "text-primary"}`} />
        </div>
        <h3 className={`text-xs font-bold uppercase tracking-widest ${accent ? "text-amber-500 dark:text-amber-400" : "text-primary"}`}>{title}</h3>
        {info && <InfoTooltip text={info} />}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Tags({ items }) {
  if (!items?.length) return <p className="text-sm text-muted-foreground">—</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary/5 border-primary/20 text-primary">
          {t}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pendente;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ── Score bar ───────────────────────────────────────────────── */
function ScoreBar({ score, max = 100, colorClass = "bg-primary" }) {
  const pct = score != null ? Math.round((score / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Score circular display ─────────────────────────────────── */
function ScoreCircle({ score, label, size = "md" }) {
  const isSm = size === "sm";
  const cls = isSm
    ? "w-14 h-14 text-lg"
    : "w-20 h-20 text-2xl";
  const color =
    score == null ? "text-muted-foreground"
    : score >= 80 ? "text-emerald-500 dark:text-emerald-400"
    : score >= 60 ? "text-amber-500 dark:text-amber-400"
    : "text-rose-500 dark:text-rose-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${cls} rounded-full border-2 ${
        score == null ? "border-border" :
        score >= 80 ? "border-emerald-500/30 bg-emerald-500/8" :
        score >= 60 ? "border-amber-500/30 bg-amber-500/8" :
        "border-rose-500/30 bg-rose-500/8"
      } flex items-center justify-center font-black ${color}`}>
        {score != null ? score : "—"}
      </div>
      {label && <p className="text-[10px] text-muted-foreground text-center leading-tight">{label}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Painel de avaliação por avaliador
   ══════════════════════════════════════════════════════════════ */
function EvaluatorCard({ ev, evScores, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const score = calcEvScore(evScores);

  const setField = (key, val) => onChange(ev.key, key, val);

  return (
    <div className={`rounded-2xl border ${ev.bg} transition-all`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-black ${ev.bg} ${ev.color}`}>
          {ev.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-tight">{ev.name}</p>
          <p className="text-[10px] text-muted-foreground">{ev.title}</p>
        </div>
        <ScoreCircle score={score} size="sm" />
        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Critérios */}
      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border/30 pt-4">
          <p className="text-[10px] text-muted-foreground italic">{ev.avalia}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CRITERIA.map((c) => {
              const val = evScores?.[c.key] ?? "";
              const contribution = val !== "" ? (Number(val) * c.weight / 10).toFixed(1) : null;
              return (
                <div key={c.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">{c.label}</Label>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ev.bg} ${ev.color}`}>
                      {c.weight}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{c.desc}</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      value={val}
                      placeholder="0–10"
                      onChange={(e) => {
                        const n = e.target.value;
                        if (n === "") { setField(c.key, ""); return; }
                        const clamped = Math.max(0, Math.min(10, Number(n)));
                        setField(c.key, clamped);
                      }}
                      className="h-9 text-center font-bold text-base w-20 shrink-0"
                    />
                    <div className="flex-1">
                      <ScoreBar
                        score={Number(val) || 0}
                        max={10}
                        colorClass={ev.color.includes("amber") ? "bg-amber-500"
                          : ev.color.includes("indigo") ? "bg-indigo-500"
                          : ev.color.includes("cyan")   ? "bg-cyan-500"
                          : "bg-emerald-500"}
                      />
                      {contribution != null && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          +{contribution} pts ponderado
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total deste avaliador */}
          {score != null && (
            <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${ev.bg} border ${ev.bg}`}>
              <span className={`text-xs font-bold ${ev.color}`}>
                Score ponderado de {ev.name.split(" ")[0]}
              </span>
              <span className={`text-2xl font-black ${ev.color}`}>{score.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PremioInscricaoDetail — componente principal
   ══════════════════════════════════════════════════════════════ */
export function PremioInscricaoDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [previewFile, setPreviewFile] = useState(null);

  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  /* ── Estado da avaliação ────────────────────────────────── */
  const [status,             setStatus]             = useState("pendente");
  const [faseAtual,          setFaseAtual]          = useState("triagem");
  const [triagem,            setTriagem]            = useState({});
  const [dpoValidacao,       setDpoValidacao]       = useState({});
  const [scores,             setScores]             = useState({});
  const [categoriaVencedora, setCategoriaVencedora] = useState("");
  const [medalha,            setMedalha]            = useState("");
  const [notes,              setNotes]              = useState("");
  const [saving,             setSaving]             = useState(false);
  const [dirty,              setDirty]              = useState(false);

  /* ── Load ──────────────────────────────────────────────── */
  useEffect(() => {
    getDoc(doc(db, "premioInscricoes", id))
      .then((snap) => {
        if (!snap.exists()) { setNotFound(true); setLoading(false); return; }
        const d = { id: snap.id, ...snap.data() };
        setData(d);
        setStatus(d.status          ?? "pendente");
        setFaseAtual(d.faseAtual    ?? "triagem");
        setTriagem(d.triagem        ?? {});
        setDpoValidacao(d.dpoValidacao ?? {});
        setScores(d.scores          ?? {});
        setCategoriaVencedora(d.categoriaVencedora ?? "");
        setMedalha(d.medalha        ?? "");
        setNotes(d.adminNotes       ?? "");
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  /* ── Helpers para marcar "dirty" ────────────────────────── */
  const D = (fn) => (...a) => { fn(...a); setDirty(true); };

  const setEvScore = (evKey, critKey, val) => {
    setScores((prev) => ({
      ...prev,
      [evKey]: { ...(prev[evKey] ?? {}), [critKey]: val },
    }));
    setDirty(true);
  };

  const setTriagemItem = (key, val) => {
    setTriagem((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  const setDpoItem = (key, val) => {
    setDpoValidacao((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  /* ── Score final calculado ──────────────────────────────── */
  const finalScore = calcFinalScore(scores);

  /* ── Save ───────────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        status,
        faseAtual,
        triagem,
        dpoValidacao,
        scores,
        score:              finalScore ?? 0,
        categoriaVencedora: categoriaVencedora || null,
        medalha:            medalha || null,
        adminNotes:         notes,
        updatedAt:          serverTimestamp(),
      };
      await updateDoc(doc(db, "premioInscricoes", id), payload);
      setData((prev) => ({ ...prev, ...payload }));
      setDirty(false);
      toast.success("Avaliação salva com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  /* ── Estados de carregamento ────────────────────────────── */
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (notFound) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
      <div>
        <p className="font-medium text-muted-foreground">Inscrição não encontrada</p>
        <button onClick={() => navigate("/admin/inscricoes")}
          className="text-xs text-primary hover:underline mt-2 block">
          Voltar à lista
        </button>
      </div>
    </div>
  );

  /* ── Dados derivados ─────────────────────────────────────── */
  const tools = [
    ...(data.tools ?? []),
    data.toolOther ? `${data.toolOther} (outra)` : "",
  ].filter(Boolean);

  const benefits = [
    ...(data.benefits ?? []),
    data.benefitOther ? `${data.benefitOther} (outro)` : "",
  ].filter(Boolean);

  const previousMethods = [
    ...(data.previousMethod ?? []),
    data.previousMethodOther ? `${data.previousMethodOther} (outro)` : "",
  ].filter(Boolean);

  const triagemOk = TRIAGEM_ITEMS.every((t) => triagem[t.key]);
  const dpoOk     = DPO_ITEMS.every((t) => dpoValidacao[t.key]);

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/inscricoes")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">{data.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <StatusBadge status={data.status ?? "pendente"} />
              {data.score != null && (
                <span className="text-xs font-bold text-primary">{data.score} pts</span>
              )}
              {data.medalha && (
                <span className="text-xs font-semibold">
                  {MEDALS.find((m) => m.value === data.medalha)?.label}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{fmtDate(data.createdAt)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            dirty
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvando…" : "Salvar avaliação"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PAINEL DE AVALIAÇÃO
          ═══════════════════════════════════════════════════════ */}

      {/* ── Status e Fase ─────────────────────────────────── */}
      <Section
        title="Status da Avaliação"
        icon={Trophy}
        accent
        info="Use a Fase para controlar em que etapa do processo a inscrição está. Use o Status para definir o resultado: 'Aprovado' faz o caso aparecer no ranking e nos Casos de Sucesso da página pública. 'Rejeitado' notifica o participante. Sempre clique em 'Salvar avaliação' após alterar."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Fase atual do processo
            </Label>
            <Select value={faseAtual} onValueChange={D(setFaseAtual)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHASES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Status da inscrição
            </Label>
            <Select value={status} onValueChange={D(setStatus)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_MAP).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* ── Fase 1: Triagem ────────────────────────────────── */}
      <Section
        title="Fase 1 — Triagem (RH + TI)"
        icon={CheckCircle2}
        info="Antes de avaliar, verifique se a inscrição está completa. Marque os três itens do checklist e peça ao Hugo Aless (DPO) que confirme os quatro itens de conformidade. Só avance para a avaliação se tudo estiver OK."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Validações básicas */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Checklist de triagem
            </p>
            {TRIAGEM_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-2.5">
                <Checkbox
                  id={`triagem-${item.key}`}
                  checked={!!triagem[item.key]}
                  onCheckedChange={(v) => setTriagemItem(item.key, !!v)}
                />
                <label
                  htmlFor={`triagem-${item.key}`}
                  className="text-sm text-foreground cursor-pointer leading-tight"
                >
                  {item.label}
                </label>
              </div>
            ))}

            {/* Status triagem */}
            <div className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-xl border text-xs font-semibold ${
              triagemOk
                ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/8 border-amber-500/20 text-amber-600 dark:text-amber-400"
            }`}>
              {triagemOk
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <AlertCircle className="w-3.5 h-3.5" />}
              {triagemOk ? "Triagem aprovada — apto para avaliação" : "Triagem pendente de validação"}
            </div>
          </div>

          {/* DPO */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Validação DPO
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Hugo Aless — Segurança da Informação
                <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Não pontua
                </span>
              </p>
            </div>
            {DPO_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-2.5">
                <Checkbox
                  id={`dpo-${item.key}`}
                  checked={!!dpoValidacao[item.key]}
                  onCheckedChange={(v) => setDpoItem(item.key, !!v)}
                />
                <label
                  htmlFor={`dpo-${item.key}`}
                  className="text-sm text-foreground cursor-pointer leading-tight"
                >
                  {item.label}
                </label>
              </div>
            ))}

            <div className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-xl border text-xs font-semibold ${
              dpoOk
                ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/8 border-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}>
              {dpoOk
                ? <Shield className="w-3.5 h-3.5" />
                : <XCircle className="w-3.5 h-3.5" />}
              {dpoOk ? "DPO validado — conformidade confirmada" : "DPO: validação pendente"}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Fase 3: Avaliação do Comitê ──────────────────────── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border/50">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex-1">
            Fase 3 — Avaliação do Comitê
          </h3>
          <InfoTooltip text="Cada avaliador dá notas de 0 a 10 para os 4 critérios. O sistema calcula automaticamente o score ponderado de cada avaliador (ex: nota 8 em Impacto vale 8×40%=32 pontos). O Score Final é a média dos 4 avaliadores. Clique no nome do avaliador para expandir e preencher as notas." />
          <div className="text-[10px] text-muted-foreground text-right">
            Cada critério: nota de <strong>0 a 10</strong>
          </div>
        </div>

        {/* Pesos dos critérios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {CRITERIA.map((c) => (
            <div key={c.key} className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-foreground">{c.label}</span>
                <span className="text-[10px] font-black text-primary">{c.weight}%</span>
              </div>
              <ScoreBar score={c.weight} max={100} colorClass="bg-primary/60" />
            </div>
          ))}
        </div>

        {/* Avaliadores */}
        <div className="flex flex-col gap-3">
          {EVALUATORS.map((ev) => (
            <EvaluatorCard
              key={ev.key}
              ev={ev}
              evScores={scores[ev.key]}
              onChange={setEvScore}
            />
          ))}
        </div>
      </div>

      {/* ── Score Final + Premiação ───────────────────────────── */}
      <Section
        title="Resultado & Premiação"
        icon={Trophy}
        accent
        info="O Score Final é calculado automaticamente com base nas notas dos avaliadores. Para o caso aparecer no ranking público e nos Casos de Sucesso, você precisa: (1) definir o Status como 'Aprovado', (2) salvar. Selecione também a Categoria e a Medalha para que apareçam na página pública."
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Score final */}
          <div className="flex flex-col items-center gap-2">
            <ScoreCircle score={finalScore} label="Score Final" />
            <p className="text-[10px] text-muted-foreground text-center max-w-[120px] leading-tight">
              Média ponderada dos {EVALUATORS.length} avaliadores
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4 w-full">
            {/* Scores por avaliador (resumo) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EVALUATORS.map((ev) => {
                const s = calcEvScore(scores[ev.key]);
                return (
                  <div key={ev.key} className={`flex flex-col gap-1 p-2.5 rounded-xl border ${ev.bg}`}>
                    <span className={`text-[10px] font-bold ${ev.color}`}>
                      {ev.name.split(" ")[0]}
                    </span>
                    <span className={`text-xl font-black ${ev.color}`}>
                      {s != null ? s.toFixed(1) : "—"}
                    </span>
                    <ScoreBar
                      score={s ?? 0}
                      max={100}
                      colorClass={
                        ev.color.includes("amber") ? "bg-amber-500"
                        : ev.color.includes("indigo") ? "bg-indigo-500"
                        : ev.color.includes("cyan") ? "bg-cyan-500"
                        : "bg-emerald-500"
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* Categoria + Medalha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Categoria vencedora
                </Label>
                <Select value={categoriaVencedora} onValueChange={D(setCategoriaVencedora)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecionar categoria…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Medalha & Pontos para ranking
                </Label>
                <Select value={medalha} onValueChange={D(setMedalha)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecionar medalha…" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDALS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label} (+{m.pts} pts ranking anual)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Notas internas ───────────────────────────────────── */}
      <Section
        title="Notas Internas da Banca"
        icon={FileText}
        info="Campo de uso exclusivo da banca. O participante não tem acesso a este conteúdo. Use para registrar a decisão da reunião, pontos fortes/fracos do case, ressalvas ou justificativas da pontuação."
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Observações (não visíveis ao participante)
          </Label>
          <Textarea
            rows={4}
            value={notes}
            onChange={D((e) => setNotes(e.target.value))}
            placeholder="Decisões da banca, pontos de destaque, justificativa da nota, feedbacks internos…"
            className="resize-none"
          />
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          DADOS DO FORMULÁRIO (read-only)
          ═══════════════════════════════════════════════════════ */}

      {/* ── Dados do Participante ───────────────────────────── */}
      <Section title="Dados do Participante" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome completo"        value={data.name}      />
          <Field label="Cargo"                value={data.role}      />
          <Field label="Área / Departamento"  value={data.dept}      />
          <Field label="Gestor imediato"      value={data.manager}   />
          <Field label="E-mail corporativo"   value={data.email}     />
          <Field label="Data"                 value={data.date}      />
          <Field label="Assinatura eletrônica" value={data.signature} />
        </div>
      </Section>

      {/* ── Coautores ─────────────────────────────────────────── */}
      {(data.coautores?.length > 0) && (
        <Section title="Coautores do Caso" icon={Users}>
          <div className="flex flex-col gap-4">
            {data.coautores.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Coautor {i + 1} — Nome</p>
                  <p className="text-sm text-foreground">{c.name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Cargo</p>
                  <p className="text-sm text-foreground">{c.role || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">E-mail</p>
                  <p className="text-sm text-foreground">{c.email || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 1. Sobre o Desafio ────────────────────────────────── */}
      <Section title="1. Sobre o Desafio" icon={Target}>
        <Field label="Qual era o problema / oportunidade?" value={data.challenge} />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
            Como era realizado anteriormente
          </p>
          <Tags items={previousMethods} />
        </div>
      </Section>

      {/* ── 2. Uso da IA ──────────────────────────────────────── */}
      <Section title="2. Uso da IA" icon={Zap}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
            Ferramentas utilizadas
          </p>
          <Tags items={tools} />
        </div>
        <Field label="Como a IA foi aplicada"  value={data.application} />
        <Field label="Frequência de uso"       value={data.frequency}   />
      </Section>

      {/* ── 3. Resultados ─────────────────────────────────────── */}
      <Section title="3. Resultados Obtidos" icon={BarChart3}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
            Benefícios alcançados
          </p>
          <Tags items={benefits} />
        </div>
        <Field label="Estimativa de ganho de tempo" value={data.timeGain}   />
        <Field label="Descrição dos resultados"     value={data.results}    />
        <Field label="Resultado mensurável?"        value={data.measurable} />
        {data.measurable === "Sim" && (
          <Field label="Indicadores" value={data.indicators} />
        )}
      </Section>

      {/* ── 4. Impacto ────────────────────────────────────────── */}
      <Section title="4. Impacto para a Empresa" icon={Target}>
        <Field label="A solução beneficia"              value={data.scope}                />
        <Field label="Pode ser replicada?"              value={data.replicable}           />
        {(data.replicable === "Sim" || data.replicable === "Parcialmente") && (
          <Field label="Como outras áreas poderiam usar" value={data.replicableExplanation} />
        )}
      </Section>

      {/* ── 5. Evidências ─────────────────────────────────────── */}
      {(data.files?.length > 0) && (
        <Section title="5. Evidências Anexadas" icon={Paperclip}>
          <div className="flex flex-col gap-2">
            {data.files.map((f, i) => {
              const isImage = f.type?.startsWith("image/");
              const isPdf   = f.type === "application/pdf";
              const isXlsx  = f.name?.endsWith(".xlsx") || f.type?.includes("spreadsheet");
              const Icon2   = isImage ? FileImage : isXlsx ? FileSpreadsheet : isPdf ? FileText : File;
              const iconColor = isImage ? "text-indigo-400" : isXlsx ? "text-emerald-400" : isPdf ? "text-rose-400" : "text-muted-foreground";
              const sizeStr   = f.size
                ? f.size < 1024 * 1024
                  ? `${(f.size / 1024).toFixed(1)} KB`
                  : `${(f.size / (1024 * 1024)).toFixed(1)} MB`
                : "";
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-accent/20 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon2 className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                    {sizeStr && <p className="text-xs text-muted-foreground">{sizeStr}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewFile(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border border-border hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Visualizar</span>
                    </button>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={f.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/8 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Baixar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── 6. Resumo ─────────────────────────────────────────── */}
      <Section title="6. Apresentação do Caso" icon={FileText}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
            Resumo (até 500 caracteres)
          </p>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
            <p className="text-sm text-foreground leading-relaxed italic">"{data.summary}"</p>
          </div>
        </div>
      </Section>

      {/* ── Declaração ────────────────────────────────────────── */}
      <Section title="Declaração LGPD" icon={CheckCircle2}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Participante declarou veracidade das informações e conformidade com as políticas de Segurança e LGPD do Grupo Mirante.
          </p>
        </div>
      </Section>

      {/* ── Preview Modal ─────────────────────────────────────── */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* ── Save rodapé ──────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          onClick={() => navigate("/admin/inscricoes")}
          className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            dirty
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvando…" : "Salvar avaliação"}
        </button>
      </div>
    </div>
  );
}
