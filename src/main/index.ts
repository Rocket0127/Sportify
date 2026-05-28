import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow(): void {
  // Position the window in the top-right corner of the screen
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: 360,
    height: 600,
    x: screenWidth - 380, // 20px gap from right edge
    y: 20,

    frame: false,       // No title bar or OS window chrome
    transparent: true,  // Required for rounded corners & glass look
    alwaysOnTop: true,  // Float above all other windows on startup
    resizable: false,   // Fixed miniplayer size
    skipTaskbar: false, // Still shows in taskbar so user can find it

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true, // Sandboxes the renderer — required for security
      sandbox: false,
    },
  })

  // ── IPC HANDLERS ────────────────────────────────────────────────────────
  // The renderer (React) sends these messages via preload.ts.

  ipcMain.on('close-window', () => win.close())
  ipcMain.on('minimize-window', () => win.minimize())

  // 'floating' level: above normal apps, but below system UI (macOS menu bar etc.)
  ipcMain.on('set-always-on-top', (_event, flag: boolean) => {
    win.setAlwaysOnTop(flag, 'floating')
  })

  // ── LOAD THE RENDERER ───────────────────────────────────────────────────
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])   // Vite dev server
    win.webContents.openDevTools({ mode: 'detach' })    // Detached DevTools
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html')) // Production build
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.miniscore')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})