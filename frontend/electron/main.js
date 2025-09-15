
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  });

if (process.env.NODE_ENV === "development") {
  win.loadURL("http://localhost:3000");
  win.webContents.openDevTools();
} else {
  win.loadFile(path.join(__dirname, "../build/index.html"));
}
}


app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // IPC handler to save product data and image
  ipcMain.handle("save-product", async (event, product) => {
    try {
      const saveDir = path.join(app.getPath("documents"), "ProductManagerData");
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir);
      }
      // Save product data as JSON
      const dataPath = path.join(saveDir, "products.json");
      let products = [];
      if (fs.existsSync(dataPath)) {
        products = JSON.parse(fs.readFileSync(dataPath));
      }
      // Save image if provided
      if (product.imagePath) {
        const imageExt = path.extname(product.imagePath);
        const imageDest = path.join(saveDir, `${product.name}_${Date.now()}${imageExt}`);
        fs.copyFileSync(product.imagePath, imageDest);
        product.savedImagePath = imageDest;
      }
      // Add product with savedImagePath
      products.push({ ...product, savedImagePath: product.savedImagePath });
      fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
      return { success: true, product: { ...product, savedImagePath: product.savedImagePath } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // IPC handler to open image selection dialog
  ipcMain.handle("select-image", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["jpg", "jpeg", "png", "gif"] }
      ]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // IPC handler to load products from local storage
  ipcMain.handle("load-products", async () => {
    try {
      const saveDir = path.join(app.getPath("documents"), "ProductManagerData");
      const dataPath = path.join(saveDir, "products.json");
      if (fs.existsSync(dataPath)) {
        const products = JSON.parse(fs.readFileSync(dataPath));
        return { success: true, products };
      }
      return { success: true, products: [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
