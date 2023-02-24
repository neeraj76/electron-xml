const path = require('path');

const { app, Menu, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const Storage = require('electron-store');
const log = require('electron-log');

const { processExcelFile } = require('./spreadsheet/excel');
const { processRowTally } = require("./spreadsheet/excel_tally");

const { tallyCheckServer, tallyInitServer} = require("@glassball/tally");
const {getTallyReadOnlyCommands, getTallyCommands, getTallyCommandMap} = require("@glassball/tally");
const {getBaseMenuTemplate, closeWindow, activateWindow} = require("@glassball/electron-menu-base");
const updater = require('./updater');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


let mainMenu;
let mainWindow;

let tallyHealthInterval;
let updateTimeout;
let localStorage;

const appConfig = {
  app,
  server: {
    host: 'localhost',
    port: 9000
  },
  createWindow
}


function createWindow() {
  console.log('Creating mainWindow');

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      // enableRemoteModule: true,
      contextIsolation: false
    },
  });
  appConfig.mainWindow = mainWindow;

  if (isDev) {
    const clientPort = 3000;
    const url = `http://localhost:${clientPort}`;
    mainWindow.loadURL(url)
        .then(response => {
          console.log(`URL ${url} loaded successfully`);
        })
        .catch(error => {
          if (error.code === 'ERR_CONNECTION_REFUSED') {
            mainWindow.loadFile(path.join(__dirname, 'error.html'));
            return;
          }
          // throw error;
        });
  } else {
    const uiPackage = `@glassball/tallymate-ui`;
    const packagePath = require.resolve(`${uiPackage}/build/index.html`)
    // console.log('packagePath:', packagePath);
    log.info('packagePath:', packagePath);
    mainWindow.loadFile(packagePath);
  }


  // Open the DevTools.
  if (isDev) {
    // win.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', function () {
    console.log('mainWindow closed');
    stopTallyHealthMonitor();
    appConfig.mainWindow = null
    closeWindow(appConfig);
  });

  mainMenu = Menu.buildFromTemplate(getBaseMenuTemplate(appConfig));
  Menu.setApplicationMenu(mainMenu);
  appConfig.mainMenu = mainMenu;
}

const startTallyHealthMonitor = () => {
  // Start a pingTimer
  tallyHealthInterval = setInterval(() => {
    tallyCheckServer()
        .then(response => {
          mainWindow?.webContents.send('tally:server:status:health', response.status === 'Success');
        })
        .catch(error => {
          mainWindow?.webContents.send('tally:server:status:health', false);
        });
  }, 2000);

  // Check for updates after three seconds
  updateTimeout = setTimeout(updater, 3000);
}

const stopTallyHealthMonitor = () => {
  if (tallyHealthInterval) {
    clearInterval(tallyHealthInterval);
  }
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log('event:ready');
  localStorage = new Storage();

  if (localStorage) {
    serverAddr = localStorage.get('server');
    console.log('serverAddr:', serverAddr);
  } else {
    localStorage.set('server', appConfig.server)
  }

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log('event:window-all-closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('event:activate');
  activateWindow(appConfig);
});

ipcMain.on('tally:ui:ready', (event) => {
  const server = localStorage.get('server');
  console.log(`tally:ready: ${JSON.stringify(server)}`);
  appConfig.mainWindow?.webContents.send('tally:ui:ready', server);
});

ipcMain.on('tally:server:get', (event) => {
  const server = localStorage.get('server');
  console.log(`tally:ready: ${JSON.stringify(server)}`);
  appConfig.mainWindow?.webContents.send('tally:server:get', server);
});


