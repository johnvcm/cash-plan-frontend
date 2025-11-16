# Cash Plan Frontend

**Autor:** João Victor Monteiro de Macedo  
**Email:** joaovicmonterio.m@gmail.com  
**Matrícula UERJ:** 201920458011

Interface web desenvolvida em React para gestão financeira pessoal. Implementa visualização de dados financeiros, operações CRUD sobre entidades financeiras e integração com agente conversacional baseado em linguagem natural.

## Tecnologias e Dependências

- **React** 18.3.1: Biblioteca JavaScript para construção de interfaces
- **TypeScript** 5.8.3: Superset tipado de JavaScript
- **Vite** 5.4.19: Build tool e servidor de desenvolvimento
- **React Router DOM** 6.30.1: Roteamento client-side
- **TanStack Query** 5.83.0: Gerenciamento de estado servidor e cache
- **React Hook Form** 7.61.1: Gerenciamento de formulários
- **Zod** 3.25.76: Validação de schemas TypeScript-first
- **Radix UI**: Componentes acessíveis headless
- **Tailwind CSS** 3.4.17: Framework CSS utility-first
- **Lucide React** 0.462.0: Biblioteca de ícones
- **Recharts** 2.15.4: Biblioteca de gráficos
- **Capacitor** 7.4.3: Framework para aplicações mobile híbridas
- **Sonner** 1.7.4: Sistema de notificações toast

## Arquitetura da Aplicação

A aplicação segue arquitetura de Single Page Application (SPA) com roteamento client-side e separação de responsabilidades.

### Estrutura de Diretórios

```
cash-plan-frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   ├── forms/           # Formulários específicos
│   │   └── *.tsx            # Componentes de domínio
│   ├── pages/               # Componentes de página (rotas)
│   ├── contexts/            # Contextos React (Auth, SwipeMenu)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários e configurações
│   ├── App.tsx              # Componente raiz e roteamento
│   └── main.tsx             # Ponto de entrada
├── public/                  # Arquivos estáticos
├── vite.config.ts           # Configuração do Vite
├── tailwind.config.ts       # Configuração do Tailwind CSS
└── package.json             # Dependências e scripts
```

### Componentes Principais

**Páginas (Rotas):**
- `Dashboard`: Visão geral com estatísticas e gráficos
- `Lancamentos`: Gerenciamento de transações financeiras
- `Contas`: Gerenciamento de contas bancárias
- `Cartoes`: Gerenciamento de cartões de crédito
- `Investimentos`: Gerenciamento de investimentos
- `Metas`: Gerenciamento de metas financeiras
- `ListaCompras`: Gerenciamento de listas de compras
- `Login`: Autenticação de usuário
- `Register`: Registro de novo usuário
- `NotFound`: Página 404

**Componentes de Domínio:**
- `GenAiAssistantDialog`: Interface conversacional com agente GenAI
- `AppHeader`: Cabeçalho da aplicação com navegação
- `AppSidebar`: Menu lateral responsivo
- `FloatingActionButton`: Botão de ação flutuante para assistente IA
- `TransactionCharts`: Visualizações gráficas de transações
- `AccountCard`: Card de exibição de conta bancária
- `CreditCardCard`: Card de exibição de cartão de crédito
- `StatCard`: Card de estatística reutilizável
- `TransactionItem`: Item de lista de transação
- `ShoppingListDetail`: Detalhes de lista de compras
- `CompleteShoppingListDialog`: Dialog para completar lista de compras
- `DeleteConfirmDialog`: Dialog de confirmação de exclusão
- `ProtectedRoute`: Componente de proteção de rotas

## Configuração e Instalação

### Pré-requisitos

- Node.js 18+ e npm (ou gerenciador compatível)
- Acesso ao backend API em execução

### Instalação

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build de produção
npm run preview
```

A aplicação estará disponível em `http://localhost:5173` (porta padrão do Vite).

### Variáveis de Ambiente

A URL base da API está configurada em `src/lib/api.ts`. Para desenvolvimento local, utilize o proxy configurado no `vite.config.ts` que redireciona `/api` para `http://localhost:8080`.

## Autenticação

Implementação baseada em JWT armazenado em `localStorage`.

