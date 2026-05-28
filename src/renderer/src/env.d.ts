/// <reference types="vite/client" />

interface Window {
  windowAPI: {
    close:          () => void
    minimize:       () => void
    setAlwaysOnTop: (flag: boolean) => void
    resize:         (width: number, height: number) => void
  }
}