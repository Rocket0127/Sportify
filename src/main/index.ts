import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow(): void {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: 400,
    height: 650,
    x: screenWidth - 420,
    y: 100,                  // ← lower so title bar isn't cut off
    minWidth: 400,
    minHeight: 400,

    frame: false,
    transparent: false,
    backgroundColor: '#0b0b12',
    alwaysOnTop: true,
    resizable: true,         // ← TEMP: lets you resize to debug
    skipTaskbar: false,
    hasShadow: true,

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
    },
  })

  ipcMain.on('close-window', () => win.close())
  ipcMain.on('minimize-window', () => win.minimize())
  ipcMain.on('set-always-on-top', (_event, flag: boolean) => {
    win.setAlwaysOnTop(flag, 'floating')
  })

  // Resize the window when toggling between list and detail views
ipcMain.on('resize-window', (_event, { width, height }: { width: number; height: number }) => {
  const [x, y] = win.getPosition()
  // animate=true gives a smooth resize on macOS; harmless on Windows
  win.setBounds({ x, y, width, height }, true)
})

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
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