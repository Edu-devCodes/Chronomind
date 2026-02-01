import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
 export default defineConfig({
   plugins: [react()],   server: {
    host: true,        // permite acesso externo
    port: 5173,        // mesma porta do Vite
    strictPort: true,  // impede mudar a porta
  }
})


// testar pelo cll
