const { notarize } = require('electron-notarize');

console.log('Notarizing App');

exports.default = async function (context) {
  // Notarize only for mac
  console.log(`process.platform=${process.platform}`);

  if (process.platform !== 'darwin') return;

  // let appName = context.package.productFilename;
  let appName = 'TallyPad';
  let appDir = context.appOutDir;

  let params = {
    appBundleId: 'com.glassball.tallyconnect',
    appPath: `${appDir}/${appName}.app`,
    appleId: process.env.appleId,
    appleIdPassword: process.env.appleIdPassword
  };

  // throw JSON.stringify(params);

  console.log(`Notary Params=${JSON.stringify(params)}`);

  // We can include and use package.json
  return await notarize(params);
}
