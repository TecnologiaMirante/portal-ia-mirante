# Portal IA Mirante

Portal interno da **Mirante Tecnologia** para centralizar e divulgar o uso de Inteligência Artificial na empresa — ferramentas homologadas, criações feitas com IA, cases de uso, recursos educativos e notícias diárias de IA.

> **Stack:** React 19 · Vite 8 · Tailwind CSS v4 · Firebase 12 (Auth + Firestore + Storage) · GitHub Actions

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
- **Ferramentas de IA** — carrossel com ferramentas homologadas, drag-to-scroll, logos com fallback para iniciais
- **Criações com IA** — galeria com suporte a vídeo, imagem e áudio; modal de visualização; filtros por área/ferramenta/tipo
- **Banco de Prompts CTA** — link para o portal de prompts interno
- **Política de IA** — modal com a política oficial de uso de IA da empresa
- **Por onde começar** — guia de 5 passos para novos usuários
- **Tema claro/escuro** — alternância persistida em localStorage

### Notícias de IA (`/noticias`)
- Feed diário atualizado automaticamente via GitHub Actions às **07h BRT**
- Notícias de **7 fontes RSS** (Canaltech, Tecnoblog, TecMundo, The Verge, TechCrunch e outros)
- **Filtro por setor** — Marketing, RH, Financeiro, Comercial, Jurídico, Gestão, Saúde, Educação
- **Modal leitor** — abre o artigo diretamente no portal com resumo e conteúdo completo quando disponível
- **Zero dependência de API** — os dados são um JSON estático servido pelo próprio servidor

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

---

## Instalação e Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/sua-org/portal-ia-mirante.git
cd portal-ia-mirante

# 2. Instale as dependências
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

> ⚠️ **Nunca** commite o arquivo `.env` com valores reais. Ele está listado no `.gitignore`.

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

O sistema de notícias **não usa nenhuma API paga** e não tem custo. O fluxo completo é:

```
GitHub Actions (cron 07h BRT)
        ↓
scripts/fetch-news.mjs
  → Busca 7 feeds RSS em paralelo
  → Filtra artigos relacionados a IA (≈30 palavras-chave)
  → Remove duplicatas por URL
  → Faz scrape do conteúdo completo de cada artigo
  → Limpa parágrafos irrelevantes (newsletter, publicidade, etc.)
  → Classifica por setor (Marketing, RH, Financeiro, etc.)
  → Ordena por data, mantém os 40 mais recentes
        ↓
public/news.json  ← commitado automaticamente no repositório
        ↓
Render detecta o commit e faz deploy automático
        ↓
Frontend lê /news.json (arquivo estático, zero CORS)
  → Cache local de 1h no localStorage do usuário
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

### Fontes de notícias

| Fonte | Feed | Idioma |
|-------|------|--------|
| Canaltech IA | `canaltech.com.br/rss/inteligencia-artificial/` | PT-BR |
| Tecnoblog IA | `tecnoblog.net/tag/inteligencia-artificial/feed/` | PT-BR |
| TecMundo IA | `tecmundo.com.br/rss/inteligencia-artificial.xml` | PT-BR |
| Canaltech (geral) | `canaltech.com.br/rss.xml` | PT-BR |
| Tecnoblog (geral) | `tecnoblog.net/feed/` | PT-BR |
| The Verge AI | `theverge.com/rss/ai-artificial-intelligence/index.xml` | EN |
| TechCrunch AI | `techcrunch.com/category/artificial-intelligence/feed/` | EN |

#### Adicionar uma nova fonte

Abra `scripts/fetch-news.mjs` e adicione um item ao array `SOURCES`:

```js
const SOURCES = [
  // ...fontes existentes...
  { url: "https://exemplo.com/rss/ia.xml", name: "Exemplo IA" },
];
```

### Classificação por setor

Cada artigo é automaticamente rotulado com os setores da empresa com base em palavras-chave presentes no título, descrição e conteúdo. Os setores e suas palavras-chave estão em `scripts/fetch-news.mjs` no objeto `DEPTS`:

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
      "title": "Título do artigo",
      "description": "Resumo curto (até 280 chars)",
      "url": "https://fonte.com/artigo",
      "publishedAt": "Thu, 29 May 2026 10:00:00 -0300",
      "image": "https://cdn.fonte.com/imagem.jpg",
      "source": "Canaltech IA",
      "content": "Conteúdo completo do artigo (múltiplos parágrafos)...",
      "depts": ["Gestão", "Educação"]
    }
  ]
}
```

