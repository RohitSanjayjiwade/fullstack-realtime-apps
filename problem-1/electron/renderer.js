const { ipcRenderer } = require('electron');

const startBtn = document.getElementById('start');
const stopBtn  = document.getElementById('stop');

startBtn.onclick = async () => {
  const started = await ipcRenderer.invoke('start-record');
  if (started) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    alert("Already recording or failed to start.");
  }
};

stopBtn.onclick = async () => {
  const stopped = await ipcRenderer.invoke('stop-record');
  if (stopped) {
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
};

ipcRenderer.on('audio-chunk', (_e, chunk) => {
  console.log("🎧 Received chunk:", chunk.length, "bytes");
  // You could decode or write to a file here
});

ipcRenderer.on('recording-stopped', () => {
  alert("Recording stopped.");
});
