const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Cargar la URL donde está el frontend de Vue
  const vueURL = "http://play.boombang.com"; // Cambia esto si tu Vue está en otro servidor
  mainWindow.loadURL(vueURL);

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
