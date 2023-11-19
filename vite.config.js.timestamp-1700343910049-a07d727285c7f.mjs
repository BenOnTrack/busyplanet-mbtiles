// vite.config.js
import { sveltekit } from "file:///Users/benjaminmodave/Documents/Coding/busyplanet-sveltekit-pwa/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { SvelteKitPWA } from "file:///Users/benjaminmodave/Documents/Coding/busyplanet-sveltekit-pwa/node_modules/@vite-pwa/sveltekit/dist/index.mjs";
var config = {
  worker: {
    plugins: [sveltekit()],
    format: "es"
  },
  optimizeDeps: {
    include: "jszip"
  },
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
        suppressWarnings: true
      },
      manifest: {
        theme_color: "green",
        icons: [
          {
            src: "manifest-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "manifest-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          }
        ]
      },
      workbox: {
        // use client/ prefix always, the folder for workbox is .svetlekit/output
        // don't include json files, include specific json names
        globPatterns: ["client/**/*.{ico,js,css,html,png,jpg,svg}", "client/mystyle.json"],
        navigateFallbackDenylist: [/\.zip$/]
      }
      //   strategies: 'injectManifest',
      //   srcDir: 'src',
      //   filename: 'my-sw.js', // or `my-sw.ts`
      /* other pwa options */
    })
  ]
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYmVuamFtaW5tb2RhdmUvRG9jdW1lbnRzL0NvZGluZy9idXN5cGxhbmV0LXN2ZWx0ZWtpdC1wd2FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW5qYW1pbm1vZGF2ZS9Eb2N1bWVudHMvQ29kaW5nL2J1c3lwbGFuZXQtc3ZlbHRla2l0LXB3YS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmVuamFtaW5tb2RhdmUvRG9jdW1lbnRzL0NvZGluZy9idXN5cGxhbmV0LXN2ZWx0ZWtpdC1wd2Evdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgU3ZlbHRlS2l0UFdBIH0gZnJvbSAnQHZpdGUtcHdhL3N2ZWx0ZWtpdCc7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCd2aXRlJykuVXNlckNvbmZpZ30gKi9cbmNvbnN0IGNvbmZpZyA9IHtcblx0d29ya2VyOiB7XG5cdFx0cGx1Z2luczogW3N2ZWx0ZWtpdCgpXSxcblx0XHRmb3JtYXQ6ICdlcycsXG5cdH0sXG5cdG9wdGltaXplRGVwczoge1xuXHRcdGluY2x1ZGU6ICdqc3ppcCdcblx0fSxcblx0cGx1Z2luczogW3N2ZWx0ZWtpdCgpLFxuXHRTdmVsdGVLaXRQV0Eoe1xuXHRcdHN0cmF0ZWdpZXM6ICdnZW5lcmF0ZVNXJyxcblx0XHRyZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcblx0XHRkZXZPcHRpb25zOiB7XG5cdFx0XHRlbmFibGVkOiBmYWxzZSxcblx0XHRcdHN1cHByZXNzV2FybmluZ3M6IHRydWUsXG5cdFx0fSxcblx0XHRtYW5pZmVzdDoge1xuXHRcdFx0dGhlbWVfY29sb3I6ICdncmVlbicsXG5cdFx0XHRpY29uczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3JjOiAnbWFuaWZlc3QtaWNvbi0xOTIucG5nJyxcblx0XHRcdFx0XHRzaXplczogJzE5MngxOTInLFxuXHRcdFx0XHRcdHR5cGU6ICdpbWFnZS9wbmcnLFxuXHRcdFx0XHRcdHB1cnBvc2U6ICdtYXNrYWJsZSBhbnknXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzcmM6ICdtYW5pZmVzdC1pY29uLTUxMi5wbmcnLFxuXHRcdFx0XHRcdHNpemVzOiAnNTEyeDUxMicsXG5cdFx0XHRcdFx0dHlwZTogJ2ltYWdlL3BuZycsXG5cdFx0XHRcdFx0cHVycG9zZTogJ2FueSdcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0sXG5cdFx0d29ya2JveDoge1xuXHRcdFx0Ly8gdXNlIGNsaWVudC8gcHJlZml4IGFsd2F5cywgdGhlIGZvbGRlciBmb3Igd29ya2JveCBpcyAuc3ZldGxla2l0L291dHB1dFxuXHRcdFx0Ly8gZG9uJ3QgaW5jbHVkZSBqc29uIGZpbGVzLCBpbmNsdWRlIHNwZWNpZmljIGpzb24gbmFtZXNcblx0XHRcdGdsb2JQYXR0ZXJuczogWydjbGllbnQvKiovKi57aWNvLGpzLGNzcyxodG1sLHBuZyxqcGcsc3ZnfScsICdjbGllbnQvbXlzdHlsZS5qc29uJ10sXG5cdFx0XHRuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXFwuemlwJC9dLFxuXHRcdH1cblx0XHQvLyAgIHN0cmF0ZWdpZXM6ICdpbmplY3RNYW5pZmVzdCcsXG5cdFx0Ly8gICBzcmNEaXI6ICdzcmMnLFxuXHRcdC8vICAgZmlsZW5hbWU6ICdteS1zdy5qcycsIC8vIG9yIGBteS1zdy50c2Bcblx0XHQvKiBvdGhlciBwd2Egb3B0aW9ucyAqL1xuXHR9KV1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1csU0FBUyxpQkFBaUI7QUFDelksU0FBUyxvQkFBb0I7QUFHN0IsSUFBTSxTQUFTO0FBQUEsRUFDZCxRQUFRO0FBQUEsSUFDUCxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsSUFDckIsUUFBUTtBQUFBLEVBQ1Q7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNiLFNBQVM7QUFBQSxFQUNWO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFBQyxVQUFVO0FBQUEsSUFDcEIsYUFBYTtBQUFBLE1BQ1osWUFBWTtBQUFBLE1BQ1osY0FBYztBQUFBLE1BQ2QsWUFBWTtBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1Qsa0JBQWtCO0FBQUEsTUFDbkI7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNOO0FBQUEsWUFDQyxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDVjtBQUFBLFVBQ0E7QUFBQSxZQUNDLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNWO0FBQUEsUUFDRDtBQUFBLE1BQ0Q7QUFBQSxNQUNBLFNBQVM7QUFBQTtBQUFBO0FBQUEsUUFHUixjQUFjLENBQUMsNkNBQTZDLHFCQUFxQjtBQUFBLFFBQ2pGLDBCQUEwQixDQUFDLFFBQVE7QUFBQSxNQUNwQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLRCxDQUFDO0FBQUEsRUFBQztBQUNIO0FBRUEsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
