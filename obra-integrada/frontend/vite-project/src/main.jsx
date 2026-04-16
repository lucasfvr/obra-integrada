import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";

import App from './view/App.jsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SidebarProvider } from './context/SidebarContext.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
