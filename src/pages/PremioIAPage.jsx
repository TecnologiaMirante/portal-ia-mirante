/**
 * PremioIAPage — /premio-ia
 * Design alinhado ao Portal IA Mirante (glass-card · shimmer-text · reveal).
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Zap,
  Share2,
  Star,
  Medal,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  Users,
  Repeat2,
  BarChart3,
  Lightbulb,
  Rocket,
  TrendingUp,
  Crown,
  Sparkles,
  FileText,
  ShieldCheck,
  Sun,
  Moon,
  Loader2,
  UserPlus,
  X,
  Plus,
  File,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@infra/firebase";
import { toast } from "sonner";
/* E-mails são disparados pelo trigger Firestore — sem chamada do browser */
import { useTheme } from "@/hooks/useTheme";
import { LogoMirante } from "@/components/LogoMirante";
import { NeuralBg } from "@/components/effects/NeuralBg";

/* shadcn UI */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ── Dados mockados ──────────────────────────────────────── */
const steps = [
  {
    icon: Zap,
    step: "01",
    title: "Use IA no trabalho",
    description:
      "Aplique ferramentas de IA nas suas tarefas diárias e documente os resultados obtidos.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-100 dark:bg-amber-500/15 dark:border-amber-500/25",
  },
  {
    icon: FileText,
    step: "02",
    title: "Documente o caso",
    description:
      "Registre o desafio, a solução com IA, os resultados e o impacto gerado na sua área.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/15 dark:border-indigo-500/25",
  },
  {
    icon: Share2,
    step: "03",
    title: "Compartilhe os resultados",
    description:
      "Envie a inscrição pelo portal e inspire outras equipes com sua experiência.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/25",
  },
];

const categories = [
  {
    icon: Rocket,
    title: "Maior Ganho de Produtividade",
    badge: "Produtividade",
    description:
      "Para casos que geraram economia significativa de tempo e esforço nas atividades do dia a dia.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/15 dark:border-indigo-500/25",
  },
  {
    icon: Lightbulb,
    title: "Melhor Inovação com IA",
    badge: "Inovação",
    description:
      "Para soluções criativas e inéditas que utilizaram IA de forma original e diferenciada.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-100 dark:bg-amber-500/15 dark:border-amber-500/25",
  },
  {
    icon: TrendingUp,
    title: "Maior Impacto no Negócio",
    badge: "Negócio",
    description:
      "Casos que geraram resultados mensuráveis diretamente nas metas e objetivos estratégicos.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/25",
  },
  {
    icon: Users,
    title: "IA Colaborativa",
    badge: "Colaboração",
    description:
      "Para projetos que envolveram times multidisciplinares usando IA de forma integrada.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 border-cyan-100 dark:bg-cyan-500/15 dark:border-cyan-500/25",
  },
  {
    icon: Star,
    title: "Destaque do Trimestre",
    badge: "Destaque",
    description:
      "O case mais impactante do trimestre, independente da categoria. Votação interna + banca.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 border-rose-100 dark:bg-rose-500/15 dark:border-rose-500/25",
  },
];

const criteria = [
  {
    label: "Impacto no Negócio",
    weight: 40,
    color: "bg-indigo-500",
    track: "bg-indigo-100 dark:bg-indigo-500/15",
  },
  {
    label: "Economia de Tempo",
    weight: 25,
    color: "bg-amber-500",
    track: "bg-amber-100 dark:bg-amber-500/15",
  },
  {
    label: "Inovação",
    weight: 20,
    color: "bg-emerald-500",
    track: "bg-emerald-100 dark:bg-emerald-500/15",
  },
  {
    label: "Replicabilidade",
    weight: 15,
    color: "bg-rose-500",
    track: "bg-rose-100 dark:bg-rose-500/15",
  },
];

/* ranking e hallOfFame agora vêm do Firestore — sem dados mockados */

const deptOptions = [
  "Marketing",
  "Financeiro",
  "RH",
  "Comercial",
  "Jurídico",
  "Tecnologia",
  "Operações",
  "Produtos",
  "Gestão",
  "Outro",
];

/* ── Helpers de formulário ───────────────────────────────── */
const sectionTitle =
  "text-xs font-bold uppercase tracking-widest text-primary mb-4";

