import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // ═══════════════════════════════════════════════════════════════
    // SEGURIDAD: Headers anti-Clickjacking y endurecimiento HTTP
    //   - X-Frame-Options: DENY → Prohíbe cargar la app dentro de
    //     un <iframe> en cualquier sitio externo (ataque Clickjacking).
    //   - Content-Security-Policy: frame-ancestors 'none' → Versión
    //     moderna del mismo bloqueo, compatible con navegadores nuevos.
    //   - X-Content-Type-Options: nosniff → Evita que el navegador
    //     interprete archivos con un MIME incorrecto (ataque MIME sniffing).
    // ═══════════════════════════════════════════════════════════════
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
