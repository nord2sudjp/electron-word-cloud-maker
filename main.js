const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const log = require("electron-log");
const slash = require("slash");
const fs = require("fs");
const lineByLine = require("n-readlines");

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

  //wc = sort_wmap(wordcount(data.toString()));
  //wc = Object.entries(wc).slice(0, 100);
  //log.info(wc);
  wc = wordcount(data.toString());
  wc = make_aaray(wc);
  wc = sort_wmap(wc);
  log.info("ipcMain.on.wordcloud.create:result of wc-", wc.slice(0, 10));
  mainWindow.webContents.send("wordcloud:counted", wc.slice(0, 10));
  mainWindow.webContents.send("wordcloud:done", data.toString());
});

function wordcount(data) {
  var words = data.split(/\s+/);

  // create map for word counts
  var wmap = {};
  words.forEach(function (key) {
    if (wmap.hasOwnProperty(key)) {
      wmap[key]++;
    } else {
      wmap[key] = 1;
    }
  });
  log.info("wordcount:" + Object.keys(wmap).length);
  return wmap;
}

function make_aaray(wmap) {
  // sort by count in descending order
  var smap = [];
  for (var key in wmap) {
    // Use this function to iterate over each item in the list
    t = { word: key, count: wmap[key] };
    smap.push(t);
  }
  // smap = Object.keys(wmap).map(function (key) {
  //   return {
  //     word: key,
  //     count: wmap[key],
  //   };
  // });

  return smap;
}

function sort_wmap(smap) {
  smap.sort(function (a, b) {
    //return a.total - b.total;
    return a.count < b.count ? 1 : -1;
  });
  log.info("sort_wmap:" + Object.keys(smap).length, smap.slice(1, 10));
  return smap;
}

function dic_slice(obj, start, end) {
  var sliced = {};
  var i = 0;
  for (var k in obj) {
    if (i >= start && i < end) sliced[k] = obj[k];

    i++;
  }

  return sliced;
}
