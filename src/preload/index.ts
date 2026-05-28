import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Default electron-toolkit helpers (optional, harmless to keep)
contextBridge.exposeInMainWorld('electron', electronAPI)

/**
 * Our custom window API — the ONLY way React can control the window.
 * contextIsolation means React has no direct Node.js access, which is correct.
 */
contextBridge.exposeInMainWorld('windowAPI', {
  close:          ()             => ipcRenderer.send('close-window'),
  minimize:       ()             => ipcRenderer.send('minimize-window'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('set-always-on-top', flag),
})