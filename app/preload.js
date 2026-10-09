'use strict';
// Minimal bridge: the renderer needs no Node APIs. Data comes from the local app:// scheme.
// openExternal is only called when the user clicks a document link; the main process validates
// that it is an http(s) URL and hands it to the default browser.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('twm', {
  platform: process.platform,
  openExternal: (url) => ipcRenderer.invoke('open-external', String(url)),
});
