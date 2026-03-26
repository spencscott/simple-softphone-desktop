const { app, BrowserWindow, Tray, Menu, shell, nativeImage, dialog, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store");

const APP_URL = "https://app.simplesoftphone.com";

const store = new Store({
  defaults: {
    launchOnStartup: true,
    minimizeToTray: true,
    windowBounds: { width: 1200, height: 800 },
  },
});

let mainWindow = null;
let tray = null;
let isQuitting = false;
let pendingDialNumber = null;

function getIconPath() {
  if (process.platform === "win32") {
    return path.join(__dirname, "build", "icon.ico");
  }
  return path.join(__dirname, "build", "icon.png");
}

function createWindow() {
  const bounds = store.get("windowBounds");

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 900,
    minHeight: 600,
    title: "SimpleSoftphone.com - AI-powered WebRTC SIP client",
    icon: getIconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-finish-load", () => {
    if (pendingDialNumber) {
      setTimeout(() => {
        deliverDialNumber(pendingDialNumber);
        pendingDialNumber = null;
      }, 1500);
    }
  });

  mainWindow.on("resize", () => {
    const [width, height] = mainWindow.getSize();
    store.set("windowBounds", { width, height });
  });

  mainWindow.on("close", (event) => {
    if (!isQuitting && store.get("minimizeToTray")) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = getIconPath();
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    } else {
      trayIcon = trayIcon.resize({ width: 16, height: 16 });
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip("Simple Softphone");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Simple Softphone",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "Start with Windows",
      type: "checkbox",
      checked: store.get("launchOnStartup"),
      click: (menuItem) => {
        store.set("launchOnStartup", menuItem.checked);
        setAutoLaunch(menuItem.checked);
      },
    },
    {
      label: "Minimize to Tray",
      type: "checkbox",
      checked: store.get("minimizeToTray"),
      click: (menuItem) => {
        store.set("minimizeToTray", menuItem.checked);
      },
    },
    { type: "separator" },
    {
      label: "Quit Simple Softphone",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function setAutoLaunch(enabled) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath("exe"),
  });
}

function parseDialNumber(url) {
  if (!url) return null;
  let number = url;
  if (number.startsWith("tel:")) {
    number = number.replace("tel:", "").replace(/[^0-9+*#]/g, "");
  } else if (number.startsWith("sip:")) {
    number = number.replace("sip:", "").split("@")[0].replace(/[^0-9+*#]/g, "");
  }
  return number || null;
}

function deliverDialNumber(number) {
  if (!mainWindow) return;
  mainWindow.webContents.executeJavaScript(
    `window.dispatchEvent(new CustomEvent('tel-dial', { detail: { number: '${number}' } }));`
  );
}

function handleTelProtocol(url) {
  const number = parseDialNumber(url);
  if (!number) return;

  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    if (mainWindow.webContents.isLoading()) {
      pendingDialNumber = number;
    } else {
      deliverDialNumber(number);
    }
  } else {
    pendingDialNumber = number;
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }

    const telArg = commandLine.find(
      (arg) => arg.startsWith("tel:") || arg.startsWith("sip:")
    );
    if (telArg) {
      handleTelProtocol(telArg);
    }
  });

  let alwaysOnTopTimer = null;

  function popWindowForIncomingCall() {
    if (!mainWindow) return;
    if (alwaysOnTopTimer) {
      clearTimeout(alwaysOnTopTimer);
      alwaysOnTopTimer = null;
    }
    mainWindow.setAlwaysOnTop(true, "screen-saver");
    mainWindow.show();
    mainWindow.focus();
    // Stay above everything for 8 seconds, then revert so user can move other windows on top
    alwaysOnTopTimer = setTimeout(() => {
      if (mainWindow) mainWindow.setAlwaysOnTop(false);
      alwaysOnTopTimer = null;
    }, 8000);
  }

  ipcMain.on("incoming-call", (_event, { callerName, callerNumber }) => {
    popWindowForIncomingCall();
  });

  ipcMain.on("call-ended", () => {
    if (alwaysOnTopTimer) {
      clearTimeout(alwaysOnTopTimer);
      alwaysOnTopTimer = null;
    }
    if (mainWindow) mainWindow.setAlwaysOnTop(false);
  });

  app.whenReady().then(() => {
    if (store.get("launchOnStartup")) {
      setAutoLaunch(true);
    }

    createWindow();
    createTray();

    const telArg = process.argv.find(
      (arg) => arg.startsWith("tel:") || arg.startsWith("sip:")
    );
    if (telArg) {
      handleTelProtocol(telArg);
    }
  });

  app.on("open-url", (_event, url) => {
    handleTelProtocol(url);
  });

  app.on("before-quit", () => {
    isQuitting = true;
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
}
