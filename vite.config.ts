/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    if (!env.VITE_API_BASE_URL?.trim()) {
      throw new Error(
        'VITE_API_BASE_URL não está definida. O build não cai em localhost: defina a variável (ex.: /api na Vercel).',
      )
    }
  }

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
    },
  }
})
