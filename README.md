# SeniorInsight Web Portal

Landing page e portal web do SeniorInsight (Vite + React + TypeScript + React Router + TanStack Query + Recharts).

A landing page institucional fica em `src/pages/LandingPage.tsx` (rota `/`) e convive com o portal em `/portal` (`src/pages/` para as áreas do Familiar, Médico, Operadora e Equipe); os componentes compartilhados e gráficos Recharts ficam em `src/components/`, os clientes HTTP e serviços em `src/services/`, os hooks do TanStack Query em `src/hooks/` e as imagens exportadas do Figma em `src/assets/figma/`. O build (`npm run build`) gera `dist/`, que a Vercel detecta automaticamente como projeto Vite.

## Requirements

- Node.js 22+ (latest LTS recommended)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

## Integração com o API Gateway (BFF: cookie httpOnly + CSRF)

O portal **não guarda tokens no navegador** (`localStorage` / `sessionStorage`). O login OIDC no Keycloak é intermediado pelo `si-api-gateway` (BFF), que mantém a sessão no Redis (`gw:sess:{id}`) associada a um cookie `httpOnly` e exige proteção anti-CSRF (`XSRF-TOKEN` → cabeçalho `X-XSRF-TOKEN` nas requisições `POST`, `PUT`, `PATCH` e `DELETE`).

A URL base deve apontar exclusivamente para o API Gateway (nunca diretamente para microsserviços internos):

- `VITE_API_BASE_URL`: obrigatória no `npm run build`, que falha sem ela. Só o `npm run dev` usa `http://localhost:8080/api` como padrão.

Se o gateway não responder, responder com erro (401, 403, 5xx) ou devolver uma sessão inválida, o portal fica **sem sessão**. Não há sessão de demonstração por fallback.

Para desenvolver as telas sem o gateway, use `VITE_MODO_DEMO=true` no `npm run dev`. A sessão de demonstração só existe no servidor de desenvolvimento e não entra no build.

O portal verifica a disponibilidade do gateway e o estado da sessão chamando:

- `GET {VITE_API_BASE_URL}/health`
- `GET {VITE_API_BASE_URL}/auth/session` (com `credentials: 'include'`)

## Scripts

- `npm run dev` – start local dev server
- `npm run build` – type-check and build for production
- `npm run lint` – run lint checks
- `npm test` – run the tests (Vitest)
- `npm run preview` – preview production build locally
