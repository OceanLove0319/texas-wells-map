'use strict';
// Intentionally minimal: the renderer needs no Node or Electron APIs.
// All data is fetched from the local app:// scheme served by the main process.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('twm', { platform: process.platform });