ipcMain.on('tally:server:set', (event, {serverAddr}) => {
  console.log(`tally:server:set serverAddr=${JSON.stringify(serverAddr)}`);
  if (localStorage) {
    localStorage.set('server', serverAddr);
  }

  tallyInitServer(serverAddr)
      .then(response => {
        mainWindow?.webContents.send('tally:server:set', response.status === 'Success');
        tallyCheckServer()
          .then(response => {
            startTallyHealthMonitor();
            mainWindow?.webContents.send('tally:server:set', response);
          })
          .catch(error => {
            // throw error
            console.error(`Error: ${JSON.stringify(error)}`);
            mainWindow?.webContents.send('tally:server:set', error);
          });
      })
      .catch(error => {
        mainWindow?.webContents.send('tally:server:set', {status: "Failed", reason: JSON.stringify(error)});
      });
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
  // console.log(getTallyReadOnlyCommands());
  mainWindow?.webContents.send('command:list', getTallyReadOnlyCommands());
});

function executeTallyCommand(command, parameters) {
  // This should be moved to a tally promise
  return new Promise((resolve, reject) => {
    if (getTallyCommands().includes(command)) {
      const args = [{command, parameters}]

      // If the command thing misbehaves then we can pass it in the parameters
      getTallyCommandMap()[command].handler.apply(null, args)
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
  executeTallyCommand(command, {targetCompany})
      .then(({request, response})  => {
        mainWindow?.webContents.send('tally:command', {request, response});
      });
});

ipcMain.on('tally:command:ledgers:list', (event, {targetCompany}) => {
  // console.log(`tally:command: targetCompany=${targetCompany}`);
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

const getVoucherFields = (voucher, bank, values) => {
  // TBD: Is there a way to specify ValueDate in a voucher
  // Now we can integrate the actual voucher
  let voucherType;
  let amount;
  let debitLedger;
  let creditLedger;
  let narration;

  // console.log(`voucher=${JSON.stringify(voucher, null, 2)}`);

  if (values) {
    if (values.category) {
      if (voucher.debit) {
        voucherType = 'Payment';
        amount = voucher.debit;
        debitLedger = values.category;
        creditLedger = bank;
      } else if (voucher.credit) {
        voucherType = 'Receipt';
        amount = voucher.credit;
        debitLedger = bank;
        creditLedger = values.category;
      } else {
        throw `Either of 'debit' or 'credit' has to be present.`
      }
    }
  } else {
    if (voucher.debit) {
      voucherType = 'Payment';
      amount = voucher.debit;
      debitLedger = voucher.category;
      creditLedger = bank;
    } else if (voucher.credit) {
      voucherType = 'Receipt';
      amount = voucher.credit;
      debitLedger = bank;
      creditLedger = voucher.category;
    } else {
      throw `Either of 'debit' or 'credit' has to be present.`
    }
  }

  if (values) {
    if (values.description) {
      narration = values.description
    }
  } else {
    narration = voucher.description;
  }

  return {voucherType, amount, debitLedger, creditLedger, narration};
}

// Need bank name for which we have the statement
// Make sure the bank name is added in the ledgers with parent as bank accounts
// We need the conversions in the renderer before the call is made.
const addBankTransactionToTally = (voucher, targetCompany, bank) => {
  const debugFn = false;

  return new Promise((resolve, reject) => {
    if (!bank) {
      throw `'bank' is not specified`;
    }

    if ('category' in voucher) {
      if (debugFn) {
        console.log(`addBankTransactionToTally: bankTransaction=${JSON.stringify(voucher, null, 2)}`);
      }

      // const transactionDate = DateFromDateString(voucher['transactionDate']);
      // const voucherDate = getVoucherDate(voucher);
      const voucherDate = voucher.valueDate;
      if (debugFn) {
        // console.log(`transactionDate=${transactionDate}`);
        console.log(`valueDate=${voucher.valueDate}`);
      }

      const {voucherType, amount, debitLedger, creditLedger, narration} = getVoucherFields(voucher, bank);

      // targetCompany, voucherType, voucherDate, debitLedger, creditLedger, amount, narration
      const voucherParams = [
        {
          targetCompany,
          voucherType,
          voucherDate,
          debitLedger,
          creditLedger,
          amount,
          narration
        }
      ];

      // console.log(`voucherParams:${JSON.stringify(voucherParams, null, 2)}`);

      getTallyCommandMap()['VOUCHER_ADD'].handler.apply(null, voucherParams)
          .then((response) => {
            if (debugFn) {
              console.log("addBankTransactionToTally: response=", response);
            }
            response.id = voucher.id;
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
    } else {
      reject("category is missing")
    }
  });
}

const deleteTransactionFromTally = (voucher, targetCompany) => {
  const debugFn = false;
  return new Promise((resolve, reject) => {
    if (debugFn) {
      console.log(JSON.stringify(voucher));
    }

    const voucherParams = [
      {
        targetCompany,
        voucherType: "Mock",
        // voucherDate: getVoucherDate(voucher),
        voucherDate: voucher.valueDate,
        masterId: voucher.voucherId
      }
    ];

    getTallyCommandMap()['VOUCHER_DELETE'].handler.apply(null, voucherParams)
        .then((response) => {
          if (debugFn) {
            console.log("deleteTransactionFromTally: response=", response);
          }
          response.id = voucher.id;
          response.voucherId = voucher.voucherId;
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
  });
}

const modifyTransactionInTally = (voucher, targetCompany, bank, values) => {
  return new Promise((resolve, reject) => {

    if (values) {
      if (!Object.keys(values).includes("category") && !Object.keys(values).includes("description")) {
        console.log(`Only 'category' or 'description' can be modified`)
        return;
      }
    }

    const {voucherType, amount, debitLedger, creditLedger, narration} = getVoucherFields(voucher, bank, values);

    const voucherParams = [
      {
        targetCompany,
        voucherType,
        // voucherDate: getVoucherDate(voucher),
        voucherDate: voucher.valueDate,
        masterId: voucher.voucherId,
        debitLedger,
        creditLedger,
        amount,
        narration
      }
    ];

    // console.log(`voucherParams:${JSON.stringify(voucherParams, null, 2)}`);

    getTallyCommandMap()['VOUCHER_MODIFY'].handler.apply(null, voucherParams)
        .then((response) => {
          // console.log("modifyTransactionInTally: response=", response);
          response.id = voucher.id;
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
  });
}

ipcMain.on('tally:command:vouchers:add', (event, {targetCompany, vouchers, bank}) => {
  console.log(`Vouchers:${JSON.stringify(vouchers, null, 2)}`);
  // console.log(`bank:${bank} targetCompany:${targetCompany}`);

  const promises = vouchers.map(voucher => {
    return addBankTransactionToTally(voucher, targetCompany, bank);
  });

  Promise.all(promises)
      .then((results) => {
        console.log(results);
        mainWindow?.webContents.send('tally:command:vouchers:add', results);
      })
      .catch(error => {
        console.log(error);
        mainWindow?.webContents.send('tally:command:vouchers:add', {error});
      });

});

ipcMain.on('tally:command:vouchers:delete', (event, {targetCompany, vouchers}) => {
  console.log(`Delete Vouchers:${JSON.stringify(vouchers.map(voucher => voucher.voucherId), null, 2)}`);
  // console.log(`targetCompany:${targetCompany}`);

  const promises = vouchers.map((voucher) => {
    return deleteTransactionFromTally(voucher, targetCompany);
  });

  Promise.all(promises)
      .then((results) => {
        console.log(results);
        mainWindow?.webContents.send('tally:command:vouchers:delete', results);
      })
      .catch(error => {
        console.log(error);
        mainWindow?.webContents.send('tally:command:vouchers:delete', {error});
      });

});

ipcMain.on('tally:command:vouchers:modify', (event, {targetCompany, vouchers, bank, values}) => {
  console.log(`targetCompany=${targetCompany} bank=${bank} values=${JSON.stringify(values)}`);

  const promises = vouchers.map((voucher) => {
    return modifyTransactionInTally(voucher, targetCompany, bank, values);
  });

  Promise.all(promises)
      .then((results) => {
        console.log(results);
        mainWindow?.webContents.send('tally:command:vouchers:modify', results);
      })
      .catch(error => {
        console.log(error);
        mainWindow?.webContents.send('tally:command:vouchers:modify', {error});
      });

});