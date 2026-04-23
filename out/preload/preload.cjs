"use strict";
const electron = require("electron");
var IpcChannel = /* @__PURE__ */ ((IpcChannel2) => {
  IpcChannel2["SHOW_TOAST"] = "show-toast";
  IpcChannel2["SETTINGS_GET"] = "settings-get";
  IpcChannel2["SETTINGS_SET"] = "settings-set";
  IpcChannel2["HOTKEY_GET_TOGGLE"] = "hotkey-get-toggle";
  IpcChannel2["HOTKEY_SET_TOGGLE"] = "hotkey-set-toggle";
  IpcChannel2["HOTKEY_GET_STOP_AFTER_GAME"] = "hotkey-get-stop-after-game";
  IpcChannel2["HOTKEY_SET_STOP_AFTER_GAME"] = "hotkey-set-stop-after-game";
  IpcChannel2["APP_GET_VERSION"] = "app-get-version";
  IpcChannel2["OVERLAY_CLOSE"] = "overlay-close";
  return IpcChannel2;
})(IpcChannel || {});
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...listenerArgs) => listener(event, ...listenerArgs));
  },
  off(...args) {
    const [channel, ...rest] = args;
    return electron.ipcRenderer.off(channel, ...rest);
  },
  send(...args) {
    const [channel, ...rest] = args;
    return electron.ipcRenderer.send(channel, ...rest);
  },
  invoke(...args) {
    const [channel, ...rest] = args;
    return electron.ipcRenderer.invoke(channel, ...rest);
  }
});
const ipcApi = {
  on: (channel, callback) => {
    const listener = (_event, ...args) => {
      callback(...args);
    };
    electron.ipcRenderer.on(channel, listener);
    return () => {
      electron.ipcRenderer.removeListener(channel, listener);
    };
  }
};
electron.contextBridge.exposeInMainWorld("ipc", ipcApi);
const utilApi = {
  getToggleHotkey: () => electron.ipcRenderer.invoke(IpcChannel.HOTKEY_GET_TOGGLE),
  setToggleHotkey: (accelerator) => electron.ipcRenderer.invoke(IpcChannel.HOTKEY_SET_TOGGLE, accelerator),
  getStopAfterGameHotkey: () => electron.ipcRenderer.invoke(IpcChannel.HOTKEY_GET_STOP_AFTER_GAME),
  setStopAfterGameHotkey: (accelerator) => electron.ipcRenderer.invoke(IpcChannel.HOTKEY_SET_STOP_AFTER_GAME, accelerator),
  getAppVersion: () => electron.ipcRenderer.invoke(IpcChannel.APP_GET_VERSION)
};
electron.contextBridge.exposeInMainWorld("util", utilApi);
const settingsApi = {
  get: (key) => electron.ipcRenderer.invoke(IpcChannel.SETTINGS_GET, key),
  set: (key, value) => electron.ipcRenderer.invoke(IpcChannel.SETTINGS_SET, key, value)
};
electron.contextBridge.exposeInMainWorld("settings", settingsApi);
