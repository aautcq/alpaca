// checkout https://github.com/gurvancampion/nuxt-electron-trpc-prisma/tree/master

import process from 'node:process'
import { release } from 'node:os'
import path from 'node:path'
import { BrowserWindow, app, shell, nativeImage } from 'electron'

// remove electron security warnings only in development mode
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// disable GPU Acceleration for Windows 7
if (release().startsWith('6.1'))
  app.disableHardwareAcceleration()

// set application name for Windows 10+ notifications
if (process.platform === 'win32')
  app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

const distPath = path.join(__dirname, '../.output/public')
const iconPath = path.join(__dirname, '../assets/icons/icon.png')

async function createWindow() {
  win = new BrowserWindow({
    icon: nativeImage.createFromPath(iconPath),
    webPreferences: {
      // Warning: Enabling nodeIntegration and disabling contextIsolation is not secure in production
      // consider using contextBridge.exposeInMainWorld
      // read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (app.isPackaged) {
    win.loadFile(path.join(distPath, 'index.html'))
  }
  else {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!)
    win.webContents.openDevTools()
  }

  // make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:'))
      shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.on('window-all-closed', () => {
  win = null
  // quit the app if the user closed the last window except on macOS
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // focus on the main window if the user tried to open another
    if (win.isMinimized())
      win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length)
    allWindows[0].focus()

  else
    createWindow()
})

app.whenReady().then(createWindow)