> O campo `content` é preenchido via `<content:encoded>` do RSS ou, quando ausente, via scrape HTTP da página do artigo. Parágrafos de baixa qualidade (CTAs de newsletter, rodapés, "Continua após a publicidade") são removidos automaticamente.

### Cache no frontend

O hook `src/hooks/useNews.js` armazena os dados no `localStorage` com TTL de 1 hora. Isso evita múltiplas requisições ao mesmo arquivo. Para forçar atualização: clique no botão **⟳** na navbar da página `/noticias`.

### Prevenção de loop de deploy

O commit automático do Action usa o sufixo `[skip ci]` na mensagem:

```
chore: atualizar notícias de IA 29/05/2026 [skip ci]
```

Isso garante que o Render **não acione um novo deploy** apenas por causa da atualização do `news.json`, evitando loops infinitos.

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR (porta 5173) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Executa o ESLint no código-fonte |
| `node scripts/fetch-news.mjs` | Roda o scraper de notícias localmente (gera `public/news.json`) |

---

## Estrutura do Projeto

```
portal-ia-mirante/
├── .github/
│   └── workflows/
│       └── fetch-news.yml        # GitHub Action — atualiza notícias todo dia às 07h BRT
│
├── scripts/
│   └── fetch-news.mjs            # Script Node.js de coleta, filtragem e scrape de notícias
│
├── public/
│   ├── news.json                 # Feed de notícias gerado automaticamente (não editar manualmente)
│   └── ...                       # Outros assets estáticos
│
├── firebaseClient/
│   └── index.js                  # Inicialização do Firebase (auth, db, storage)
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
│   │   │   ├── NeuralBg.jsx      # Canvas animado com nós e conexões (fundo do Hero e modais)
│   │   │   ├── BackToTop.jsx
│   │   │   ├── ClickRipple.jsx
│   │   │   ├── ScrollProgress.jsx
│   │   │   ├── ScrollSpy.jsx
│   │   │   └── TiltCard.jsx
│   │   ├── ui/                   # Componentes base (shadcn/ui)
│   │   ├── AICreations.jsx
│   │   ├── AIToolsBanner.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── GettingStarted.jsx
│   │   ├── Hero.jsx
│   │   ├── MiranteAIs.jsx
│   │   ├── Navbar.jsx            # Inclui link "Notícias IA" → /noticias
│   │   ├── PolicyModal.jsx
│   │   ├── PortalPreview.jsx
│   │   └── PromptBankCTA.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.jsx           # Contexto de autenticação Firebase
│   │   ├── useNews.js            # Lê /news.json com cache localStorage (TTL 1h)
│   │   ├── useScrollReveal.js
│   │   └── useTheme.jsx          # Contexto de tema claro/escuro
│   │
│   ├── pages/
│   │   └── NewsPage.jsx          # Página /noticias — feed, filtros por setor, modal leitor
│   │
│   ├── data/
│   │   ├── aiTools.js
│   │   └── mirante.js
│   │
│   ├── lib/
│   │   └── utils.js
│   │
│   ├── App.jsx                   # Roteamento: /, /noticias, /admin/*
│   ├── index.css                 # Variáveis de design, blobs, dot-grid, shimmer-text
│   └── main.jsx
│
├── .env                          # ⚠️ NÃO commitado — credenciais reais
├── .env.example                  # Template público de variáveis
├── .gitignore
├── index.html
├── package.json
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
   - **URL** — cole um link do YouTube
   - **Upload** — envie vídeo, imagem ou áudio
4. Clique em **Publicar**

### Editando uma Publicação

- A mídia atual é exibida em tempo real no formulário
- Para substituir: faça upload de um novo arquivo (o arquivo antigo é deletado automaticamente do Storage)
- Para remover sem substituir: clique em **Remover mídia** e adicione uma nova antes de salvar

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

> ⚠️ O commit diário do `news.json` usa `[skip ci]` na mensagem para **não disparar** um novo deploy desnecessário.

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

---

## Licença

Uso interno — Mirante Tecnologia. Todos os direitos reservados.
