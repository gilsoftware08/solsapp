/** Use strict origin path so Capacitor resolves /models correctly on deep routes. */
export function getModelBasePath(): string {
  if (typeof window !== "undefined") {
    return window.location.origin + "/models";
  }
  return "/models";
}

