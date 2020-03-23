// This is free and unencumbered software released into the public domain.
// See LICENSE for details

const {
  app,
  BrowserWindow,
  Menu,
  protocol,
  ipcMain,
  ipcRenderer,
  dialog
} = require("electron");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
autoUpdater.autoDownload = false;
log.info("App starting...");

//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
let template = [];
if (process.platform === "darwin") {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: "About " + name,
        role: "about"
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click() {
          app.quit();
        }
      }
    ]
  });
}

let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send("message", text);
}
function createDefaultWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}
autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", info => {
  sendStatusToWindow("Version " + info.version + " is available");

  dialog.showMessageBox(win, {
    title: 'Update available',
    type: 'question',
    message:
        "Version " +
        info.version +
        " is ready to be installed. Do you want to install now?",
    buttons: ['Ok', 'Later'],
    defaultId: 1,
    noLink: true,
}, function (response) {
    autoUpdater.logger.info(response);
    if (response === 0) {
        autoUpdater.downloadUpdate()
    }
})

});

autoUpdater.on("error", err => {
  sendStatusToWindow("Error in auto-updater. " + err);
});

app.on("ready", function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createDefaultWindow();
});
app.on("window-all-closed", () => {
  app.quit();
});

app.on("ready", function() {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-downloaded", info => {
  sendStatusToWindow("Update downloaded");
         autoUpdater.quitAndInstall(false, true);
});
