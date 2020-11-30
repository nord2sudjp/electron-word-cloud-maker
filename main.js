const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const log = require("electron-log");
const slash = require("slash");
const fs = require("fs");

process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production" ? true : false;

//console.log(process.platform)
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Word-cloud",
    width: isDev ? 800 : 500,
    height: 600,
    resizable: isDev ? true : false,
    backgroundColor: "white",
    webPreferences: { nodeIntegration: true },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // mainWindow.loadURL("https://www.google.com")
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

function createAboutWindow() {
  mainWindow = new BrowserWindow({
    title: "word-cloud",
    width: 300,
    height: 300,
    resizable: isDev ? true : false,
    backgroundColor: "white",
  });

  // mainWindow.loadURL("https://www.google.com")
  mainWindow.loadFile("./app/about.html");
}

app.on("ready", () => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  //globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  //globalShortcut.register("Ctrl+Shift+I", () => mainWindow.toggleDevTools());

  mainWindow.on("ready", () => {
    mainWindow = null;
  });
});
const menu = [
  {
    role: "fileMenu",
  },
  { label: "Help", submenu: [{ label: "About", click: createAboutWindow }] },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { role: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("wordcloud:create", (e, options) => {
  console.log("ipcMain.on.wordcloud.create:", options);
  log.info("ipcMain.on.wordcloud.create:options=", options);
  log.info("ipcMain.on.wordcloud.create:filename=", slash(options.txtPath));

  var data = fs.readFileSync(slash(options.txtPath));
  log.info("Synchronous read: " + data.toString().slice(0, 50));
  mainWindow.webContents.send("wordcloud:done", data.toString());
});
