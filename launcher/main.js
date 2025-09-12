require('dotenv').config();
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1015,
    height: 683,
    resizable: false,
    title: 'BoomMania | Game Launcher',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Cargar la URL donde está el frontend de Vue
  const vueURL = process.env.VUE_URL || "https://play.boommania.com/";
  mainWindow.loadURL(vueURL);

  mainWindow.webContents.on('page-title-updated', (event) => {
    event.preventDefault();
    mainWindow.setTitle('BoomMania | Game Launcher');
  });

  // Registrar atajo de teclado F1 para abrir DevTools
  globalShortcut.register('F1', () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });

  // Registrar atajo de teclado F5 para recargar la página
  globalShortcut.register('F5', () => {
    if (mainWindow) mainWindow.reload();
  });

  // Registrar Ctrl+R para recargar (Mac usa ⌘+R)
  globalShortcut.register('CommandOrControl+R', () => {
    if (mainWindow) mainWindow.reload();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll(); // Eliminar los atajos al cerrar la app
});
