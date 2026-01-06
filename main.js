const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('Main process started');

let mainWindow;
// O arquivo data.json será salvo na pasta de dados do usuário do sistema
const DATA_PATH = path.join(app.getPath('userData'), 'data.json');
// console.log('Data path:', DATA_PATH);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js'), // Importante para segurança
    //   contextIsolation: true, // Garante a separação de processos
    //   nodeIntegration: false, // Impede o uso de require no renderer
    // },
  });

  mainWindow.loadFile('index.html');
}

// Manipuladores de arquivos (Respondendo ao renderer.js)
ipcMain.handle('get-data', () => {
  if (!fs.existsSync(DATA_PATH)) {
    return { masterHash: '', accounts: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
});

ipcMain.handle('save-data', (event, data) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
