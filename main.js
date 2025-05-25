const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('minimize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });
  ipcMain.on('close-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handlers para executar o binário rft.exe
const commandMap = {
  'Limpar Temp': 'clean-temp',
  'Desfragmentar': 'disk-defrag',
  'Liberar Memória': 'free-mem',
  'Sistema': 'sys-info',
  'Conectar IA': 'connect-ia',
};

ipcMain.handle('executar-comando', async (event, comandoFront) => {
  const comando = commandMap[comandoFront];
  if (!comando) {
    return { status: 'error', message: 'Comando inválido.' };
  }
  return new Promise((resolve) => {
    execFile(path.join(__dirname, 'rft.exe'), [comando], { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        resolve({ status: 'error', message: error.message });
        return;
      }
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch (e) {
        resolve({ status: 'error', message: 'Saída inesperada do CLI.' });
      }
    });
  });
}); 