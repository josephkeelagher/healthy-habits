import { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let tray: Tray | null = null;
let contextMenu: Menu | null = null;
let timerInterval: NodeJS.Timeout | null = null;
let secondsRemaining = 20 * 60; 
let spawnCount = 0;
let timerPaused = false;

const sessionStartTime = Date.now();

let eyesRemindersTriggered = 0;
let eyesRemindersDismissed = 0;
let standRemindersTriggered = 0;
let standRemindersDismissed = 0;

const getIconPath = () => {
  if (app.isPackaged) return path.join(process.resourcesPath, 'healthy-habits-icon.png');
  return path.join(process.cwd(), 'src', 'assets', 'healthy-habits-icon.png');
};

const icon = nativeImage.createFromPath(getIconPath()).resize({ width: 16, height: 16 });

const updateTrayTitle = () => {
  if (!tray) return;
  if (secondsRemaining > 60) {
    tray.setTitle(`${Math.ceil(secondsRemaining / 60)}m`);
  } else {
    tray.setTitle(`${secondsRemaining}s`);
  }
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  const eyesEnabled = contextMenu?.getMenuItemById('eyes-rem')?.checked;
  const standingEnabled = contextMenu?.getMenuItemById('standing-rem')?.checked;

  if (standingEnabled && !eyesEnabled) {
    secondsRemaining = 60 * 60;
  } else {
    secondsRemaining = 20 * 60;
  }

    timerInterval = setInterval(() => {
      if (!timerPaused) {
        secondsRemaining--;
        updateTrayTitle();

        if (secondsRemaining <= 0) {
          if (timerInterval) clearInterval(timerInterval);
          handleSpawn();
        } 
      }
      console.log(`${secondsRemaining} seconds remaining`);
    }, 1000);
};

const handleSpawn = () => {
  const eyesEnabled = contextMenu?.getMenuItemById('eyes-rem')?.checked;
  const standingEnabled = contextMenu?.getMenuItemById('standing-rem')?.checked;

  if (eyesEnabled && standingEnabled) {
    spawnCount++;
    createReminderWindow(spawnCount % 3 === 0 ? 'standing' : 'eyes');
  } else if (standingEnabled) {
    createReminderWindow('standing');
    standRemindersTriggered++;
  } else if (eyesEnabled) {
    createReminderWindow('eyes');
    eyesRemindersTriggered++;
  } else {
    secondsRemaining = 20 * 60;
    startTimer();
  }
};

const createReminderWindow = (type: 'standing' | 'eyes') => {
  const reminderWindow = new BrowserWindow({
    width: 400,
    height: 250,
    frame: false,
    resizable: false,
    transparent: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
  });

  reminderWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  reminderWindow.setAlwaysOnTop(true, 'screen-saver');

  reminderWindow.on('closed', () => {
    startTimer();
  });

  ipcMain.once('dismiss-reminder', () => {
    if (!reminderWindow.isDestroyed()) {
      reminderWindow.destroy();
      if (type === 'standing') standRemindersDismissed++;
      else eyesRemindersDismissed++;
    }
  });

  const queryString = `?type=${type}`;
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    reminderWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + queryString);
  } else {
    reminderWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { search: queryString }
    );
  }
};

const createDashboardWindow = () => {
  const dashboardWindow = new BrowserWindow({
    width: 400,
    height: 400,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    dashboardWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + '/dashboard.html');
  } else {
    dashboardWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/dashboard.html`),
    );
  }
};




app.whenReady().then(() => {
  tray = new Tray(icon);
  updateTray();
  startTimer();
});

const updateTray = () => {
  contextMenu = Menu.buildFromTemplate([
    {
      label: "Reminders",
      submenu: [
        { id: 'eyes-rem', label: "Eyes", type: "checkbox", checked: true, click: () => startTimer() },
        { id: 'standing-rem', label: "Standing", type: "checkbox", checked: true, click: () => startTimer() }
      ]
    },
    { type: "separator" },
    { 
      id: 'pause-btn', 
      label: timerPaused ? "⏵ Resume" : "⏸ Pause",  
      click: () => {
        timerPaused = !timerPaused;
        updateTray();
      }
    },
    { label: "↺ Restart", click: () => startTimer() },
    { type: "separator" },
    { label: "Dashboard", click: () => createDashboardWindow() },
    { type: "separator" },
    { label: "Quit Healthy Habits", role: 'quit' }
  ]);

  tray?.setContextMenu(contextMenu);
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    const sessionTimeSeconds = Math.floor((Date.now() - sessionStartTime) / 1000)
  }
});
