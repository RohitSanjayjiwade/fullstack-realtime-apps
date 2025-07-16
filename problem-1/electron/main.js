const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
let win, proc;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('renderer.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('start-record', () => {
  if (proc) return false;

  const helperPath = path.join(__dirname, 'swift', 'system_audio_capture');
  proc = spawn(helperPath, [], { stdio: ['ignore', 'pipe', 'pipe'] });

  proc.stdout.on('data', chunk => {
    win.webContents.send('audio-chunk', chunk);
  });

  proc.stderr.on('data', e => console.error('Swift Error:', e.toString()));

  proc.on('exit', () => {
    proc = null;
    win.webContents.send('recording-stopped');
  });

  return true;
});

ipcMain.handle('stop-record', () => {
  if (!proc) return false;
  proc.kill('SIGINT');
  return true;
});

app.on('window-all-closed', () => app.quit());
