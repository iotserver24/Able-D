export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  
  // Ignore certain paths that shouldn't be handled by React Router
  ignoredRouteFiles: ["**/.well-known/**"],
  
  // Future flags for React Router v7
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
};
