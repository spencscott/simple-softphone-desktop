const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
  notifyIncomingCall: (callerName, callerNumber) => {
    ipcRenderer.send("incoming-call", { callerName, callerNumber });
  },
  notifyCallEnded: () => {
    ipcRenderer.send("call-ended");
  },
});