### Fluxo de Autenticação

1. Usuário realiza login via `/login` com credenciais
2. Backend retorna token JWT no formato `{ access_token: string, token_type: "bearer" }`
3. Token armazenado em `localStorage` com chave `"token"`
4. Token incluído automaticamente em requisições via header `Authorization: Bearer <token>`
5. Rotas protegidas verificam autenticação via `ProtectedRoute`
6. Em caso de 401, token removido e redirecionamento para `/login`

### Contexto de Autenticação

`AuthContext` fornece:
- `isAuthenticated`: Estado booleano de autenticação
- `user`: Dados do usuário autenticado
- `login(username, password)`: Função de login
- `logout()`: Função de logout
- `register(userData)`: Função de registro

## Gerenciamento de Estado

### TanStack Query

Utilizado para:
- Cache de dados do servidor
- Sincronização automática
- Gerenciamento de loading e error states
- Invalidação de cache após mutações

### Contextos React

**AuthContext:**
- Estado global de autenticação
- Persistência de token
- Métodos de autenticação

**SwipeMenuContext:**
- Estado de menu lateral
- Handlers de gestos swipe
- Controle de abertura/fechamento

## Integração com API

### Cliente HTTP

Módulo `src/lib/api.ts` implementa cliente HTTP com:
- Injeção automática de token JWT
- Tratamento de erros HTTP
- Redirecionamento automático em 401
- Suporte a métodos GET, POST, PUT, PATCH, DELETE

### Estrutura de Requisições

```typescript
// GET
const data = await api.get("/endpoint");

// POST
const result = await api.post("/endpoint", { data });

// PUT
const updated = await api.put("/endpoint/id", { data });

// DELETE
await api.delete("/endpoint/id");
```

### Tratamento de Erros

- Status 401: Remove token e redireciona para login
- Status 204: Retorna `null` (No Content)
- Outros erros: Lança exceção com status e mensagem

## Interface do Usuário

### Design System

Baseado em shadcn/ui e Tailwind CSS com:
- Sistema de cores via CSS variables (HSL)
- Suporte a dark mode via `next-themes`
- Componentes acessíveis via Radix UI
- Responsividade mobile-first

### Componentes UI Base

Componentes primitivos do shadcn/ui:
- Button, Input, Dialog, Select, Tabs
- Card, Badge, Avatar, Separator
- Toast, Alert Dialog, Dropdown Menu
- Scroll Area, Progress, Skeleton

### Temas e Customização

Cores definidas em `src/index.css` via CSS variables:
- `--primary`: Cor primária da aplicação
- `--background`: Cor de fundo
- `--foreground`: Cor de texto
- `--muted`: Cores para elementos secundários
- `--destructive`: Cores para ações destrutivas
- `--success`, `--warning`: Cores semânticas

Gradientes customizados:
- `gradient-primary`: Gradiente para elementos primários
- `gradient-success`: Gradiente para sucesso
- `gradient-card`: Gradiente para cards

## Roteamento

### Estrutura de Rotas

**Rotas Públicas:**
- `/login`: Página de login
- `/register`: Página de registro

**Rotas Protegidas:**
- `/`: Dashboard (página inicial)
- `/lancamentos`: Transações financeiras
- `/contas`: Contas bancárias
- `/cartoes`: Cartões de crédito
- `/investimentos`: Investimentos
- `/metas`: Metas financeiras
- `/lista-compras`: Listas de compras
- `*`: Página 404

### Proteção de Rotas

`ProtectedRoute` verifica autenticação antes de renderizar componentes protegidos. Redireciona para `/login` se não autenticado.

## Assistente GenAI

### Componente GenAiAssistantDialog

Interface conversacional que integra com endpoint `/genai/chat` do backend.

**Funcionalidades:**
- Chat em tempo real com agente conversacional
- Suporte a consultas em linguagem natural (Text2SQL)
- Suporte a inserção de dados via linguagem natural
- Exibição de queries SQL geradas (modo debug)
- Histórico de mensagens com scroll automático
- Indicador de loading durante processamento
- Limpeza de histórico de conversa

**Estados:**
- `messages`: Array de mensagens do chat
- `input`: Texto do campo de entrada
- `loading`: Estado de carregamento da requisição

