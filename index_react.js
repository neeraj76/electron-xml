const path = require('path');

const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');

const { processExcelFile } = require('./spreadsheet/excel');
const { processRowTally } = require("./spreadsheet/excel_tally");
const { tallyCheckServer } = require("./tally/request");
const {tallyReadOnlyCommands, tallyCommands, tallyCommandMap} = require("./tally/commands");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
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
            console.error(`tallyCheckTimer: error: ${JSON.stringify(error)}`)
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
  // console.log(tallyReadOnlyCommands);
  mainWindow.webContents.send('command:list:response', tallyReadOnlyCommands);
});

ipcMain.on('command:tally:request', (event, command) => {
  console.log(`Tally Request: ${command}`);

  // This should be moved to a tally promise
  if (tallyCommands.includes(command)) {
    const parameters = [{command}]

    // If the command thing misbehaves then we can pass it in the parameters
    tallyCommandMap[command].handler.apply(null, parameters)
        .then(({response, request}) => {
          // console.log("command:request:Promise response=", response, " request=", request);
          mainWindow.webContents.send('command:response', {request, response});
        });
  }
})

const verifyBankTransaction = (bankTransaction) => {
  return new Promise((resolve, reject) => {
    console.log(JSON.stringify(bankTransaction));
    // (voucher_type, excel_date, debit_ledger, credit_ledger, amount, narration)
    if ('Category' in bankTransaction) {
      const voucher_params = ['Payment', 44652, ""]

    } else {
      reject("Category is missing")
    }
  });
}

// Need bank name for which we have the statement
// Make sure the bank name is added in the ledgers with parent as bank accounts
// We need the conversions in the renderer before the call is made.
const addBankTransactionToTally = (bankTransaction) => {
  return new Promise((resolve, reject) => {
    // console.log(JSON.stringify(bankTransaction));
    // (voucher_type, excel_date, debit_ledger, credit_ledger, amount, narration)
    if ('Category' in bankTransaction) {

      const voucher_params = ['Payment', 44652, bankTransaction.Category, "Bank of India", 900, "Sample Transaction"]
      tallyCommandMap['VOUCHER'].handler.apply(null, voucher_params)
          .then((response) => {
            // console.log("addBankTransactionToTally: Response=", response);
            mainWindow.webContents.send('command:response', response);
            // resolve()
          })
          .catch(error => {
            console.log(`addBankTransactionToTally: Error: ${JSON.stringify(error)}`);
          });

    } else {
      reject("Category is missing")
    }
  });
}

ipcMain.on('command:request', (event, {command, data}) => {
  let response;

  if (command == 'ADD_BANK_TRANSACTIONS') {
    data.map(item => {
      // console.log(item);
      addBankTransactionToTally(item)
          .then(response => {
            console.log("Added successfully");
          })
          // .catch(error => {
          //   console.log(error);
          // })
    })

  } else if (command == 'VERIFY_BANK_TRANSACTIONS') {
    response = data.map(item => {
      // console.log(item);
      return {
        ...item,
        verification: {
          status: "ok",
          reason: ""
        }
      }
    })
  } else {
    console.log(`Command '${command}' not supported`)
  }

  mainWindow.webContents.send('command:response', {command, response});
})