/* Checkbox group usando shadcn Checkbox */
function CheckGroup({ options, selected, onChange, name }) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const value = opt.value ?? opt;
        const label = opt.label ?? opt;
        const checked = selected.includes(value);
        return (
          <label
            key={value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Checkbox
              name={name}
              checked={checked}
              onCheckedChange={(v) =>
                onChange(
                  v
                    ? [...selected, value]
                    : selected.filter((x) => x !== value),
                )
              }
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* Radio group usando shadcn RadioGroup */
function RadioGroupField({ options, selected, onChange, name }) {
  return (
    <RadioGroup name={name} value={selected} onValueChange={onChange}>
      {options.map((opt) => {
        const value = opt.value ?? opt;
        const label = opt.label ?? opt;
        return (
          <label
            key={value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <RadioGroupItem value={value} />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
              {label}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}

/* ── Mini Navbar ────────────────────────────────────────── */
function PremioNavbar() {
  const { dark, toggle } = useTheme();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 navbar-solid border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <LogoMirante className="h-7 w-auto object-contain" />
            <span className="font-semibold text-foreground">
              Mirante <span className="gradient-text font-bold">IA</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              Prêmio IA
            </span>
            <button
              onClick={toggle}
              aria-label={dark ? "Modo claro" : "Modo escuro"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors"
            >
              {dark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Hero ───────────────────────────────────────────────── */
function HeroSection({ onScrollTo }) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden pt-14">
      <NeuralBg />
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-15"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.70 0.20 60 / 0.6) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "blob-drift-1 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.55 0.28 264 / 0.5) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "blob-drift-2 22s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-6">
        <div className="badge-glow inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-50/80 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          Prêmio IA Mirante · Edição 2026
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-foreground leading-tight">
          <span className="gradient-text-warm">Prêmio IA</span> Mirante
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Reconhecendo colaboradores que transformam Inteligência Artificial em
          resultados reais para o Grupo Mirante.
        </p>

        <p className="text-sm font-semibold text-amber-500 dark:text-amber-400 tracking-wide">
          Use IA. Compartilhe conhecimento. Gere impacto.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button
            onClick={() => onScrollTo("inscricao")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.19 60), oklch(0.60 0.22 30))",
            }}
          >
            <Trophy className="w-4 h-4" />
            Inscrever Caso
          </button>
          <button
            onClick={() => onScrollTo("ranking")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-border bg-background hover:bg-accent transition-all hover:-translate-y-0.5"
          >
            <Medal className="w-4 h-4" />
            Ver Ranking
          </button>
          <button
            onClick={() => onScrollTo("como-participar")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            Como Funciona
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border/50 w-full max-w-lg">
          {[
            { value: "5", label: "Categorias" },
            { value: "3ª", label: "Edição" },
            { value: "100%", label: "Reconhecimento" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold gradient-text-warm">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Como Participar ────────────────────────────────────── */
function ComoParticiparSection() {
  return (
    <section id="como-participar" className="py-16 section-alt">
      <div className="section-divider mb-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 pt-6">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-3 block">
              Como Funciona
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Três passos para{" "}
              <span className="gradient-text-warm">ser premiado</span>
            </h2>
            <p className="text-muted-foreground">
              O processo é simples e foi desenhado para valorizar quem já está
              usando IA no dia a dia.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-4">
          {steps.map((s, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1}`}>
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center ${s.bg}`}
                  >
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <span className="text-3xl font-black text-muted-foreground/20">
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider mt-0" />
    </section>
  );
}

/* ── Categorias ──────────────────────────────────────────── */
function CategoriasSection() {
  return (
    <section id="categorias" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Categorias
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Cinco formas de <span className="gradient-text">se destacar</span>
            </h2>
            <p className="text-muted-foreground">
              Cada categoria reconhece um tipo diferente de impacto gerado com
              IA.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <div key={i} className={`reveal reveal-delay-${(i % 3) + 1}`}>
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 h-full group hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center ${cat.bg}`}
                  >
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cat.bg} ${cat.color}`}
                  >
                    {cat.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="reveal reveal-delay-3">
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-full min-h-[160px] border-dashed opacity-60">
              <Trophy
                className="w-8 h-8 text-amber-500 dark:text-amber-400"
                strokeWidth={1.5}
              />
              <p className="text-sm text-muted-foreground text-center">
                Mais categorias podem ser adicionadas nas próximas edições.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Critérios ───────────────────────────────────────────── */
function CriteriosSection() {
  return (
    <section id="criterios" className="py-16 section-alt">
      <div className="section-divider mb-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 pt-6">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Avaliação
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Critérios de <span className="gradient-text">avaliação</span>
            </h2>
            <p className="text-muted-foreground">
              A banca avaliadora pondera cada critério com base no impacto real
              gerado pelo caso inscrito.
            </p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-4">
          {criteria.map((c, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1}`}>
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground text-sm">
                    {c.label}
                  </span>
                  <span className="text-2xl font-black gradient-text">
                    {c.weight}%
                  </span>
                </div>
                <div className={`w-full h-2.5 rounded-full ${c.track}`}>
                  <div
                    className={`h-2.5 rounded-full ${c.color}`}
                    style={{ width: `${c.weight}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider mt-0" />
    </section>
  );
}

/* ── Formulário de Inscrição ────────────────────────────── */
const TOOLS = [
  "ChatGPT",
  "Copilot",
  "Gemini",
  "Claude",
  "Perplexity",
  "Midjourney",
  "Power Automate com IA",
];
const PREVIOUS_METHODS = [
  "Manualmente",
  "Com ferramentas tradicionais",
  "Processo terceirizado",
  "Não existia solução anterior",
];
const FREQUENCY = ["Diariamente", "Semanalmente", "Mensalmente", "Uso pontual"];
const BENEFITS = [
  "Economia de tempo",
  "Redução de erros",
  "Aumento de produtividade",
  "Melhoria da qualidade",
  "Automação de tarefas",
  "Apoio à tomada de decisão",
  "Criação de nova solução",
];
const TIME_GAINS = [
  "Menos de 1 hora por semana",
  "Entre 1 e 5 horas por semana",
  "Entre 5 e 10 horas por semana",
  "Entre 10 e 20 horas por semana",
  "Mais de 20 horas por mês",
];
const SCOPE = [
  "Apenas meu trabalho",
  "Minha equipe",
  "Meu departamento",
  "Mais de uma área",
  "Toda a empresa",
];
const REPLICABLE = ["Sim", "Parcialmente", "Não"];

const emptyCoautor = { name: "", role: "", email: "" };

/* Gera UUID compatível com HTTP (dev) e HTTPS (produção) */
function generateUUID() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback para ambientes sem HTTPS
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const emptyForm = {
  /* Dados pessoais */
  name: "",
  role: "",
  dept: "",
  manager: "",
  email: "",
  /* Coautores (array) */
  coautores: [],
  /* 1. Desafio */
  challenge: "",
  previousMethod: [],
  previousMethodOther: "",
  /* 2. IA */
  tools: [],
  toolOther: "",
  application: "",
  frequency: "",
  /* 3. Resultados */
  benefits: [],
  benefitOther: "",
  timeGain: "",
  results: "",
  measurable: "",
  indicators: "",
  /* 4. Impacto */
  scope: "",
  replicable: "",
  replicableExplanation: "",
  /* 6. Apresentação */
  summary: "",
  /* Declaração */
  lgpd: false,
};

const MIRANTE_DOMAIN = "@mirante.com.br";

/* ── Ícone por tipo de arquivo ──────────────────────────── */
function fileIcon(file) {
  const t = file.type;
  if (t.startsWith("image/"))
    return <FileImage className="w-4 h-4 text-indigo-400" />;
  if (
    t.includes("spreadsheet") ||
    t.includes("excel") ||
    file.name.endsWith(".xlsx")
  )
    return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
  if (t === "application/pdf")
    return <FileText className="w-4 h-4 text-rose-400" />;
  return <File className="w-4 h-4 text-muted-foreground" />;
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export function InscricaoSectionExport(props) {
  return <InscricaoSection {...props} />;
}

function InscricaoSection({ prefill = null, editDocId = null }) {
  const isEditMode = !!editDocId;
  const [form, setForm] = useState(() =>
    prefill ? { ...emptyForm, ...prefill, lgpd: true } : emptyForm,
  );
  const [submitted, setSubmitted] = useState(false);

  /* Rola para o topo da seção após submit bem-sucedido */
  useEffect(() => {
    if (submitted) {
      setTimeout(() => {
        document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }, [submitted]);
  const [saveOk, setSaveOk] = useState(false); // flash "Salvo ✓" no edit mode
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [emailError, setEmailError] = useState("");
  const [coautorErrors, setCoautorErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(prefill?.files ?? []);
  const [savedDocId, setSavedDocId] = useState(null);
  const [savedToken, setSavedToken] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const charCount = form.summary.length;

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => {
      if (f.size > MAX_SIZE) {
        toast.error(`"${f.name}" excede 10MB`);
        return false;
      }
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (
        !ALLOWED_TYPES.includes(f.type) &&
        !["xlsx", "xls", "doc", "docx", "txt"].includes(ext)
      ) {
        toast.error(`Formato não suportado: ${f.name}`);
        return false;
      }
      return true;
    });
    setFiles((prev) => {
      const total = existingFiles.length + prev.length + valid.length;
      if (total > MAX_FILES) {
        const available = MAX_FILES - existingFiles.length - prev.length;
        if (available <= 0) {
          toast.error(`Máximo de ${MAX_FILES} arquivos`);
          return prev;
        }
        toast.error(`Máximo de ${MAX_FILES} arquivos`);
        return [...prev, ...valid.slice(0, available)];
      }
      return [...prev, ...valid];
    });
  };

  const removeFile = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const set = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const validateEmail = (value, setter) => {
    if (value && !value.endsWith(MIRANTE_DOMAIN)) {
      setter(`Use o e-mail corporativo ${MIRANTE_DOMAIN}`);
      return false;
    }
    setter("");
    return true;
  };

  /* ── Coautores helpers ─────────────────────────────────── */
  const addCoautor = () =>
    setForm((f) => ({
      ...f,
      coautores: [...f.coautores, { ...emptyCoautor }],
    }));

  const removeCoautor = (idx) => {
    setForm((f) => ({
      ...f,
      coautores: f.coautores.filter((_, i) => i !== idx),
    }));
    setCoautorErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const updateCoautor = (idx, field, value) =>
    setForm((f) => ({
      ...f,
      coautores: f.coautores.map((c, i) =>
        i === idx ? { ...c, [field]: value } : c,
      ),
    }));

  const validateCoautorEmail = (idx, value) => {
    const error =
      value && !value.endsWith(MIRANTE_DOMAIN)
        ? `Use o e-mail corporativo ${MIRANTE_DOMAIN}`
        : "";
    setCoautorErrors((prev) => ({ ...prev, [idx]: error }));
    return !error;
  };

  /* ── Submit ────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && !form.email.endsWith(MIRANTE_DOMAIN)) {
      setEmailError(`Use o e-mail corporativo ${MIRANTE_DOMAIN}`);
      document.querySelector('[name="email"]')?.focus();
      return;
    }

    let coautorValid = true;
    form.coautores.forEach((c, idx) => {
      if (c.email && !validateCoautorEmail(idx, c.email)) coautorValid = false;
    });
    if (!coautorValid) return;

    setSubmitting(true);
    setUploadStatus("Preparando envio…");
    try {
      /* Determina o docId e docRef conforme o modo */
      let docRef, docId;
      if (isEditMode) {
        docId = editDocId;
        docRef = doc(db, "premioInscricoes", editDocId);
      } else {
        docRef = doc(collection(db, "premioInscricoes"));
        docId = docRef.id;
      }

      /* Faz upload dos NOVOS arquivos — guarda refs para rollback em caso de erro */
      let uploadedNewFiles = [];
      const uploadedRefs = []; // para deletar se o Firestore falhar
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadStatus(`Enviando arquivos (${i + 1}/${files.length})…`);
          const fileRef = storageRef(
            storage,
            `premioInscricoes/${docId}/${file.name}`,
          );
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          uploadedNewFiles.push({
            name: file.name,
            url,
            size: file.size,
            type: file.type,
          });
          uploadedRefs.push(fileRef);
        }
      }

      const allFiles = [...existingFiles, ...uploadedNewFiles];

      setUploadStatus("Salvando inscrição…");

      try {
        if (isEditMode) {
          /* ── Modo edição: updateDoc + toast, sem substituir formulário ── */
          await updateDoc(docRef, {
            ...form,
            files: allFiles,
            updatedAt: serverTimestamp(),
          });

          /* Remove do Storage arquivos que o usuário removeu da lista */
          const removedFiles = (prefill?.files ?? []).filter(
            (orig) => !existingFiles.some((kept) => kept.url === orig.url),
          );
          if (removedFiles.length > 0) {
            await Promise.allSettled(
              removedFiles.map((f) => {
                const ref = storageRef(
                  storage,
                  `premioInscricoes/${docId}/${f.name}`,
                );
                return deleteObject(ref);
              }),
            );
          }

          toast.success("Inscrição atualizada com sucesso!");
          setSaveOk(true);
          setTimeout(() => setSaveOk(false), 2500);
          setFiles([]);
        } else {
          /* ── Modo criação: setDoc com editToken ──────── */
          const editToken = generateUUID();
          await setDoc(docRef, {
            ...form,
            status: "pendente",
            score: null,
            adminNotes: "",
            files: allFiles,
            editToken,
            createdAt: serverTimestamp(),
          });
          setSavedDocId(docId);
          setSavedToken(editToken);

          /* E-mails disparados automaticamente pelo trigger Firestore */
        }

        if (!isEditMode) setSubmitted(true);
      } catch (firestoreErr) {
        /* Firestore falhou — remove arquivos que já subiram (rollback) */
        if (uploadedRefs.length > 0) {
          setUploadStatus("Desfazendo upload…");
          await Promise.allSettled(
            uploadedRefs.map((ref) => deleteObject(ref)),
          );
        }
        throw firestoreErr; // re-lança para o catch externo exibir o toast de erro
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar inscrição. Tente novamente.", {
        description: err.message,
      });
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  /* ── Copiar para clipboard com fallback ───────────────── */
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        Object.assign(ta.style, { position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none" });
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.", { duration: 4000 });
    }
  };

  /* ── Success state ─────────────────────────────────────── */
  if (submitted) {
    const coautorEmails = form.coautores
      .filter((c) => c.email)
      .map((c) => c.email);
    const editUrl =
      savedDocId && savedToken
        ? `${window.location.origin}/premio-ia/editar/${savedDocId}?token=${savedToken}`
        : null;

    return (
      <section id="inscricao" className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2
                className="w-10 h-10 text-emerald-500 dark:text-emerald-400"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {isEditMode ? "Inscrição atualizada!" : "Inscrição enviada!"}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {isEditMode ? (
                  <>
                    Sua inscrição foi atualizada com sucesso,{" "}
                    <strong>{form.name}</strong>!
                  </>
                ) : (
                  <>
                    Obrigado por participar,{" "}
                    <strong>{form.name || "colaborador"}</strong>!<br />
                    Seu caso foi registrado e será avaliado pela banca do Prêmio
                    IA Mirante. Uma cópia foi enviada para{" "}
                    <strong>{form.email}</strong>
                    {coautorEmails.length > 0 && (
                      <>
                        {" "}
                        e para{" "}
                        {coautorEmails.map((e, i) => (
                          <span key={e}>
                            {i > 0 && ", "}
                            <strong>{e}</strong>
                          </span>
                        ))}
                      </>
                    )}
                    .
                  </>
                )}
              </p>
            </div>

            {/* Link de edição */}
            {editUrl && (
              <div className="w-full p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                    🔗 Link de edição enviado por e-mail
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use-o para corrigir sua inscrição antes do encerramento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(editUrl)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-colors"
                >
                  Copiar link
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {!isEditMode && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm(emptyForm);
                    setFiles([]);
                    setExistingFiles([]);
                    setSavedDocId(null);
                    setSavedToken(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition-colors"
                >
                  Nova inscrição
                </button>
              )}
              <button
                onClick={() =>
                  document
                    .getElementById("ranking")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.19 60), oklch(0.60 0.22 30))",
                }}
              >
                Ver Ranking
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inscricao" className="py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-3 block">
              {isEditMode ? "Editar inscrição" : "Inscrição"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {isEditMode ? (
                <>
                  Atualize seu{" "}
                  <span className="gradient-text-warm">caso de uso</span>
                </>
              ) : (
                <>
                  Inscreva seu{" "}
                  <span className="gradient-text-warm">caso de uso</span>
                </>
              )}
            </h2>
            <p className="text-muted-foreground">
              {isEditMode
                ? 'Altere os campos necessários e clique em "Salvar alterações".'
                : "Preencha com cuidado — quanto mais detalhado, maiores suas chances!"}
            </p>
          </div>
        </div>

        <div className="reveal glass-card rounded-3xl p-6 sm:p-8">
          {/* Chip de modo edição */}
          {isEditMode && (
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Modo edição
                </span>
                <span className="text-xs text-muted-foreground">
                  — alterações salvas imediatamente
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* ── Dados do Participante ─────────────────── */}
            <div>
              <p className={sectionTitle}>Dados do Participante</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label required>Nome completo</Label>
                  <Input
                    required
                    placeholder="Seu nome completo"
                    value={form.name}
                    onChange={set("name")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Cargo</Label>
                  <Input
                    required
                    placeholder="Ex: Analista de Marketing"
                    value={form.role}
                    onChange={set("role")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Área / Departamento</Label>
                  <Select
                    required
                    value={form.dept}
                    onValueChange={(v) => setForm((f) => ({ ...f, dept: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {deptOptions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Gestor imediato</Label>
                  <Input
                    required
                    placeholder="Nome do gestor"
                    value={form.manager}
                    onChange={set("manager")}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <Label required>E-mail corporativo</Label>
                  <Input
                    required
                    type="email"
                    name="email"
                    disabled={isEditMode}
                    className={
                      emailError
                        ? "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
                        : ""
                    }
                    placeholder="seu@mirante.com.br"
                    value={form.email}
                    onChange={(e) => {
                      set("email")(e);
                      if (emailError)
                        validateEmail(e.target.value, setEmailError);
                    }}
                    onBlur={(e) =>
                      !isEditMode &&
                      validateEmail(e.target.value, setEmailError)
                    }
                  />
                  {emailError && (
                    <p className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                      <X className="w-3 h-3" />
                      {emailError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Coautores ─────────────────────────────── */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className={sectionTitle + " mb-1"}>Coautores do Caso</p>
                  <p className="text-xs text-muted-foreground">
                    Inclua quem colaborou diretamente na solução com IA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCoautor}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary/40 text-xs font-semibold text-primary hover:bg-primary/5 hover:border-primary/60 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {form.coautores.length === 0 && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-dashed border-border/60">
                  <UserPlus className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Nenhum coautor adicionado. Clique em "Adicionar" se houver
                    colaboradores no caso.
                  </p>
                </div>
              )}

              {form.coautores.map((coautor, idx) => (
                <div
                  key={idx}
                  className="mt-3 p-4 rounded-2xl border border-border bg-muted/20 relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Coautor {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCoautor(idx)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      aria-label="Remover coautor"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label required>Nome completo</Label>
                      <Input
                        required
                        placeholder="Nome do coautor"
                        value={coautor.name}
                        onChange={(e) =>
                          updateCoautor(idx, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Cargo</Label>
                      <Input
                        placeholder="Cargo do coautor"
                        value={coautor.role}
                        onChange={(e) =>
                          updateCoautor(idx, "role", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label required>E-mail corporativo</Label>
                      <Input
                        required
                        type="email"
                        className={
                          coautorErrors[idx]
                            ? "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
                            : ""
                        }
                        placeholder="coautor@mirante.com.br"
                        value={coautor.email}
                        onChange={(e) => {
                          updateCoautor(idx, "email", e.target.value);
                          if (coautorErrors[idx])
                            validateCoautorEmail(idx, e.target.value);
                        }}
                        onBlur={(e) =>
                          validateCoautorEmail(idx, e.target.value)
                        }
                      />
                      {coautorErrors[idx] && (
                        <p className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                          <X className="w-3 h-3" />
                          {coautorErrors[idx]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── 1. Sobre o Desafio ────────────────────── */}
            <div className="border-t border-border/50 pt-6">
              <p className={sectionTitle}>1. Sobre o Desafio</p>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label required>
                    Qual era o problema, atividade ou oportunidade identificada?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Descreva o cenário antes da utilização da IA.
                  </p>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Descreva o contexto e o desafio que motivou o uso de IA..."
                    value={form.challenge}
                    onChange={set("challenge")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>
                    Como essa atividade era realizada anteriormente?
                  </Label>
                  <CheckGroup
                    name="previousMethod"
                    options={PREVIOUS_METHODS}
                    selected={form.previousMethod}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, previousMethod: v }))
                    }
                  />
                  {/* Outro */}
                  <label className="flex items-center gap-3 cursor-pointer group mt-1">
                    <Checkbox
                      checked={form.previousMethod.includes("outro")}
                      onCheckedChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          previousMethod: v
                            ? [...f.previousMethod, "outro"]
                            : f.previousMethod.filter((x) => x !== "outro"),
                        }))
                      }
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
                      Outro:
                    </span>
                    <Input
                      className="flex-1 h-8 text-xs"
                      placeholder="Descreva..."
                      value={form.previousMethodOther}
                      onChange={set("previousMethodOther")}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* ── 2. Uso da IA ──────────────────────────── */}
            <div className="border-t border-border/50 pt-6">
              <p className={sectionTitle}>2. Uso da IA</p>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label required>
                    Qual(is) ferramenta(s) de IA foi(ram) utilizada(s)?
                  </Label>
                  <CheckGroup
                    name="tools"
                    options={TOOLS}
                    selected={form.tools}
                    onChange={(v) => setForm((f) => ({ ...f, tools: v }))}
                  />
                  <label className="flex items-center gap-3 cursor-pointer group mt-1">
                    <Checkbox
                      checked={form.tools.includes("outra")}
                      onCheckedChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          tools: v
                            ? [...f.tools, "outra"]
                            : f.tools.filter((x) => x !== "outra"),
                        }))
                      }
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
                      Outra:
                    </span>
                    <Input
                      className="flex-1 h-8 text-xs"
                      placeholder="Nome da ferramenta..."
                      value={form.toolOther}
                      onChange={set("toolOther")}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Como a IA foi aplicada?</Label>
                  <p className="text-xs text-muted-foreground">
                    Descreva o passo a passo da utilização da ferramenta.
                  </p>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Ex: Utilizei o ChatGPT para gerar rascunhos de e-mail, revisando e adaptando o tom..."
                    value={form.application}
                    onChange={set("application")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Com que frequência a solução é utilizada?</Label>
                  <RadioGroupField
                    name="frequency"
                    options={FREQUENCY}
                    selected={form.frequency}
                    onChange={(v) => setForm((f) => ({ ...f, frequency: v }))}
                  />
                </div>
              </div>
            </div>

            {/* ── 3. Resultados Obtidos ─────────────────── */}
            <div className="border-t border-border/50 pt-6">
              <p className={sectionTitle}>3. Resultados Obtidos</p>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label>Quais benefícios foram alcançados?</Label>
                  <CheckGroup
                    name="benefits"
                    options={BENEFITS}
                    selected={form.benefits}
                    onChange={(v) => setForm((f) => ({ ...f, benefits: v }))}
                  />
                  <label className="flex items-center gap-3 cursor-pointer group mt-1">
                    <Checkbox
                      checked={form.benefits.includes("outro")}
                      onCheckedChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          benefits: v
                            ? [...f.benefits, "outro"]
                            : f.benefits.filter((x) => x !== "outro"),
                        }))
                      }
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
                      Outro:
                    </span>
                    <Input
                      className="flex-1 h-8 text-xs"
                      placeholder="Descreva..."
                      value={form.benefitOther}
                      onChange={set("benefitOther")}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Estime o ganho de tempo obtido.</Label>
                  <RadioGroupField
                    name="timeGain"
                    options={TIME_GAINS}
                    selected={form.timeGain}
                    onChange={(v) => setForm((f) => ({ ...f, timeGain: v }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Descreva os resultados alcançados.</Label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Descreva os resultados concretos obtidos com o uso da IA..."
                    value={form.results}
                    onChange={set("results")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>O resultado pode ser medido?</Label>
                  <RadioGroupField
                    name="measurable"
                    options={["Sim", "Não"]}
                    selected={form.measurable}
                    onChange={(v) => setForm((f) => ({ ...f, measurable: v }))}
                  />
                  {form.measurable === "Sim" && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <Label>Se sim, informe os indicadores:</Label>
                      <Input
                        placeholder="Ex: Redução de 4h/semana, 30% menos erros, NPS +10..."
                        value={form.indicators}
                        onChange={set("indicators")}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── 4. Impacto para a Empresa ─────────────── */}
            <div className="border-t border-border/50 pt-6">
              <p className={sectionTitle}>4. Impacto para a Empresa</p>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label>A solução beneficia:</Label>
                  <RadioGroupField
                    name="scope"
                    options={SCOPE}
                    selected={form.scope}
                    onChange={(v) => setForm((f) => ({ ...f, scope: v }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>
                    Esta solução pode ser replicada por outras equipes?
                  </Label>
                  <RadioGroupField
                    name="replicable"
                    options={REPLICABLE}
                    selected={form.replicable}
                    onChange={(v) => setForm((f) => ({ ...f, replicable: v }))}
                  />
                </div>
                {(form.replicable === "Sim" ||
                  form.replicable === "Parcialmente") && (
                  <div className="flex flex-col gap-1.5">
                    <Label>
                      Explique como outras áreas poderiam utilizar esta solução.
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Descreva como a solução poderia ser replicada..."
                      value={form.replicableExplanation}
                      onChange={set("replicableExplanation")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── 5. Evidências ────────────────────────── */}
            <div className="border-t border-border/50 pt-6">
              <p className={sectionTitle}>5. Evidências</p>
              <p className="text-xs text-muted-foreground mb-3">
                Anexe evidências do caso: prints, relatórios, dashboards,
                antes/depois, documentos gerados ou fluxos automatizados. Até{" "}
                {MAX_FILES} arquivos · 10MB cada.
              </p>

              {/* Arquivos já enviados (modo edição) */}
              {existingFiles.length > 0 && (
                <div className="mb-3 flex flex-col gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Arquivos já enviados
                  </p>
                  {existingFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {fileIcon({ type: f.type, name: f.name })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {f.name}
                        </p>
                        {f.size && (
                          <p className="text-xs text-muted-foreground">
                            {fmtSize(f.size)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExistingFiles((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        aria-label="Remover arquivo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Dropzone */}
              {existingFiles.length + files.length < MAX_FILES && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center gap-3 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? "border-primary/60 bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-accent/20"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragOver ? "bg-primary/10" : "bg-muted"}`}
                  >
                    <Upload
                      className={`w-5 h-5 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {dragOver
                        ? "Solte aqui!"
                        : "Arraste ou clique para anexar"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PNG · JPG · PDF · XLSX · DOC · TXT · máx. 10MB por arquivo
                    </p>
                  </div>
                  {files.length > 0 && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                      {files.length}/{MAX_FILES} arquivo
                      {files.length > 1 ? "s" : ""} selecionado
                      {files.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* Input oculto */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.webp,.pdf,.xlsx,.xls,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              {/* Lista de arquivos selecionados */}
              {files.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {fileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Remover arquivo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 6. Apresentação do Caso ──────────────── */}
            <div className="border-t border-border/50 pt-6">
              <p className={sectionTitle}>6. Apresentação do Caso</p>
              <div className="flex flex-col gap-1.5">
                <Label required>
                  Resuma seu caso em até 500 caracteres.{" "}
                  <span
                    className={`font-normal normal-case tracking-normal ${charCount > 500 ? "text-rose-500" : "text-muted-foreground"}`}
                  >
                    ({charCount}/500)
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Este texto poderá ser utilizado na divulgação dos finalistas.
                </p>
                <Textarea
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Descreva seu caso de forma clara e impactante para a banca avaliadora..."
                  value={form.summary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, summary: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* ── Declaração ───────────────────────────── */}
            {isEditMode ? (
              /* Em modo edição: declaração já foi aceita — mostra como confirmação, sem bloquear */
              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/6 border border-emerald-500/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <ShieldCheck className="w-3 h-3 inline mr-1 text-primary" />
                    Declaração LGPD aceita na inscrição original.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-t border-border/50 pt-6">
                <p className={sectionTitle}>Declaração</p>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    required
                    checked={form.lgpd}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, lgpd: !!v }))
                    }
                    className="mt-0.5"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors select-none">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-primary" />
                    Declaro que as informações apresentadas são verdadeiras e
                    que a utilização da IA respeitou as políticas de Segurança
                    da Informação e LGPD do Grupo Mirante.
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !form.lgpd}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                saveOk
                  ? "shadow-emerald-500/20 hover:shadow-emerald-500/35"
                  : "shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5"
              }`}
              style={{
                background: saveOk
                  ? "linear-gradient(135deg, oklch(0.65 0.18 145), oklch(0.52 0.20 145))"
                  : "linear-gradient(135deg, oklch(0.72 0.19 60), oklch(0.60 0.22 30))",
              }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveOk ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
              {submitting
                ? uploadStatus || "Salvando…"
                : saveOk
                  ? "Salvo com sucesso!"
                  : isEditMode
                    ? "Salvar alterações"
                    : "Enviar Inscrição"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ── Ranking ────────────────────────────────────────────── */
const BADGE_ICONS  = [Crown, Trophy, Medal];
const BADGE_COLORS = [
  "text-amber-500 dark:text-amber-400  bg-amber-50  border-amber-200  dark:bg-amber-500/15  dark:border-amber-500/30",
  "text-indigo-500 dark:text-indigo-400 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/15 dark:border-indigo-500/30",
  "text-rose-500  dark:text-rose-400   bg-rose-50   border-rose-200   dark:bg-rose-500/15   dark:border-rose-500/30",
];

function useApprovedInscricoes() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "premioInscricoes"),
      where("status", "==", "aprovado"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      setList(docs);
      setLoading(false);
    }, (err) => {
      console.error("[Ranking] Firestore error:", err.code, err.message);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { list, loading };
}

function RankingSection({ list, loading }) {

  return (
    <section id="ranking" className="py-16 section-alt">
      <div className="section-divider mb-0" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 pt-6">
          <div className="reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ranking Anual <span className="gradient-text">2026</span>
            </h2>
            <p className="text-muted-foreground">
              Placar atualizado com os casos validados pela banca avaliadora.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center gap-4 border-dashed">
            <Trophy className="w-10 h-10 text-muted-foreground/20" />
            <div>
              <p className="font-semibold text-foreground">Ranking em breve</p>
              <p className="text-sm text-muted-foreground mt-1">
                Os casos avaliados pela banca aparecerão aqui assim que aprovados.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {list.map((r, i) => {
                const BadgeIcon = i < 3 ? BADGE_ICONS[i] : null;
                const bColor    = i < 3 ? BADGE_COLORS[i] : "";
                const toolStr   = [
                  ...(r.tools ?? []),
                  r.toolOther ? r.toolOther : "",
                ].filter(Boolean).join(" + ") || "—";
                const initials  = (r.name ?? "?")
                  .split(" ").map((n) => n[0]).slice(0, 2).join("");

                return (
                  <div key={r.id}>
                    <div className={`glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 group hover:-translate-y-0.5 transition-all ${i === 0 ? "border-amber-300/40 dark:border-amber-500/30" : ""}`}>
                      <div className="flex-shrink-0 w-10 text-center">
                        {BadgeIcon ? (
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bColor}`}>
                            <BadgeIcon className="w-5 h-5" />
                          </div>
                        ) : (
                          <span className="text-lg font-black text-muted-foreground/40">{i + 1}°</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-border flex items-center justify-center text-xs font-bold text-primary">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">{r.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{r.dept}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.summary}</p>
                        <p className="text-[10px] text-primary mt-0.5">{toolStr}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xl font-black gradient-text">{r.score ?? 0}</div>
                        <div className="text-[10px] text-muted-foreground">pontos</div>
                        {r.medalha === "ouro" && <div className="text-[10px] text-amber-500 font-bold">🥇 Ouro</div>}
                        {r.medalha === "prata" && <div className="text-[10px] text-slate-400 font-bold">🥈 Prata</div>}
                        {r.medalha === "bronze" && <div className="text-[10px] text-orange-400 font-bold">🥉 Bronze</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 glass-card rounded-2xl p-4 flex items-center gap-3 border-dashed opacity-70">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {list.length} {list.length === 1 ? "participação validada" : "participações validadas"}
                </span>
                <p className="text-xs text-muted-foreground">
                  Todos os casos passaram pela banca avaliadora e estão elegíveis ao reconhecimento.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="section-divider mt-0" />
    </section>
  );
}

/* ── Hall da Fama ────────────────────────────────────────── */
const HALL_PALETTE = [
  { icon: BarChart3,  color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/15 dark:border-indigo-500/25" },
  { icon: Lightbulb,  color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 border-amber-100 dark:bg-amber-500/15 dark:border-amber-500/25"   },
  { icon: Repeat2,    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/25" },
  { icon: TrendingUp, color: "text-cyan-600 dark:text-cyan-400",      bg: "bg-cyan-50 border-cyan-100 dark:bg-cyan-500/15 dark:border-cyan-500/25"       },
  { icon: Rocket,     color: "text-rose-600 dark:text-rose-400",      bg: "bg-rose-50 border-rose-100 dark:bg-rose-500/15 dark:border-rose-500/25"       },
  { icon: Star,       color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-50 border-purple-100 dark:bg-purple-500/15 dark:border-purple-500/25" },
];

function HallSection({ list, loading }) {
  // Mostra até 6 primeiros casos (já ordenados por score desc)
  const hall = list.slice(0, 6);

  return (
    <section id="hall" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-3 block">
              Hall da Fama
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Casos de <span className="gradient-text-warm">sucesso</span>
            </h2>
            <p className="text-muted-foreground">
              Histórias reais de colaboradores que usaram IA para transformar seu trabalho.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : hall.length === 0 ? (
          <div className="max-w-md mx-auto glass-card rounded-2xl p-10 text-center flex flex-col items-center gap-4 border-dashed">
            <Star className="w-10 h-10 text-muted-foreground/20" />
            <div>
              <p className="font-semibold text-foreground">Casos em avaliação</p>
              <p className="text-sm text-muted-foreground mt-1">
                Os casos aprovados pela banca aparecerão aqui como inspiração para toda a empresa.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hall.map((h, i) => {
              const { icon: HIcon, color, bg } = HALL_PALETTE[i % HALL_PALETTE.length];
              const toolStr = [
                ...(h.tools ?? []),
                h.toolOther ? h.toolOther : "",
              ].filter(Boolean).join(" + ") || "—";

              const MEDAL_LABELS = { ouro: "🥇 Ouro", prata: "🥈 Prata", bronze: "🥉 Bronze", participacao: "✅ Participação" };
              return (
                <div key={h.id}>
                  <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 h-full group hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
                        <HIcon className={`w-5 h-5 ${color}`} />
                      </div>
                      {h.medalha && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/8 border-amber-500/20 text-amber-600 dark:text-amber-400">
                          {MEDAL_LABELS[h.medalha] ?? h.medalha}
                        </span>
                      )}
                    </div>
                    <div>
                      {h.categoriaVencedora && (
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">{h.categoriaVencedora}</p>
                      )}
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{h.summary}</h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{h.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{h.dept}</span>
                        {h.score > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 border border-primary/20 text-primary font-bold">{h.score} pts</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{h.results}</p>
                    </div>
                    <div className="mt-auto pt-3 border-t border-border/50 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-primary font-medium">{toolStr}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── CTA final ──────────────────────────────────────────── */
function CTAFinal({ onScrollTo }) {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-x-0 top-0 h-full opacity-20 dark:opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.70 0.20 60 / 0.4) 0%, transparent 70%)",
          }}
        />
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="reveal glass-card rounded-3xl p-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Trophy
                className="w-10 h-10 text-amber-500 dark:text-amber-400"
                strokeWidth={1.5}
              />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Pronto para concorrer?
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Seu próximo case pode ser o próximo campeão. Use IA hoje e
              inscreva seu caso no Prêmio IA Mirante.
            </p>
          </div>
          <button
            onClick={() => onScrollTo("inscricao")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.19 60), oklch(0.60 0.22 30))",
            }}
          >
            <Trophy className="w-4 h-4" />
            Inscrever meu caso agora
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Page root ──────────────────────────────────────────── */
export function PremioIAPage() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Único listener Firestore para ranking e hall of fame
  const { list: approvedList, loading: approvedLoading } = useApprovedInscricoes();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <PremioNavbar />
      <main className="pt-14">
        <HeroSection onScrollTo={scrollTo} />
        <ComoParticiparSection />
        <CategoriasSection />
        <CriteriosSection />
        <InscricaoSection />
        <RankingSection list={approvedList} loading={approvedLoading} />
        <HallSection    list={approvedList} loading={approvedLoading} />
        <CTAFinal onScrollTo={scrollTo} />
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Grupo Mirante · Prêmio IA Mirante ·{" "}
          <Link
            to="/"
            className="text-primary hover:underline underline-offset-2"
          >
            Voltar ao Portal
          </Link>
        </p>
      </footer>
    </div>
  );
}
