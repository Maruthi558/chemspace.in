import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist');
        const indexPath = path.join(distDir, 'index.html');
        const fallback200 = path.join(distDir, '200.html');
        const fallback404 = path.join(distDir, '404.html');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, fallback200);
          fs.copyFileSync(indexPath, fallback404);
          fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
        }

        // Generate deployment package.json in dist for branch runners (e.g. Cloudflare Pages / opt/buildhome)
        const distPkgPath = path.join(distDir, 'package.json');
        const rootPkgPath = path.resolve(__dirname, 'package.json');
        if (fs.existsSync(rootPkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
          const distPkg = {
            name: pkg.name || 'chemspace',
            private: true,
            version: pkg.version || '0.0.0',
            type: 'module',
            scripts: {
              build: "echo 'ChemSpace production bundle already compiled'",
              start: "npx serve .",
              preview: "vite preview"
            }
          };
          fs.writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2));
        }

        // Copy and adjust wrangler.json for dist directory
        const wranglerPath = path.resolve(__dirname, 'wrangler.json');
        const distWrangler = path.join(distDir, 'wrangler.json');
        if (fs.existsSync(wranglerPath)) {
          const wranglerConfig = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));
          wranglerConfig.pages_build_output_dir = '.';
          wranglerConfig.assets = { directory: '.', not_found_handling: 'single-page-application' };
          fs.writeFileSync(distWrangler, JSON.stringify(wranglerConfig, null, 2));
        }

        // Sync full bundle to docs/ folder (supports GitHub Pages Source: master /docs)
        const docsDir = path.resolve(__dirname, 'docs');
        fs.cpSync(distDir, docsDir, { recursive: true, force: true });

        // Sync dist/assets to root assets/ and create canonical index.js / index.css entry points
        // (supports GitHub Pages Source: master / (root) fallback)
        const distAssetsDir = path.join(distDir, 'assets');
        const rootAssetsDir = path.resolve(__dirname, 'assets');
        if (fs.existsSync(distAssetsDir)) {
          fs.cpSync(distAssetsDir, rootAssetsDir, { recursive: true, force: true });
          const files = fs.readdirSync(distAssetsDir);
          const jsEntry = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
          const cssEntry = files.find(f => f.startsWith('index-') && f.endsWith('.css'));

          if (jsEntry) {
            fs.copyFileSync(path.join(distAssetsDir, jsEntry), path.join(rootAssetsDir, 'index.js'));
            fs.copyFileSync(path.join(distAssetsDir, jsEntry), path.join(distAssetsDir, 'index.js'));
          }
          if (cssEntry) {
            fs.copyFileSync(path.join(distAssetsDir, cssEntry), path.join(rootAssetsDir, 'index.css'));
            fs.copyFileSync(path.join(distAssetsDir, cssEntry), path.join(distAssetsDir, 'index.css'));
          }

          const manifest = {
            entry: jsEntry ? `assets/${jsEntry}` : 'assets/index.js',
            css: cssEntry ? `assets/${cssEntry}` : 'assets/index.css'
          };
          fs.writeFileSync(path.join(rootAssetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
          fs.writeFileSync(path.join(distAssetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
        }
      } catch (err) {
        console.warn('Could not generate SPA fallbacks or deployment artifacts:', err);
      }
    }
  };
}

const isGitHubDeploy = Boolean(process.env.GITHUB_ACTIONS || process.env.GITHUB_PAGES);
const basePath = isGitHubDeploy ? '/chemspace.in/' : (process.env.VITE_BASE_PATH || './');

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), spaFallbackPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'vendor-three';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});
