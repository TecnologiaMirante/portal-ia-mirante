# Portal IA Mirante

Portal interno da **Mirante Tecnologia** para centralizar e divulgar o uso de Inteligência Artificial na empresa — ferramentas homologadas, criações feitas com IA, cases de uso, recursos educativos e notícias diárias de IA.

> **Stack:** React 19 · Vite 8 · Tailwind CSS v4 · Firebase 12 (Auth + Firestore + Storage) · EmailJS · Google Apps Script · GitHub Actions · Gemini AI

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Firebase — Configuração Inicial](#firebase--configuração-inicial)
- [Notícias de IA — Sistema Automático](#notícias-de-ia--sistema-automático)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Área Admin](#área-admin)
- [Tipos de Mídia Suportados](#tipos-de-mídia-suportados)
- [Deploy](#deploy)
- [Variáveis de Ambiente em Produção](#variáveis-de-ambiente-em-produção)

---

## Visão Geral

O Portal IA Mirante é uma **Single Page Application** (SPA) com três áreas distintas:

| Área | Rota | Acesso |
|------|------|--------|
| Portal público | `/` | Todos os colaboradores |
| Notícias de IA | `/noticias` | Todos os colaboradores |
| Painel administrativo | `/admin` | Usuários autenticados via Firebase Auth |

---

## Funcionalidades

### Portal Público (`/`)
- **Hero** com animação neural de fundo, blobs animados e dot-grid
  - Botão primário: **"Notícias de IA"** (scroll para a seção de notícias)
  - Botão secundário: **"Banco de Prompts"** (abre portal externo)
  - 4 cards de acesso rápido: Política de IA · Desafio da Semana · Prompt do Dia · Comece em 5 passos
- **Desafio da Semana** — desafio rotativo com prompt pronto para usar, dificuldade, tempo estimado e botão de envio de resultado; 18 desafios pré-carregados em `public/challenges.json`
- **Prompt do Dia** — prompt diário com filtro por área, feedback de curtir/rejeitar e cópia com um clique; 50 prompts em `public/daily_prompts.json`
- **Ferramentas de IA** — carrossel com ferramentas homologadas, drag-to-scroll, logos com fallback para iniciais
- **Criações com IA** — galeria com suporte a vídeo, imagem e áudio; modal de visualização; filtros por área/ferramenta/tipo; botão "Quero fazer algo parecido" abre formulário de pedido de criação
- **Envio de casos de uso** — formulário sem login para relatar como a IA foi usada no trabalho; envia por EmailJS e registra no Google Sheets
- **Pedido de criação similar** — formulário contextual aberto pelo botão "Quero fazer algo parecido" em cada criação; pré-preenche a ferramenta da criação de referência
- **Banco de Prompts CTA** — link para o portal de prompts interno
- **Notícias de IA** — seção `#noticias-ia` com os 3 artigos mais recentes e CTA para `/noticias`
- **Política de IA** — modal com a política oficial de uso de IA da empresa
- **Por onde começar** — guia de 5 passos para novos usuários
- **Tema claro/escuro** — alternância persistida em localStorage

### Notícias de IA (`/noticias`)
- Feed diário atualizado automaticamente via GitHub Actions às **07h BRT**
- Notícias de **7 fontes RSS** (Canaltech, Tecnoblog, TecMundo, The Verge, TechCrunch)
- Artigos em inglês (Verge, TechCrunch) **traduzidos automaticamente para PT-BR**
- **Conteúdo completo lido dentro do portal** — sem redirecionamento para sites externos
- **Filtro por setor** — Marketing, RH, Financeiro, Comercial, Jurídico, Gestão, Saúde, Educação
- **Modal leitor** — título, resumo, texto completo revisado por IA e link para o original
- **Zero rebuild no Render** — frontend lê `news.json` direto do GitHub, sem necessidade de redeploy

### Painel Admin (`/admin`)
- Dashboard com lista de criações, thumbnails, pesquisa em tempo real e QuickView
- Criação/Edição de publicações com upload de vídeo (500 MB), imagem (20 MB) e áudio (100 MB)
- Geração automática de thumbnail para vídeos (primeiro frame via Canvas API)
- Deleção de arquivos antigos do Storage ao substituir mídia

---

## Pré-requisitos

- **Node.js** ≥ 18 (recomendado: 20 LTS ou 24)
- **npm** ≥ 9
- Conta no **Firebase** com projeto criado
- Repositório no **GitHub** (para o sistema de notícias automático)
- Chave do **Google Gemini** (gratuita em [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

---

## Instalação e Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/sua-org/portal-ia-mirante.git
cd portal-ia-mirante

# 2. Instale as dependências (inclui @mozilla/readability e jsdom)
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Abra .env e preencha com as credenciais do seu projeto Firebase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O portal estará disponível em `http://localhost:5173`.

---

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha os valores. Todas as variáveis são obtidas no Firebase Console → **Configurações do Projeto** → **Seus apps** → **SDK Config**.

| Variável | Descrição |
|----------|-----------|
| `VITE_FIREBASE_API_KEY` | Chave de API pública do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação (`projeto.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket do Cloud Storage (`projeto.firebasestorage.app`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do remetente para notificações |
| `VITE_FIREBASE_APP_ID` | ID do app web no Firebase |
| `VITE_EMAILJS_SERVICE_ID` | ID do serviço EmailJS (obter em emailjs.com) |
| `VITE_EMAILJS_TEMPLATE_ID` | ID do template EmailJS usado pelos formulários |
| `VITE_EMAILJS_PUBLIC_KEY` | Chave pública EmailJS |
| `VITE_SHEETS_WEBHOOK_URL` | URL do Google Apps Script (Web App) para registro em planilha |

> ⚠️ **Nunca** commite o arquivo `.env` com valores reais. Ele está listado no `.gitignore`.

### EmailJS — configuração

1. Crie conta em [emailjs.com](https://www.emailjs.com)
2. Crie um **Service** (Gmail, Outlook, etc.) e copie o `Service ID`
3. Crie um **Template** com as variáveis: `{{subject}}`, `{{form_type}}`, `{{sender_name}}`, `{{sender_area}}`, `{{challenge_title}}`, `{{problem}}`, `{{tool_used}}`, `{{result}}`, `{{time_saved}}`
4. Copie o `Template ID` e a `Public Key` (em Account → API Keys)
5. Configure `To Email` no template como fixo (`team@mirante.com.br`) — não use `{{email}}`

### Google Sheets — configuração

1. Crie uma planilha no Google Sheets
2. Em **Extensões → Apps Script**, cole um script com `doPost(e)` que faz `appendRow` na planilha
3. Publique como **Web App** (acesso: qualquer pessoa, mesmo sem login)
4. Cole a URL gerada em `VITE_SHEETS_WEBHOOK_URL`
5. **Importante:** execute qualquer função no editor do Apps Script antes de usar, para autorizar o acesso à planilha

> Se `VITE_SHEETS_WEBHOOK_URL` estiver vazio, o envio para a planilha é silenciosamente ignorado; o EmailJS continua funcionando normalmente.

---

## Firebase — Configuração Inicial

### 1. Authentication

No Firebase Console → **Authentication** → **Sign-in method**:
- Habilite **E-mail/Senha**
- Crie o(s) usuário(s) admin manualmente em **Usuários**

### 2. Firestore Database

Crie o banco no modo **Produção** e aplique as regras abaixo:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /creations/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Cloud Storage

Crie o bucket (região sugerida: `us-central1`) e aplique as regras abaixo:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{fileName}    { allow read: if true; allow write: if request.auth != null; }
    match /images/{fileName}    { allow read: if true; allow write: if request.auth != null; }
    match /audio/{fileName}     { allow read: if true; allow write: if request.auth != null; }
    match /thumbnails/{fileName}{ allow read: if true; allow write: if request.auth != null; }
  }
}
```

---

## Notícias de IA — Sistema Automático

### Como funciona

O fluxo completo de coleta, processamento e entrega das notícias:

```
GitHub Actions (cron 07h BRT)
        ↓
scripts/fetch-news.mjs
  1. Busca 7 feeds RSS em paralelo
  2. Filtra artigos relacionados a IA (~30 palavras-chave)
  3. Remove duplicatas por URL
  4. Readability (Mozilla) extrai o corpo do artigo de cada página
     → Remove ads, sidebar, navegação, CTAs automaticamente
     → Fallback regex para sites que bloqueiam o parser
  5. og:image extraída para artigos sem imagem no RSS
  6. Tradução EN→PT-BR via Google Translate (artigos do Verge e TechCrunch)
  7. Gemini 1.5 Flash revisa e reescreve o texto
     → Remove: podcasts, newsletters, assinaturas, emojis promocionais
     → Mantém: todos os fatos, dados e citações da matéria
  8. Classifica por setor (Marketing, RH, Financeiro, etc.)
  9. Ordena por data, salva os 40 mais recentes
        ↓
public/news.json  ← commitado automaticamente no repositório
        ↓
Frontend em produção lê direto do GitHub raw (sem rebuild no Render)
Frontend em dev lê do /public local
  → Cache inteligente: só rebusca se o updatedAt do servidor for diferente
```

### Agendamento

O arquivo `.github/workflows/fetch-news.yml` configura o GitHub Actions para rodar todo dia:

```yaml
on:
  schedule:
    - cron: '0 10 * * *'   # 10:00 UTC = 07:00 BRT
  workflow_dispatch:         # também pode ser disparado manualmente
```

Para **verificar ou disparar manualmente**:
1. Vá em **GitHub → seu repositório → aba Actions**
2. Clique em **"Atualizar Notícias de IA"** no painel esquerdo
3. Clique em **"Run workflow"** → **"Run workflow"**

### Configuração do GitHub Secrets

O script precisa de uma chave do Gemini para revisar os artigos. Configure uma vez:

1. Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey) e gere uma chave gratuita
2. No GitHub → seu repositório → **Settings → Secrets and variables → Actions**
3. Clique em **New repository secret**
4. Nome: `GEMINI_API_KEY` | Valor: sua chave

> ⚠️ **Nunca** coloque a chave diretamente no código ou no chat. O GitHub injeta ela apenas no momento em que o Action roda, invisível para qualquer pessoa que acesse o repositório.

Se `GEMINI_API_KEY` não estiver configurada, o script ainda funciona — apenas pula a etapa de revisão com IA e salva o texto bruto do Readability.

### Fontes de notícias

| Fonte | Feed | Idioma | Traduzido |
|-------|------|--------|-----------|
| Canaltech IA | `canaltech.com.br/rss/inteligencia-artificial/` | PT-BR | — |
| Tecnoblog IA | `tecnoblog.net/tag/inteligencia-artificial/feed/` | PT-BR | — |
| TecMundo IA | `tecmundo.com.br/rss/inteligencia-artificial.xml` | PT-BR | — |
| Canaltech (geral) | `canaltech.com.br/rss.xml` | PT-BR | — |
| Tecnoblog (geral) | `tecnoblog.net/feed/` | PT-BR | — |
| The Verge AI | `theverge.com/rss/ai-artificial-intelligence/index.xml` | EN | ✅ Auto |
| TechCrunch AI | `techcrunch.com/category/artificial-intelligence/feed/` | EN | ✅ Auto |

#### Adicionar uma nova fonte

Abra `scripts/fetch-news.mjs` e adicione um item ao array `SOURCES`:

```js
const SOURCES = [
  // ...fontes existentes...
  { url: "https://exemplo.com/rss/ia.xml", name: "Exemplo IA", lang: "pt" },
  // lang: "en" para fontes em inglês (serão traduzidas automaticamente)
];
```

### Classificação por setor

Cada artigo é automaticamente rotulado com base em palavras-chave presentes no título, descrição e conteúdo. A classificação acontece **após** a tradução, garantindo que artigos em inglês também sejam tagueados corretamente.

| Setor | Exemplos de palavras-chave |
|-------|---------------------------|
| **Marketing** | marketing, publicidade, campanha, social media, marca, conteúdo |
| **RH** | emprego, carreira, contratação, workforce, skills, talento |
| **Financeiro** | banco, fraude, investimento, fintech, receita, pagamento |
| **Comercial** | vendas, cliente, CRM, e-commerce, lead, parceria |
| **Jurídico** | LGPD, regulação, privacidade, GDPR, compliance, lei |
| **Gestão** | produtividade, rotina, processo, reunião, workflow, organização |
| **Saúde** | saúde, medicina, diagnóstico, hospital, tratamento |
| **Educação** | educação, curso, ensino, aprendizagem, treinamento |

### Estrutura do `public/news.json`

```json
{
  "updatedAt": "2026-05-29T10:00:00.000Z",
  "count": 40,
  "articles": [
    {
      "title": "Título do artigo (já traduzido se EN)",
      "description": "Resumo curto (até 300 chars)",
      "url": "https://fonte.com/artigo",
      "publishedAt": "Thu, 29 May 2026 10:00:00 -0300",
      "image": "https://cdn.fonte.com/imagem.jpg",
      "source": "Canaltech IA",
      "content": "Texto completo revisado pelo Gemini, em parágrafos limpos...",
      "lang": "pt",
      "depts": ["Gestão", "Educação"]
    }
  ]
}
```

### Cache no frontend

O hook `src/hooks/useNews.js` usa um cache inteligente baseado no campo `updatedAt`:

- Ao carregar, busca o `news.json` do servidor e compara o `updatedAt` com o cache local
- Se forem **iguais** e o cache tiver menos de 1h → usa o cache (evita request desnecessário)
- Se forem **diferentes** → busca os dados frescos imediatamente, sem esperar o TTL expirar
- Em caso de **falha de rede** → usa o cache local como fallback, mesmo que antigo

Isso garante que produção e local sempre mostram os mesmos dados, sem necessidade de limpar o cache manualmente. Para forçar atualização: clique no botão **⟳** na navbar de `/noticias`.

### Onde o `news.json` é lido

| Ambiente | URL |
|----------|-----|
| **Desenvolvimento** (`npm run dev`) | `/news.json` (arquivo local em `public/`) |
| **Produção** (Render) | `raw.githubusercontent.com/.../main/public/news.json` |

Em produção o frontend lê diretamente do GitHub, sem precisar de rebuild no Render a cada atualização diária.

### Prevenção de loop de deploy

O commit automático do Action usa o sufixo `[skip ci]` na mensagem:

```
chore: atualizar notícias de IA 29/05/2026 [skip ci]
```

Isso garante que o Render **não acione um novo deploy** apenas por causa da atualização do `news.json`.

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR (porta 5173) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Executa o ESLint no código-fonte |
| `node scripts/fetch-news.mjs` | Roda o scraper localmente (requer `GEMINI_API_KEY` no ambiente) |

---

## Estrutura do Projeto

```
portal-ia-mirante/
├── .github/
│   └── workflows/
│       └── fetch-news.yml        # GitHub Action — atualiza notícias todo dia às 07h BRT
│                                 # Requer secret: GEMINI_API_KEY
│
├── scripts/
│   └── fetch-news.mjs            # Script de coleta, Readability, tradução, revisão Gemini
│
├── public/
│   ├── news.json                 # Feed de notícias gerado automaticamente (não editar manualmente)
│   ├── challenges.json           # 18 desafios semanais (startDate: 2026-09-01, rotação por semana)
│   ├── daily_prompts.json        # 50 prompts do dia (rotação por dia do ano)
│   └── ...                       # Outros assets estáticos
│
├── firebaseClient/
│   └── index.js                  # Inicialização do Firebase — usa persistentLocalCache (IndexedDB) para Firestore
│
├── src/
│   ├── assets/                   # Logos e imagens estáticas
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── CreationForm.jsx
│   │   ├── effects/
│   │   │   ├── NeuralBg.jsx      # Canvas animado com nós e conexões
│   │   │   ├── BackToTop.jsx
│   │   │   ├── ClickRipple.jsx
│   │   │   ├── ScrollProgress.jsx
│   │   │   ├── ScrollSpy.jsx     # Navegação lateral por seções (inclui #noticias-ia)
│   │   │   ├── ScrollToTop.jsx   # Reseta scroll ao trocar de rota (React Router)
│   │   │   └── TiltCard.jsx
│   │   ├── ui/                   # Componentes base (shadcn/ui)
│   │   ├── AICreations.jsx       # Galeria de criações com filtros e modal de visualização
│   │   ├── AIToolsBanner.jsx
│   │   ├── CaseSubmitModal.jsx   # Formulário de envio de caso de uso com IA (EmailJS + Sheets)
│   │   ├── DailyPrompt.jsx       # Prompt do dia — lê public/daily_prompts.json
│   │   ├── EngagementSection.jsx # Seção #desafio — agrupa WeeklyChallenge + DailyPrompt
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── GettingStarted.jsx
│   │   ├── Hero.jsx              # 2 CTAs + 4 cards (Política·Desafio·Prompt·Começar) + stats
│   │   ├── MiranteAIs.jsx
│   │   ├── Navbar.jsx            # Recursos→Começar→Ferramentas→Portais IA→Criações→Notícias IA→Prêmio IA
│   │   ├── NewsPreview.jsx       # Seção #noticias-ia — 3 artigos recentes + CTA para /noticias
│   │   ├── PolicyModal.jsx
│   │   ├── PortalPreview.jsx
│   │   ├── PromptBankCTA.jsx
│   │   ├── SimilarRequestModal.jsx # Formulário "Quero fazer algo parecido" (EmailJS + Sheets)
│   │   └── WeeklyChallenge.jsx   # Desafio da semana — lê public/challenges.json
│   │
│   ├── hooks/
│   │   ├── useAuth.jsx           # Contexto de autenticação Firebase
│   │   ├── useChallenge.js       # Lê challenges.json e seleciona o desafio da semana atual
│   │   ├── useDailyPrompt.js     # Lê daily_prompts.json e seleciona o prompt do dia
│   │   ├── useNews.js            # Cache baseado em updatedAt; lê GitHub raw em produção
│   │   ├── useScrollReveal.js
│   │   └── useTheme.jsx          # Contexto de tema claro/escuro
│   │
│   ├── pages/
│   │   └── NewsPage.jsx          # Página /noticias — feed, filtros, modal leitor
│   │
│   ├── data/
│   │   ├── aiTools.js
│   │   └── mirante.js
│   │
│   ├── lib/
│   │   └── utils.js
│   │
│   ├── App.jsx                   # Roteamento: /, /noticias, /admin/* + ScrollToTop
│   ├── index.css                 # Variáveis de design, blobs, dot-grid, shimmer-text, scroll-margin-top
│   └── main.jsx
│
├── .env                          # ⚠️ NÃO commitado — credenciais reais
├── .env.example                  # Template público de variáveis
├── .gitignore
├── index.html
├── package.json                  # Inclui @mozilla/readability e jsdom (usados pelo script)
├── README.md
└── vite.config.js
```

---

## Área Admin

### Acesso

Navegue até `/admin/login` e autentique com e-mail e senha cadastrados no Firebase Authentication.

### Criando uma Publicação

1. Clique em **Nova criação** no dashboard
2. Preencha: **Título**, **Autor**, **Área**, **Ferramentas usadas**, **Descrição**
3. Escolha o tipo de mídia:
   - **URL** — cole um link do YouTube (um vídeo por publicação)
   - **Upload** — arraste ou selecione **múltiplos arquivos** de uma vez (vídeo, imagem e/ou áudio, sem limite de quantidade)
4. Clique em **Publicar**

> No portal, criações com mais de um item exibem um carrossel com setas de navegação e dots indicadores.

### Editando uma Publicação

- Os itens de mídia já publicados aparecem listados com miniatura e botão **✕** para remover individualmente
- O drop zone exibido abaixo permite adicionar mais arquivos por cima dos existentes
- Ao salvar: itens removidos são deletados do Storage automaticamente; novos arquivos são feitos upload e somados aos existentes

---

## Tipos de Mídia Suportados

| Tipo | Formatos aceitos | Limite | Thumbnail |
|------|-----------------|--------|-----------|
| Vídeo (upload) | `video/*` | 500 MB | Primeiro frame capturado automaticamente |
| Imagem | `image/*` | 20 MB | A própria imagem (comprimida para max 1920px) |
| Áudio | `audio/*` | 100 MB | Gradiente com ícone de música |
| Vídeo (YouTube) | URL embed | — | Thumbnail automático do YouTube |

---

## Deploy

O projeto é uma SPA com React Router — o servidor precisa redirecionar todas as rotas para `index.html`.

### Render (configuração atual)

O projeto está hospedado no **Render**. A cada push na branch `main`, o Render detecta as mudanças e faz deploy automático.

> O commit diário do `news.json` usa `[skip ci]` na mensagem. Além disso, o frontend em produção lê o `news.json` direto do GitHub raw — sem precisar de rebuild para ver as notícias atualizadas.

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# → Public directory: dist
# → Single-page app: Yes

npm run build
firebase deploy --only hosting
```

### Outras plataformas

| Plataforma | Configuração |
|------------|-------------|
| **Vercel** | Importar repositório; framework preset: Vite. Rewrites automáticos. |
| **Netlify** | Adicionar `public/_redirects`: `/* /index.html 200` |
| **Nginx** | `try_files $uri $uri/ /index.html;` no bloco `location /` |

---

## Variáveis de Ambiente em Produção

Configure as variáveis do `.env` no painel da plataforma de deploy — nunca no repositório.

| Plataforma | Onde configurar |
|------------|----------------|
| **Render** | Dashboard → seu serviço → **Environment** |
| **Vercel** | Project Settings → **Environment Variables** |
| **Netlify** | Site configuration → **Environment variables** |
| **Firebase Hosting** | Configurar antes de `npm run build` (valores embutidos no bundle) |

A chave `GEMINI_API_KEY` **não vai aqui** — ela fica exclusivamente nos **GitHub Secrets** (usada apenas pelo Action, nunca exposta ao frontend).

---

## Licença

Uso interno — Mirante Tecnologia. Todos os direitos reservados.
