# Portal IA Mirante

Portal interno da **Mirante Tecnologia** para centralizar e divulgar o uso de Inteligência Artificial na empresa — ferramentas homologadas, criações feitas com IA, cases de uso e recursos educativos.

> **Stack:** React 19 · Vite 8 · Tailwind CSS v4 · Firebase 12 (Auth + Firestore + Storage)

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Firebase — Configuração Inicial](#firebase--configuração-inicial)
  - [Firestore Rules](#firestore-rules)
  - [Storage Rules](#storage-rules)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Área Admin](#área-admin)
- [Tipos de Mídia Suportados](#tipos-de-mídia-suportados)
- [Deploy](#deploy)
- [Variáveis de Ambiente em Produção](#variáveis-de-ambiente-em-produção)

---

## Visão Geral

O Portal IA Mirante é uma **Single Page Application** (SPA) com duas áreas distintas:

| Área | Rota | Acesso |
|------|------|--------|
| Portal público | `/` | Todos os colaboradores |
| Painel administrativo | `/admin` | Usuários autenticados via Firebase Auth |

A página principal exibe seções de apresentação, ferramentas de IA homologadas, criações feitas com IA pelos colaboradores, CTA para o Banco de Prompts e outras informações institucionais.

---

## Funcionalidades

### Portal Público
- **Hero** com animação neural de fundo e efeitos visuais (cursor, ripple, scroll progress)
- **Ferramentas de IA** — carrossel com 10 ferramentas homologadas, drag-to-scroll, logos via lobehub/simpleicons CDN com fallback para iniciais
- **Criações com IA** — galeria de cards com suporte a vídeo, imagem e áudio; modal de visualização completa; filtros por área/ferramenta/tipo de mídia; scroll horizontal no mobile
- **Banco de Prompts CTA** — link para o portal de prompts interno
- **Tema claro/escuro** — alternância persistida em localStorage

### Painel Admin (`/admin`)
- **Dashboard** com lista de criações, thumbnails, badges de tipo de mídia, pesquisa em tempo real e prévia rápida (QuickViewModal)
- **Criação/Edição** de publicações com suporte a upload de **vídeo** (até 500 MB), **imagem** (até 20 MB, comprimida automaticamente) e **áudio** (até 100 MB)
- **Geração automática de thumbnail** para vídeos (primeiro frame via Canvas API)
- **Deleção de arquivos antigos** do Storage ao substituir mídia
- **Validação** de campos obrigatórios, incluindo mídia

---

## Pré-requisitos

- **Node.js** ≥ 18 (recomendado: 20 LTS)
- **npm** ≥ 9 (ou pnpm/yarn equivalente)
- Conta no **Firebase** com projeto criado
- Acesso ao **Firebase Console** para configurar Auth, Firestore e Storage

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

Crie o banco no modo **Produção** e aplique as regras abaixo.

#### Firestore Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Criações — leitura pública, escrita apenas autenticada
    match /creations/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Cloud Storage

Crie o bucket (região sugerida: `us-central1`) e aplique as regras abaixo.

#### Storage Rules

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Vídeos — leitura pública, upload/deleção apenas autenticado
    match /videos/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Imagens
    match /images/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Áudios
    match /audio/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Thumbnails gerados automaticamente para vídeos
    match /thumbnails/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR (porta 5173) |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Executa o ESLint no código-fonte |

---

## Estrutura do Projeto

```
portal-ia-mirante/
├── firebaseClient/
│   └── index.js              # Inicialização do Firebase (auth, db, storage)
├── src/
│   ├── assets/               # Logos e imagens estáticas
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx   # Lista de criações + QuickViewModal
│   │   │   ├── AdminLayout.jsx      # Layout protegido da área admin
│   │   │   ├── AdminLogin.jsx       # Tela de login
│   │   │   └── CreationForm.jsx     # Formulário criar/editar criação (upload de mídia)
│   │   ├── effects/
│   │   │   ├── BackToTop.jsx
│   │   │   ├── ClickRipple.jsx
│   │   │   ├── CursorFX.jsx
│   │   │   ├── NeuralBg.jsx
│   │   │   ├── ScrollProgress.jsx
│   │   │   ├── ScrollSpy.jsx
│   │   │   └── TiltCard.jsx
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── AICreations.jsx   # Galeria pública de criações com IA
│   │   ├── AIToolsBanner.jsx # Carrossel de ferramentas homologadas
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── MiranteAIs.jsx
│   │   ├── Navbar.jsx
│   │   ├── PolicyModal.jsx
│   │   └── PromptBankCTA.jsx
│   ├── data/
│   │   ├── aiTools.js        # Dados das 10 ferramentas de IA homologadas
│   │   └── mirante.js        # Dados institucionais da Mirante
│   ├── hooks/
│   │   ├── useAuth.jsx       # Contexto de autenticação Firebase
│   │   ├── useScrollReveal.js
│   │   └── useTheme.jsx      # Contexto de tema claro/escuro
│   ├── lib/
│   │   └── utils.js          # Utilitários (cn helper)
│   ├── App.jsx               # Roteamento principal (BrowserRouter)
│   ├── App.css
│   ├── index.css             # Variáveis de design e estilos globais
│   └── main.jsx
├── .env                      # ⚠️ Não commitado — credenciais reais
├── .env.example              # Template público de variáveis de ambiente
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js            # Aliases @/ e @infra/firebase
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
   - **Upload** — envie um arquivo de vídeo, imagem ou áudio
4. Clique em **Publicar**

### Editando uma Publicação

- A mídia atual é exibida em tempo real no formulário
- Para substituir: faça upload de um novo arquivo (o arquivo antigo é deletado automaticamente do Storage)
- Para remover sem substituir: clique em **Remover mídia** e então adicione uma nova antes de salvar

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

O projeto é uma SPA com React Router — certifique-se de configurar o servidor para redirecionar todas as rotas para `index.html`.

### Firebase Hosting (recomendado)

```bash
# Instale o Firebase CLI (uma vez)
npm install -g firebase-tools

# Login
firebase login

# Inicialize o Hosting no projeto
firebase init hosting
# → Public directory: dist
# → Single-page app: Yes
# → GitHub Actions: opcional

# Build + deploy
npm run build
firebase deploy --only hosting
```

### Outras plataformas

| Plataforma | Configuração |
|------------|-------------|
| **Vercel** | Importar repositório; framework preset: Vite. Rewrites são configurados automaticamente. |
| **Netlify** | Adicionar `_redirects` em `public/`: `/* /index.html 200` |
| **Nginx** | `try_files $uri $uri/ /index.html;` no bloco `location /` |

---

## Variáveis de Ambiente em Produção

Em qualquer plataforma de deploy, configure as mesmas variáveis do `.env` no painel de configuração de ambiente da plataforma (nunca no repositório).

- **Firebase Hosting** → Não aplica (o build já embute os valores em tempo de build; configure antes de `npm run build`)
- **Vercel** → Project Settings → Environment Variables
- **Netlify** → Site configuration → Environment variables

---

## Licença

Uso interno — Mirante Tecnologia. Todos os direitos reservados.
