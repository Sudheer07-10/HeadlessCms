// vite.config.ts
import devServer from "file:///D:/CMS%20FINAL/morphic-cms/node_modules/.pnpm/@hono+vite-dev-server@0.17.0_hono@4.12.3/node_modules/@hono/vite-dev-server/dist/index.js";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "file:///D:/CMS%20FINAL/morphic-cms/node_modules/.pnpm/vite@5.4.21_@types+node@22._ff9c4910dfd0d9620060aba4465db2c4/node_modules/vite/dist/node/index.js";
import react from "file:///D:/CMS%20FINAL/morphic-cms/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__7a813cc7fe52326c2e8ffe87f72af349/node_modules/@vitejs/plugin-react/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/CMS%20FINAL/morphic-cms/vite.config.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(__filename);
var getGitHash = () => {
  try {
    return execSync("git rev-parse --short=5 HEAD").toString().trim();
  } catch (_e) {
    return "unknown";
  }
};
var vite_config_default = defineConfig({
  plugins: [
    react(),
    devServer({
      entry: "src/api/index.ts",
      exclude: [
        /^\/(src\/pages|src\/lib|src\/components)\/.+/,
        /.*\.tsx?(\?.*)?$/,
        /.*\.css(\?.*)?$/,
        /^\/node_modules\/.*/,
        /^\/@.+$/,
        /^\/favicon\.png$/
      ],
      injectClientScript: false
    })
  ],
  define: {
    "import.meta.env.VITE_GIT_HASH": JSON.stringify(getGitHash())
  },
  build: {
    manifest: true,
    outDir: "dist"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDTVMgRklOQUxcXFxcbW9ycGhpYy1jbXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXENNUyBGSU5BTFxcXFxtb3JwaGljLWNtc1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovQ01TJTIwRklOQUwvbW9ycGhpYy1jbXMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgZGV2U2VydmVyIGZyb20gJ0Bob25vL3ZpdGUtZGV2LXNlcnZlcidcclxuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcblxyXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpXHJcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKVxyXG5cclxuY29uc3QgZ2V0R2l0SGFzaCA9ICgpID0+IHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGV4ZWNTeW5jKCdnaXQgcmV2LXBhcnNlIC0tc2hvcnQ9NSBIRUFEJykudG9TdHJpbmcoKS50cmltKClcclxuICB9IGNhdGNoIChfZSkge1xyXG4gICAgcmV0dXJuICd1bmtub3duJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgZGV2U2VydmVyKHtcclxuICAgICAgZW50cnk6ICdzcmMvYXBpL2luZGV4LnRzJyxcclxuICAgICAgZXhjbHVkZTogW1xyXG4gICAgICAgIC9eXFwvKHNyY1xcL3BhZ2VzfHNyY1xcL2xpYnxzcmNcXC9jb21wb25lbnRzKVxcLy4rLyxcclxuICAgICAgICAvLipcXC50c3g/KFxcPy4qKT8kLyxcclxuICAgICAgICAvLipcXC5jc3MoXFw/LiopPyQvLFxyXG4gICAgICAgIC9eXFwvbm9kZV9tb2R1bGVzXFwvLiovLFxyXG4gICAgICAgIC9eXFwvQC4rJC8sXHJcbiAgICAgICAgL15cXC9mYXZpY29uXFwucG5nJC8sXHJcbiAgICAgIF0sXHJcbiAgICAgIGluamVjdENsaWVudFNjcmlwdDogZmFsc2UsXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIGRlZmluZToge1xyXG4gICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX0dJVF9IQVNIJzogSlNPTi5zdHJpbmdpZnkoZ2V0R2l0SGFzaCgpKSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBtYW5pZmVzdDogdHJ1ZSxcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrUSxPQUFPLGVBQWU7QUFDeFIsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUwySSxJQUFNLDJDQUEyQztBQU85TSxJQUFNLGFBQWEsY0FBYyx3Q0FBZTtBQUNoRCxJQUFNLFlBQVksS0FBSyxRQUFRLFVBQVU7QUFFekMsSUFBTSxhQUFhLE1BQU07QUFDdkIsTUFBSTtBQUNGLFdBQU8sU0FBUyw4QkFBOEIsRUFBRSxTQUFTLEVBQUUsS0FBSztBQUFBLEVBQ2xFLFNBQVMsSUFBSTtBQUNYLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsTUFDUixPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsSUFDdEIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGlDQUFpQyxLQUFLLFVBQVUsV0FBVyxDQUFDO0FBQUEsRUFDOUQ7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxXQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
