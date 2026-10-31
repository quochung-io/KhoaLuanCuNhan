// ============================================================================
// TỆP MÃ NGUỒN: web-portal/src/main.tsx
// MÔ TẢ: Thành phần/Cấu hình main.tsx thuộc phân hệ Quản trị Web Portal (Admin & Nhà cung cấp).
// ============================================================================
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
