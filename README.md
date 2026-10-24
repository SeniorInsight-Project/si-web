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

## Java Spring backend integration

The frontend reads the backend base URL from:

- `VITE_API_BASE_URL` (default: `http://localhost:8080/api`)

The initial app checks backend health by calling:

- `GET {VITE_API_BASE_URL}/health`

Make sure your Spring backend exposes this endpoint and has CORS enabled for the frontend origin (`http://localhost:5173` by default).

## Scripts

- `npm run dev` – start local dev server
- `npm run build` – type-check and build for production
- `npm run lint` – run lint checks
- `npm run preview` – preview production build locally
