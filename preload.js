const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rftApi', {
  executarComando: (comandoFront) => ipcRenderer.invoke('executar-comando', comandoFront),
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window')
}); 