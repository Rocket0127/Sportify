/// <reference types="vite/client" />

/**
 * Extend the global Window type to include our preload-exposed APIs.
 */
interface Window {
  windowAPI: {
    close:          () => void
    minimize:       () => void
    setAlwaysOnTop: (flag: boolean) => void
  }
}