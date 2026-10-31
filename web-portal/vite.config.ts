// ============================================================================
// TỆP MÃ NGUỒN: web-portal/vite.config.ts
// MÔ TẢ: Tệp mã nguồn vite.config.ts thuộc hệ thống Thương mại điện tử Nông sản sạch LÀNH Farm.
// ============================================================================
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
