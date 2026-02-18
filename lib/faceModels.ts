export function getModelBasePath() {
  if (typeof window !== "undefined") {
    if (window.location.protocol === "file:") {
      // Capacitor / static file builds (file://...)
      return "models";
    }
  }
  // Default for dev / web (http://localhost:3000, etc.)
  return "/models";
}

