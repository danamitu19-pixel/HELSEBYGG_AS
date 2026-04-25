import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During `npm run dev`, the frontend runs on http://localhost:5173
// and proxies /api/* to the API server. In production, the built
// files are served by IIS on the App Server, and IIS itself proxies
// /api/* to the API VM — so the frontend uses plain relative paths.
//
// Change `target` below to wherever your API is reachable from the
// machine you run `npm run dev` on:
//   - If dev-ing on the API VM itself:  http://127.0.0.1:3000
//   - If dev-ing from your host PC:     http://192.168.20.20:3000
//     (only works if the host can route to the API subnet)

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
