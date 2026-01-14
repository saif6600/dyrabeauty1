
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure that if process.env.API_KEY is not set, it defaults to an empty string 
    // instead of letting the browser treat the variable as undefined or throwing errors.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  server: {
    port: 3000
  },
  build: {
    target: 'esnext'
  }
});
