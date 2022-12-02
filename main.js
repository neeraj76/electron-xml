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
  console.log('Creating mainWindow');

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
  const tallyHealthInterval = setInterval(() => {
    tallyCheckServer()
        .then(response => {
          mainWindow?.webContents.send('tally:server:status:health', response.status === 'Success');
        })
        .catch(error => {
          mainWindow?.webContents.send('tally:server:status:health', false);
        });
  }, 2000);

  // Check for updates after three seconds
  const updateTimeout = setTimeout(updater, 3000);

  mainWindow.on('closed', function () {
    console.log('mainWindow closed');
    mainWindow = null
    clearInterval(tallyHealthInterval);
    clearTimeout(updateTimeout);
  });
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
        mainWindow?.webContents.send('tally:server:status', response.status === 'Success');
      })
      .catch(error => {
        mainWindow?.webContents.send('tally:server:status', false);
      });
});

ipcMain.on('excel:file:processor', (event, files) => {
  files.forEach(filePath => {
    console.log(`Received File:`, filePath);
    processExcelFile(filePath, processRowTally);
  });

  mainWindow?.webContents.send('excel:file:processor', files);
});

ipcMain.on('command:list', (event) => {
  // console.log(tallyReadOnlyCommands);
  mainWindow?.webContents.send('command:list', tallyReadOnlyCommands);
});

function executeTallyCommand(command, parameters) {
  // This should be moved to a tally promise
  return new Promise((resolve, reject) => {
    if (tallyCommands.includes(command)) {
      const args = [{command, parameters}]

      // If the command thing misbehaves then we can pass it in the parameters
      tallyCommandMap[command].handler.apply(null, args)
          .then(({response, request}) => {
            resolve({request, response})
          })
          .catch(error => {
            reject(error);
          });
    }
  })

}

ipcMain.on('tally:command', (event, {command, targetCompany}) => {
  // console.log(`Tally Request: ${command}. Old format, to be called only from dropdown.`);
  executeTallyCommand(command, {targetCompany})
      .then(({request, response})  => {
        mainWindow?.webContents.send('tally:command', {request, response});
      });
});

ipcMain.on('tally:command:ledgers:list', (event, {targetCompany}) => {
  // console.log(`Tally Request: ${parameters.targetCompany}`);
  executeTallyCommand('LEDGERS', {targetCompany})
      .then(({request, response}) => {
        mainWindow?.webContents.send('tally:command:ledgers:list', {request, response});
      });
});

ipcMain.on('tally:command:companies:list', (event, parameters) => {
  // console.log(`Tally Request: ${parameters}`);
  executeTallyCommand('COMPANIES')
      .then(({request, response})  => {
        mainWindow?.webContents.send('tally:command:companies:list', {request, response});
      })
      .catch(error => {
        console.error(`tally:command:companies:list: error=${error}`)
      });
});

ipcMain.on('tally:command:companies:current', (event, parameters) => {
  // console.log(`Tally Request: ${JSON.stringify(parameters)}`);
  executeTallyCommand('CURRENTCOMPANY')
      .then(({request, response})  => {
        mainWindow?.webContents.send('tally:command:companies:current', {request, response});
      })
      .catch(error => {
        console.error(`tally:command:companies:current: error=${error}`)
      });
});

// Need bank name for which we have the statement
// Make sure the bank name is added in the ledgers with parent as bank accounts
// We need the conversions in the renderer before the call is made.
const addBankTransactionToTally = (bankTransaction, targetCompany) => {
  const debugFn = false;

  return new Promise((resolve, reject) => {
    if (!('Bank' in bankTransaction) || bankTransaction.Bank === "") {
      throw `'Bank' is not specified in the transaction`;
    }

    if ('Category' in bankTransaction) {
      if (debugFn) {
        console.log(`addBankTransactionToTally: bankTransaction=${JSON.stringify(bankTransaction, null, 2)}`);
      }

      const transactionDate = DateFromString(bankTransaction['Transaction Date']);
      const voucherDate = DateFromString(bankTransaction['Value Date']);
      if (debugFn) {
        console.log(`transactionDate=${transactionDate}`);
        console.log(`valueDate=${voucherDate}`);
      }

      // TBD: Is there a way to specify ValueDate in a voucher
      // Now we can integrate the actual voucher
      let voucherType;
      let amount;
      if (Object.keys(bankTransaction).includes('Debit')) {
        voucherType = 'Payment';
        amount = bankTransaction.Debit;
      } else if (Object.keys(bankTransaction).includes('Credit')) {
        voucherType = 'Receipt';
        amount = bankTransaction.Credit;
      } else {
        throw `Either of 'Debit' or 'Credit' has to be present.`
      }
      // targetCompany, voucherType, voucherDate, debitLedger, creditLedger, amount, narration
      const voucherParams = [
        {
          targetCompany,
          voucherType,
          voucherDate,
          debitLedger: bankTransaction.Category,
          creditLedger: bankTransaction.Bank,
          amount,
          narration: bankTransaction.Description
        }
      ];

      tallyCommandMap['VOUCHER'].handler.apply(null, voucherParams)
          .then((response) => {
            console.log("addBankTransactionToTally: Response=", response);
            response['id'] = bankTransaction.id;
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
    } else {
      reject("Category is missing")
    }
  });
}

ipcMain.on('tally:command:vouchers:add', (event, {targetCompany, rows}) => {
  const promises = rows.map((row) => {
    return addBankTransactionToTally(row, targetCompany);
  });

  Promise.all(promises)
      .then((results) => {
        // console.log(results);
        mainWindow?.webContents.send('tally:command:vouchers:add', results);
      })
      .catch(error => {
        console.log(error);
      });

});
