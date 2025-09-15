
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => "pong",
  saveProduct: (product) => ipcRenderer.invoke("save-product", product),
  selectImage: () => ipcRenderer.invoke("select-image"),
  loadProducts: () => ipcRenderer.invoke("load-products"),
});
