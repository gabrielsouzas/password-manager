// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electronAPI', {
//   getData: () => ipcRenderer.invoke('get-data'),
//   saveData: (data) => ipcRenderer.invoke('save-data', data),
// });

const { contextBridge, ipcRenderer } = require('electron');
const CryptoJS = require('crypto-js');

contextBridge.exposeInMainWorld('electronAPI', {
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  encrypt: (text, key) => CryptoJS.AES.encrypt(text, key).toString(),
  decrypt: (cipher, key) => {
    const bytes = CryptoJS.AES.decrypt(cipher, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  hash: (text) => CryptoJS.SHA256(text).toString(),
});
