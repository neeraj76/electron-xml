const path = require('path');

const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');

const { processExcelFile } = require('./spreadsheet/excel');
const { processRowTally } = require("./spreadsheet/excel_tally");
const { tallyCheckServer } = require("./tally/request");
const {tallyReadOnlyCommands, tallyCommands, tallyCommandMap} = require("./tally/commands");
const {DateFromString} = require("./utils/date");

const updater = require('./updater');

// Stephen Grider's udemy electron video
// const _ = require('lodash');

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      // enableRemoteModule: true,
      contextIsolation: false
    },
  });

  // and load the local.html of the app.
  // win.loadFile("local.html");
  mainWindow.loadURL(
      isDev
          ? 'http://localhost:3000'
          : `file://${path.join(__dirname, '../index.html')}`
  );

  // Open the DevTools.
  if (isDev) {
    // win.webContents.openDevTools({ mode: 'detach' });
  }

  // Start a pingTimer
  const tallyCheckTimer = setInterval(() => {
    tallyCheckServer()
        .then(response => {
          mainWindow.webContents.send('tally:server:status:health', response.status === 'Success');
        })
        .catch(error => {
          mainWindow.webContents.send('tally:server:status:health', false);
        });
  }, 10000);

  // Check for updates after three seconds
  setTimeout(updater, 3000);
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

ipcMain.on('tally:server:status', (event,) => {
  tallyCheckServer()
      .then(response => {
        mainWindow.webContents.send('tally:server:status', response.status === 'Success');
      })
      .catch(error => {
        mainWindow.webContents.send('tally:server:status', false);
      });
});

ipcMain.on('excel:file:processor', (event, files) => {
  files.forEach(filePath => {
    console.log(`Received File:`, filePath);
    processExcelFile(filePath, processRowTally);
  });

  mainWindow.webContents.send('excel:file:processor', files);
});

ipcMain.on('command:list', (event) => {
  // console.log(tallyReadOnlyCommands);
  mainWindow.webContents.send('command:list', tallyReadOnlyCommands);
});

function executeTallyCommand(command) {
  // This should be moved to a tally promise
  return new Promise((resolve, reject) => {
    if (tallyCommands.includes(command)) {
      const parameters = [{command}]

      // If the command thing misbehaves then we can pass it in the parameters
      tallyCommandMap[command].handler.apply(null, parameters)
          .then(({response, request}) => {
            console.log("command:request:Promise response=", JSON.stringify(response, null, 2), " request=", request);
            // mainWindow.webContents.send('command:response', {request, response});
            resolve(response)
          })
          .catch(error => {
            // console.log(`command:tally:request  command=${command}`, error);
            reject(error);
          });
    }
  })

}

ipcMain.on('tally:command', (event, command) => {
  console.log(`Tally Request: ${command}. Old format, to be called only from dropdown.`);
  executeTallyCommand(command)
      .then(response => {
        mainWindow.webContents.send('tally:command', {command, response});
      });
})

ipcMain.on('command:tally:ledgers:get', (event, command) => {
  console.log(`Tally Request: ${command}`);
  executeTallyCommand('LEDGERS')
      .then(response => {
        mainWindow.webContents.send('command:tally:ledgers:get', {command, response});
      });
})


// Need bank name for which we have the statement
// Make sure the bank name is added in the ledgers with parent as bank accounts
// We need the conversions in the renderer before the call is made.
const addBankTransactionToTally = (bankTransaction) => {
  const debugFn = false;

  return new Promise((resolve, reject) => {
    if ('Category' in bankTransaction) {
      if (debugFn) {
        console.log(`addBankTransactionToTally: bankTransaction=${JSON.stringify(bankTransaction, null, 2)}`);
      }

      const transactionDate = DateFromString(bankTransaction['Transaction Date']);
      const valueDate = DateFromString(bankTransaction['Value Date']);
      if (debugFn) {
        console.log(`transactionDate=${transactionDate}`);
        console.log(`valueDate=${valueDate}`);
      }

      // TBD: Is there a way to specify ValueDate in a voucher
      // Now we can integrate the actual voucher
      let voucher_type;
      let voucher_amount;
      if (Object.keys(bankTransaction).includes('Debit')) {
        voucher_type = 'Payment';
        voucher_amount = bankTransaction.Debit;
      } else if (Object.keys(bankTransaction).includes('Credit')) {
        voucher_type = 'Receipt';
        voucher_amount = bankTransaction.Credit;
      } else {
        throw `Either of 'Debit' or 'Credit' has to be present.`
      }

      const voucher_params = [
        voucher_type,
        valueDate,
        bankTransaction.Category,
        bankTransaction.Bank,
        voucher_amount,
        bankTransaction.Description
      ];

      tallyCommandMap['VOUCHER'].handler.apply(null, voucher_params)
          .then((response) => {
            // console.log("addBankTransactionToTally: Response=", response);
            // mainWindow.webContents.send('command:response', response);
            // resolve()
            response['id'] = bankTransaction.id;
            resolve(response);
          })
          .catch(error => {
            // console.log(`addBankTransactionToTally: Error: ${JSON.stringify(error)}`);
            reject(error);
          });
    } else {
      reject("Category is missing")
    }
  });
}

ipcMain.on('command:vouchers:request', (event, {command, data}) => {
  if (command == 'ADD_BANK_TRANSACTIONS') {
    // console.log("Promise.All()");

    const promises = data.map((row) => {
      return addBankTransactionToTally(row);
    });

    Promise.all(promises)
        .then((results) => {
          // console.log(results);
          mainWindow.webContents.send('command:vouchers:response', {command, results});
        })
        .catch(error => {
          console.log(error);
        });
  } else {
    console.log(`Command '${command}' not supported`)
  }

})