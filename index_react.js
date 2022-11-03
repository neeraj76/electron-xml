const path = require('path');

const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');

const { processExcelFile } = require('./spreadsheet/excel');
const { processRowTally } = require("./spreadsheet/excel_tally");
const { tallyCheckServer } = require("./tally/request");
const {tallyCommands, tallyCommandMap} = require("./tally/commands");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      // enableRemoteModule: true,
      contextIsolation: false
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  mainWindow.loadURL(
      isDev
          ? 'http://localhost:3000'
          : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Open the DevTools.
  if (isDev) {
    // win.webContents.openDevTools({ mode: 'detach' });
  }

  // setInterval, setTimeout
  const flagDebugTallyPing = false;
  const tallyCheckTimer = setInterval(() => {
    tallyCheckServer()
        .then(response => {
          if (flagDebugTallyPing) {
            console.log(`response: ${JSON.stringify(response)}`)
          }
          mainWindow.webContents.send('tally:server:status', response.status === 'Success');
        })
        .catch(error => {
          if (flagDebugTallyPing) {
            console.error(`error: ${JSON.stringify(error)}`)
          }
          mainWindow.webContents.send('tally:server:status', false);
        });
  }, 5000);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('excel:submit', (event, files) => {
  files.forEach(filePath => {
    console.log(`Received File:`, filePath);
    processExcelFile(filePath, processRowTally);
  });

  mainWindow.webContents.send('excel:processed', files);
})

ipcMain.on('command:list:request', (event) => {
  mainWindow.webContents.send('command:list:response', tallyCommands);
});

ipcMain.on('command:request', (event, command) => {
  console.log(`Execute command: ${command}`);

  if (tallyCommands.includes(command)) {
    const parameters = [];
    tallyCommandMap[command].handler.apply(null, parameters);
  }
})
