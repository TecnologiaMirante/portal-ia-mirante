/**
 * Ferramentas de IA utilizadas pela Mirante — planos pagos
 *
 * lobehubSlug  → slug para https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/{slug}.png
 * simpleSlug   → slug para https://cdn.simpleicons.org/{slug}/{hex}  (fallback)
 * tags         → categorias exibidas no card
 */
export const aiTools = [
  {
    id: 1,
    name: "ChatGPT",
    provider: "OpenAI",
    initials: "GPT",
    color: "#10a37f",
    badge: "Mais usado",
    darkWhite: true,
    lobehubSlug: "openai",
    simpleSlug: "openai",
    tags: ["Conversar", "Imagens", "PDF"],
    description:
      "Assistente versátil da OpenAI — escreve e-mails, analisa planilhas, gera código e resolve problemas do dia a dia em linguagem natural.",
    bestFor: [
      "Redigir e-mails, relatórios e apresentações",
      "Analisar dados e interpretar planilhas",
      "Criar e revisar código de programação",
    ],
    url: "https://chatgpt.com",
    previewType: "chat",
    sampleChat: {
      user: "Crie um e-mail de proposta comercial",
      ai: "Assunto: Proposta de Parceria Estratégica\n\nPrezado(a)...",
    },
  },
  {
    id: 2,
    name: "Claude",
    provider: "Anthropic",
    initials: "CLD",
    color: "#d97706",
    badge: "Raciocínio",
    lobehubSlug: "claude",
    simpleSlug: "anthropic",
    tags: ["Análise", "Contratos", "Código"],
    description:
      "IA com raciocínio aprofundado e janela de contexto extensa — ideal para revisar contratos, analisar relatórios longos e produzir textos com consistência.",
    bestFor: [
      "Resumir e analisar documentos extensos",
      "Revisar contratos e textos técnicos",
      "Produzir conteúdo com tom consistente",
    ],
    url: "https://claude.ai",
    previewType: "chat",
    sampleChat: {
      user: "Analise este contrato de serviços",
      ai: "Encontrei 3 cláusulas relevantes: SLA de 99.9%, multa rescisória e prazo de 12 meses.",
    },
  },
  {
    id: 3,
    name: "Gemini",
    provider: "Google",
    initials: "GEM",
    color: "#4285f4",
    badge: null,
    lobehubSlug: "gemini",
    simpleSlug: "googlegemini",
    tags: ["Pesquisa", "Imagens", "Google"],
    description:
      "Assistente multimodal do Google com busca em tempo real — pesquisa, analisa imagens e integra diretamente ao Google Workspace.",
    bestFor: [
      "Pesquisar temas com fontes atualizadas",
      "Gerar conteúdo integrado ao Google Docs",
      "Analisar imagens e arquivos enviados",
    ],
    url: "https://gemini.google.com",
    previewType: "chat",
    sampleChat: {
      user: "Quais as tendências de IA em 2026?",
      ai: "Segundo fontes recentes: agentes autônomos, IA multimodal e modelos menores são destaque.",
    },
  },
  {
    id: 4,
    name: "AI Studio",
    provider: "Google",
    initials: "GAS",
    color: "#ea4335",
    badge: "API",
    logoUrl:
      "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://aistudio.google.com&size=256",
    lobehubSlug: "aistudio",
    simpleSlug: null,
    tags: ["API", "Gemini", "Código"],
    description:
      "Ambiente do Google para acessar os modelos Gemini via API, testar prompts avançados e construir integrações e automações personalizadas.",
    bestFor: [
      "Prototipagem rápida de agentes e prompts",
      "Integrar IA a sistemas internos via API",
      "Testar diferentes versões do Gemini",
    ],
    url: "https://aistudio.google.com",
    previewType: "code",
    sampleCode: [
      { type: "comment", text: "# Google AI Studio" },
      { type: "import", text: "import google.generativeai as genai" },
      { type: "blank", text: "" },
      { type: "assign", text: 'model = genai.GenerativeModel("gemini-pro")' },
      { type: "call", text: 'resp = model.generate_content("Resuma:")' },
      { type: "output", text: '>>> "Aqui está o resumo..."' },
    ],
  },
  {
    id: 5,
    name: "HeyGen",
    provider: "HeyGen",
    initials: "HYG",
    color: "#7c3aed",
    badge: "Vídeo",
    logoUrl:
      "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://heygen.com&size=256",
    lobehubSlug: "heygen",
    simpleSlug: null,
    tags: ["Avatar IA", "Dublagem", "Vídeo"],
    description:
      "Crie vídeos institucionais com apresentadores virtuais realistas em mais de 120 idiomas — sem câmera, sem gravação, em poucos minutos.",
    bestFor: [
      "Produzir vídeos de treinamento e onboarding",
      "Comunicados institucionais em escala",
      "Dublar ou localizar vídeos automaticamente",
    ],
    url: "https://www.heygen.com",
    previewType: "video",
  },
  {
    id: 6,
    name: "ElevenLabs",
    provider: "ElevenLabs",
    initials: "ELV",
    color: "#10b981",
    badge: "Voz",
    lobehubSlug: "elevenlabs",
    simpleSlug: "elevenlabs",
    tags: ["Síntese de Voz", "Narração", "Áudio"],
    description:
      "Gera e clona vozes com qualidade de estúdio para narrar vídeos, cursos e campanhas — sem locutor, sem gravação presencial.",
    bestFor: [
      "Narrar vídeos e apresentações sem locutor",
      "Clonar voz para manter identidade vocal",
      "Produzir áudio para cursos e treinamentos",
    ],
    url: "https://elevenlabs.io",
    previewType: "audio",
  },
  {
    id: 7,
    name: "Suno",
    provider: "Suno AI",
    initials: "SNO",
    color: "#f43f5e",
    badge: "Música",
    lobehubSlug: "suno",
    simpleSlug: "suno",
    tags: ["Música", "Jingles", "Trilha"],
    description:
      "Gera músicas originais com letra e melodia a partir de uma descrição em texto — trilhas, jingles e vinhetas prontos em segundos.",
    bestFor: [
      "Criar trilhas para vídeos e campanhas",
      "Produzir jingles e vinhetas originais",
      "Gerar música ambiente para apresentações",
    ],
    url: "https://suno.com",
    previewType: "music",
  },
  {
    id: 8,
    name: "Veo",
    provider: "Google DeepMind",
    initials: "VEO",
    color: "#06b6d4",
    badge: "Vídeo IA",
    logoUrl:
      "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://veo.co&size=256",
    lobehubSlug: "veo",
    simpleSlug: "google",
    tags: ["Texto para Vídeo", "Cinema IA", "Google"],
    description:
      "Transforma descrições em texto em cenas de vídeo realistas e cinematográficas — ideal para campanhas, conteúdo e produções criativas sem câmera.",
    bestFor: [
      "Gerar vídeos realistas a partir de texto",
      "Criar cenas e transições cinematográficas",
      "Produzir conteúdo visual sem câmera",
    ],
    url: "https://labs.google/fx/pt/tools/flow",
    previewType: "video-gen",
    samplePrompt:
      "Uma câmera voa sobre a cidade à noite, luzes refletindo no asfalto molhado...",
  },
  {
    id: 9,
    name: "Gamma",
    provider: "Gamma.app",
    initials: "GAM",
    color: "#8b5cf6",
    badge: "Slides",
    logoUrl:
      "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://gamma.app&size=256",
    clipCircle: true,
    lobehubSlug: "gamma",
    simpleSlug: null,
    tags: ["Apresentações", "Sites", "Documentos"],
    description:
      "Transforma textos e ideias em apresentações, sites e documentos visuais profissionais com IA — sem precisar de designer ou PowerPoint.",
    bestFor: [
      "Criar decks e apresentações com IA",
      "Montar sites e landing pages rapidamente",
      "Transformar textos em documentos visuais",
    ],
    url: "https://gamma.app",
    previewType: "chat",
    sampleChat: {
      user: "Crie uma apresentação sobre inovação",
      ai: "Aqui está sua apresentação com 8 slides: Introdução, Tendências, Cases, Conclusão...",
    },
  },
  {
    id: 10,
    name: "NotebookLM",
    provider: "Google",
    initials: "NLM",
    color: "#3b82f6",
    badge: "Pesquisa",
    darkWhite: true,
    lobehubSlug: "notebooklm",
    simpleSlug: null,
    tags: ["Pesquisa", "PDF", "Podcast IA"],
    description:
      "Conecte PDFs, documentos e links para fazer perguntas, extrair insights e gerar podcasts de áudio com IA — tudo sobre suas próprias fontes.",
    bestFor: [
      "Analisar e resumir documentos extensos",
      "Gerar podcasts de áudio a partir de PDFs",
      "Fazer perguntas sobre múltiplas fontes",
    ],
    url: "https://notebooklm.google.com",
    previewType: "chat",
    sampleChat: {
      user: "Resuma este relatório de 80 páginas",
      ai: "Principais pontos: crescimento de 23%, meta atingida em Q3, risco em supply chain...",
    },
  },
];
