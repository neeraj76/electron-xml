const { autoUpdater } = require("electron-updater");
const { dialog } = require('electron');

// Configure log debugging
// Log file location
// For macOS: ~/Library/Logs/{app name}/{process type}.log
// For Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
// For linux: ~/.config/{app name}/logs/{process type}.log
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

// Disable auto downloading of updates
autoUpdater.autoDownload = false;

// Single function export to check for and apply any updates
module.exports = () => {
  // Check for update (github releases)
  autoUpdater.logger.log('Initiating a check for updates available');
  autoUpdater.checkForUpdates();

  autoUpdater.once('update-available', () => {
    autoUpdater.logger.log('Update is available');
    // autoUpdater.checkForUpdates();

    // Prompt user to start download
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of TallyPad is available',
      buttons: ['Update', 'No']
    })
        .then(result => {
          let buttonIndex = result.response;
          if (buttonIndex === 0) {
            autoUpdater.downloadUpdate();
          }
        })

  });

  autoUpdater.once('update-downloaded', () => {
    autoUpdater.logger.log('Update has been downloaded');

    // Prompt user to start download
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Install and Restart Now',
      buttons: ['Yes', 'No']
    })
        .then(result => {
          let buttonIndex = result.response;
          if (buttonIndex === 0) {
            autoUpdater.quitAndInstall(false, true);
          }
        })
  });
}

