import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';


if (started) {
  app.quit();
}

let tray : Tray | null = null;

const getIconPath = () => {

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'healthy-habits-icon.png');
  }

  return path.join(process.cwd(), 'src', 'assets', 'healthy-habits-icon.png');
};
const icon = nativeImage.createFromPath(getIconPath()).resize({width: 16, height: 16});

const createReminderWindow = (type: 'standing' | 'eyes') => {
  
  const reminderWindow = new BrowserWindow({
    width: 400,
    height: 150,           
    frame: false,          
    resizable: false,
    transparent: true,
    focusable: false,      
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  reminderWindow.setIgnoreMouseEvents(true, { forward: true });

  
  reminderWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  reminderWindow.setAlwaysOnTop(true, 'screen-saver');

  const queryString = `?type=${type}`;
  
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    reminderWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + queryString);
  } else {
    reminderWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), 
      { search: queryString }
    );
  }

  // Stand notifications last 5 seconds, Eye breaks last 20 - Unless Dismissed
  if (type == "standing") {
    setTimeout(() => {
      if (!reminderWindow.isDestroyed()) {
        reminderWindow.destroy();
      }
    }, 5000);
  } else {
    setTimeout(() => {
      if (!reminderWindow.isDestroyed()) {
        reminderWindow.destroy();
      }
    }, 20000)
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
}

app.whenReady().then(() => {
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Reminders", 
      submenu: [
        {label: "Eyes", type: "checkbox", checked: true}, 
        {label: "Standing", type: "checkbox", checked: true}, 
        {label: "Drinking", type: "checkbox", checked: true}
      ]},
    { type: "separator" },
    { label: "Dashboard", click: () => createDashboardWindow() },
    { type: "separator" },
    {label: "Quit Healthy Habits", role: 'quit' }]);

  tray.setContextMenu(contextMenu);
  const timerStatus = 60;
  tray.setTitle(`${timerStatus}`);
  setInterval(() => tray.setTitle(`${Number(tray.getTitle()) - 1}`), 1000);
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
