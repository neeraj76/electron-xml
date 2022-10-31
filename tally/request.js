const {convertObjToXml, convertXmlToObj} = require("../xml/convert");
const {tallyApiCall} = require("../services/api");

const flagShowRequest = false;
const flagShowResponse = false;
const flagShowXml = false;

const tallyProcessRequest = (requestObj, callback, reqIdStr) => {
  if (flagShowRequest) {
    console.log(JSON.stringify(requestObj, null, 2));
  }

  // We get an error if there is a space in the Columns name
  const requestXmlStr = convertObjToXml(requestObj);
  if (flagShowRequest && flagShowXml) {
    console.log(`Request:\n${requestXmlStr}`)
  }

  tallyApiCall({req: requestXmlStr})
      .then((responseXmlStr) => {
        if (flagShowResponse && flagShowXml) {
          console.log(`Response:\n${responseXmlStr}`);
        }

        convertXmlToObj(responseXmlStr, (err, responseObj) => {
          if (flagShowResponse) {
            console.log(`Response:\n${JSON.stringify(responseObj, null, 2)}`);
          }
          callback(responseObj, requestObj, reqIdStr);
        });
      })
      .catch((err) => {
        console.log(err);
        console.log('Make sure the Tally Application is running and is reachable on the network');
      });
}

module.exports = {
  tallyProcessRequest
}