**Interações:**
- Envio via botão ou Enter (Shift+Enter para nova linha)
- Auto-scroll para última mensagem
- Limpeza de histórico preservando mensagem inicial

### Integração com Backend

Requisições POST para `/genai/chat` com payload:
```typescript
{
  prompt: string  // Mensagem do usuário
}
```

Resposta esperada:
```typescript
{
  response: string,        // Resposta do agente
  sql_query?: string,      // Query SQL gerada (se aplicável)
  data?: any[],           // Dados retornados (se aplicável)
  error?: boolean,        // Flag de erro
  entity_type?: string,   // Tipo de entidade criada
  created_id?: number,    // ID da entidade criada
  created_ids?: number[] // IDs de múltiplas entidades criadas
```
```

## Responsividade e Mobile

### Capacitor Integration

Configuração para aplicação mobile híbrida:
- Plugins para StatusBar, Keyboard, App lifecycle
- Suporte a gestos nativos
- Adaptação de UI para dispositivos móveis

### Breakpoints Tailwind

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px

### Swipe Gestures

Implementação de gestos swipe para menu lateral via `SwipeMenuContext` e `react-swipeable`.

## Visualizações e Gráficos

### TransactionCharts

Componente de visualização utilizando Recharts:
- Gráficos de barras para gastos por categoria
- Gráficos de linha para evolução temporal
- Gráficos de pizza para distribuição de despesas
- Filtros por período (mês, ano)

## Formulários e Validação

### React Hook Form + Zod

Padrão utilizado para formulários:
- Validação client-side via Zod schemas
- Gerenciamento de estado via React Hook Form
- Mensagens de erro customizadas
- Integração com componentes shadcn/ui

### Formulários Implementados

- Login/Registro de usuário
- Criação/edição de transações
- Criação/edição de contas
- Criação/edição de cartões
- Criação/edição de investimentos
- Criação/edição de metas
- Criação/edição de listas de compras

## Build e Deploy

### Build de Produção

```bash
npm run build
```

Gera arquivos otimizados em `dist/`:
- JavaScript minificado e code-splitting
- CSS otimizado e purged
- Assets estáticos processados

### Deploy

Aplicação pode ser deployada em:
- Vercel (recomendado para React)
- Netlify
- GitHub Pages
- Qualquer servidor estático

### Variáveis de Build

Para diferentes ambientes, ajustar `API_BASE_URL` em `src/lib/api.ts` ou utilizar variáveis de ambiente via `import.meta.env`.

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev`: Servidor de desenvolvimento com HMR
- `npm run build`: Build de produção
- `npm run build:dev`: Build em modo desenvolvimento
- `npm run preview`: Preview do build de produção
- `npm run lint`: Executa ESLint

### Hot Module Replacement

Vite fornece HMR nativo para desenvolvimento rápido com preservação de estado.

### TypeScript

Configuração TypeScript em:
- `tsconfig.json`: Configuração base
- `tsconfig.app.json`: Configuração da aplicação
- `tsconfig.node.json`: Configuração para Node.js (Vite)

## Acessibilidade

- Componentes Radix UI seguem padrões ARIA
- Navegação por teclado suportada
- Contraste de cores adequado
- Labels semânticos em formulários
- Feedback visual para ações do usuário

## Performance

### Otimizações Implementadas

- Code splitting automático via Vite
- Lazy loading de rotas (via React Router)
- Memoização de componentes pesados
- Debounce em inputs de busca
- Cache de requisições via TanStack Query
- Virtualização de listas longas (quando aplicável)

### Métricas

- First Contentful Paint otimizado
- Time to Interactive reduzido
- Bundle size otimizado via tree-shaking

## Segurança

### Práticas Implementadas

- Token JWT armazenado em localStorage (considerar httpOnly cookies em produção)
- Validação client-side não substitui validação server-side
- Sanitização de inputs via Zod
- Proteção CSRF via SameSite cookies (backend)
- Headers de segurança configurados no backend

### Considerações de Produção

- Utilizar HTTPS obrigatório
- Implementar refresh tokens
- Considerar httpOnly cookies para tokens
- Implementar rate limiting no backend
- Adicionar Content Security Policy headers
