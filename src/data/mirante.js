export const mirantePortals = [
  {
    id: 1,
    portal: "PDMI",
    portalFull: "Portal de Dados e Market Intelligence",
    color: "#6366f1",
    bgClass: "bg-indigo-500/15 border-indigo-500/25",
    textClass: "text-indigo-400",
    badgeClass: "bg-indigo-500/20 text-indigo-300",
    badge: "BI & Dados",
    previewType: "bi-dashboard",
    agents: [
      {
        name: "Mara",
        role: "Analista de BI",
        description:
          "Responde perguntas sobre dados, gera insights e interpreta métricas de negócio em linguagem natural.",
        tags: ["BI", "Dados", "Insights"],
      },
    ],
    previewChat: {
      user: "Qual foi o faturamento no Q3?",
      ai: "O faturamento do Q3 foi R$ 2,4M — crescimento de 18% vs Q2 e 34% acima da meta.",
    },
    url: "https://pdmi.onrender.com",
  },
  {
    id: 2,
    portal: "Mira Creative",
    portalFull: "Portal de Criatividade Mirante",
    color: "#ec4899",
    bgClass: "bg-pink-500/15 border-pink-500/25",
    textClass: "text-pink-400",
    badgeClass: "bg-pink-500/20 text-pink-300",
    badge: "Criativo",
    previewType: "creative-studio",
    agents: [
      {
        name: "Criador de Roteiros",
        role: "Assistente de IA",
        description:
          "Cria roteiros completos para vídeos e campanhas a partir de um briefing.",
        tags: ["Roteiro", "Criação", "Vídeo"],
      },
      {
        name: "Analista de Pautas",
        role: "Assistente de IA",
        description:
          "Analisa e dá feedback estruturado sobre pautas e roteiros existentes.",
        tags: ["Análise", "Pauta", "Feedback"],
      },
    ],
    previewChat: {
      user: "Roteiro para vídeo institucional de 60s",
      ai: "Cena 1 (0–10s): Logo + trilha. Voz off: 'Há 20 anos, a Mirante transforma...'",
    },
    url: "https://miracreative.vercel.app",
  },
  {
    id: 3,
    portal: "Produtos e Soluções",
    portalFull: "Portal Comercial Mirante",
    color: "#f59e0b",
    bgClass: "bg-amber-500/15 border-amber-500/25",
    textClass: "text-amber-400",
    badgeClass: "bg-amber-500/20 text-amber-300",
    badge: "Comercial",
    previewType: "commercial",
    agents: [
      {
        name: "Analista Comercial",
        role: "Analista de IA",
        description:
          "Analisa planos comerciais, identifica oportunidades e gera relatórios estratégicos.",
        tags: ["Comercial", "Planos", "Estratégia"],
      },
    ],
    previewChat: {
      user: "Analise este plano para o cliente X",
      ai: "Detectei 3 oportunidades: expansão de licenças, suporte premium e upsell de módulo de BI.",
    },
    url: "https://produtosesolucoes.mirante.com.br",
  },
];
