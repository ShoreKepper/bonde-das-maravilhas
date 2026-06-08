import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bonde-das-maravilhas/', // nome do repositório no GitHub
})
